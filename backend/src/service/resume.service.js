import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/AppError.js';
import { structureResume } from './resumeParser.service.js';
import { calculateATSScore } from './atsScore.service.js';
import { generateSuggestions } from './suggestions.service.js';
import { Resume, ResumeAnalysis, ResumeSuggestions } from '../model/index.js';
import { sequelize } from '../config/database.js';
import { dropLegacyTextHashUniques } from '../config/resumeSchema.js';
import crypto from 'crypto';

const isUniqueConstraintError = error =>
  error?.name === 'SequelizeUniqueConstraintError' ||
  error?.parent?.code === '23505';

const findResumeByHash = (textHash, userId) =>
  Resume.findOne({
    where: { textHash, userId },
    include: [
      { model: ResumeAnalysis, as: 'analysis' },
      { model: ResumeSuggestions, as: 'suggestions' },
    ],
  });

const respondWithExistingResume = async (resume, file, extractedText) => {
  if (resume.status === 'failed') {
    await resume.update({
      status: 'processing',
      extractedText,
      fileName: file.originalname,
      fileType: file.mimetype,
    });

    processResumeInBackground(resume.id, extractedText).catch(err =>
      console.error('Background processing failed to start:', err)
    );

    return { resumeId: resume.id, status: 'processing' };
  }

  if (resume.status !== 'completed') {
    return { resumeId: resume.id, status: resume.status };
  }

  return {
    resumeId: resume.id,
    status: resume.status,
    extractedText: resume,
    ats_score: resume.analysis
      ? {
          score: resume.analysis.ats_score,
          breakdown: resume.analysis.breakdown,
        }
      : null,
    suggestions: resume.suggestions,
  };
};

export const uploadResumeService = async (file, userId) => {
  if (!file || !file.buffer) {
    throw new AppError(
      'No file buffer received — check multer config (memoryStorage + correct field name)',
      400
    );
  }

  if (!userId) {
    throw new AppError('Please log in to continue', 401);
  }

  let parser;

  try {
    parser = new PDFParse({ data: new Uint8Array(file.buffer) });
    const result = await parser.getText();
    const textHash = crypto
      .createHash('sha256')
      .update(result.text.trim())
      .digest('hex');

    const existingResume = await findResumeByHash(textHash, userId);
    if (existingResume) {
      return respondWithExistingResume(existingResume, file, result.text);
    }

    let createdResume;
    try {
      createdResume = await Resume.create({
        fileName: file.originalname,
        fileType: file.mimetype,
        extractedText: result.text,
        textHash,
        userId,
        status: 'processing',
      });
    } catch (createError) {
      if (!isUniqueConstraintError(createError)) throw createError;

      const own = await findResumeByHash(textHash, userId);
      if (own) return respondWithExistingResume(own, file, result.text);

      await dropLegacyTextHashUniques();
      createdResume = await Resume.create({
        fileName: file.originalname,
        fileType: file.mimetype,
        extractedText: result.text,
        textHash,
        userId,
        status: 'processing',
      });
    }

    processResumeInBackground(createdResume.id, result.text).catch(err =>
      console.error('Background processing failed to start:', err)
    );

    return {
      resumeId: createdResume.id,
      status: 'processing',
    };
  } catch (error) {
    console.error('PDF parsing/DB error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to process resume, please try again', 500);
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (e) {
        console.error('Parser cleanup failed:', e);
      }
    }
  }
};

const processResumeInBackground = async (resumeId, text) => {
  try {
    console.log(`Background processing started for resume ${resumeId}`);

    const structuredResume = await structureResume(text);
    const atsResult = await calculateATSScore(structuredResume);

    let suggestions = [];
    try {
      suggestions = await generateSuggestions(structuredResume, atsResult);
    } catch (sugErr) {
      console.error(
        'Suggestions failed (continuing with ATS score only):',
        sugErr?.message || sugErr
      );
    }

    await sequelize.transaction(async t => {
      const existing = await ResumeAnalysis.findOne({
        where: { resumeId },
        transaction: t,
      });

      if (existing) {
        await existing.update(
          {
            ats_score: atsResult.score,
            breakdown: atsResult.breakdown,
          },
          { transaction: t }
        );
      } else {
        await ResumeAnalysis.create(
          {
            resumeId,
            ats_score: atsResult.score,
            breakdown: atsResult.breakdown,
          },
          { transaction: t }
        );
      }

      await ResumeSuggestions.destroy({ where: { resumeId }, transaction: t });

      if (suggestions.length) {
        await ResumeSuggestions.bulkCreate(
          suggestions.map(s => ({
            resumeId,
            category: s.category,
            priority: s.priority,
            issue: s.issue,
            suggestion: s.suggestion,
            original_text: s.originalText,
            improved_text: s.improvedText,
          })),
          { transaction: t }
        );
      }

      await Resume.update(
        { status: 'completed' },
        { where: { id: resumeId }, transaction: t }
      );
    });
  } catch (error) {
    console.error(
      'Background LLM processing failed:',
      error?.message || error,
      error?.stack
    );
    await Resume.update({ status: 'failed' }, { where: { id: resumeId } });
  }
};

export const getAllResumesService = async (
  userId,
  { page = 1, limit = 10 } = {}
) => {
  const empty = {
    items: [],
    pagination: { page: 1, limit, total: 0, totalPages: 0 },
    stats: { total: 0, completed: 0, averageScore: null, latestScore: null },
  };

  if (!userId) return empty;

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const { rows, count } = await Resume.findAndCountAll({
    where: { userId },
    include: [
      {
        model: ResumeAnalysis,
        as: 'analysis',
        attributes: ['ats_score', 'breakdown'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: safeLimit,
    offset,
    distinct: true,
  });

  const items = rows.map(resume => ({
    resumeId: resume.id,
    fileName: resume.fileName,
    fileType: resume.fileType,
    status: resume.status,
    createdAt: resume.createdAt,
    atsScore: resume.analysis?.ats_score ?? null,
    breakdown: resume.analysis?.breakdown ?? null,
  }));

  const allForStats = await Resume.findAll({
    where: { userId },
    include: [
      {
        model: ResumeAnalysis,
        as: 'analysis',
        attributes: ['ats_score'],
      },
    ],
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'status'],
  });

  const completedScores = allForStats
    .filter(r => r.status === 'completed' && typeof r.analysis?.ats_score === 'number')
    .map(r => r.analysis.ats_score);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      totalPages: Math.ceil(count / safeLimit) || 0,
    },
    stats: {
      total: count,
      completed: completedScores.length,
      averageScore: completedScores.length
        ? Math.round(
            completedScores.reduce((a, b) => a + b, 0) / completedScores.length
          )
        : null,
      latestScore: completedScores[0] ?? null,
    },
  };
};

export const getResumeByIdService = async (resumeId, userId) => {
  const resume = await Resume.findOne({
    where: { id: resumeId, userId },
    include: [
      { model: ResumeAnalysis, as: 'analysis' },
      { model: ResumeSuggestions, as: 'suggestions' },
    ],
  });

  if (!resume) throw new AppError('Resume not found', 404);

  return {
    resumeId: resume.id,
    fileName: resume.fileName,
    fileType: resume.fileType,
    status: resume.status,
    createdAt: resume.createdAt,
    ats_score: resume.analysis
      ? { score: resume.analysis.ats_score, breakdown: resume.analysis.breakdown }
      : null,
    suggestions: resume.suggestions ?? [],
  };
};

export const deleteResumeService = async (resumeId, userId) => {
  const resume = await Resume.findOne({
    where: { id: resumeId, userId },
  });

  if (!resume) throw new AppError('Resume not found', 404);

  await resume.destroy();
  return { deleted: true, resumeId: Number(resumeId) };
};

export const getResumeStatusService = async (resumeId, userId) => {
  const resume = await Resume.findOne({
    where: { id: resumeId, userId },
    include: [
      { model: ResumeAnalysis, as: 'analysis' },
      { model: ResumeSuggestions, as: 'suggestions' },
    ],
  });

  if (!resume) throw new AppError('Resume not found', 404);

  return {
    resumeId: resume.id,
    fileName: resume.fileName,
    status: resume.status,
    ats_score: resume.analysis
      ? { score: resume.analysis.ats_score, breakdown: resume.analysis.breakdown }
      : null,
    suggestions: resume.suggestions ?? [],
  };
};
