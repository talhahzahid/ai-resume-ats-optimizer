import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/AppError.js';
import { structureResume } from './resumeParser.service.js';
import { calculateATSScore } from './atsScore.service.js';
import { generateSuggestions } from './suggestions.service.js';
import { Resume, ResumeAnalysis, ResumeSuggestions } from '../model/index.js';
import { sequelize } from '../config/database.js';
import crypto from 'crypto';

export const uploadResumeService = async (file , sessionId) => {
  if (!file || !file.buffer) {
    throw new AppError(
      'No file buffer received — check multer config (memoryStorage + correct field name)',
      400
    );
  }

  if (!sessionId) {
    throw new AppError('Session id is missing', 400);
  }

  let parser;

  try {
    parser = new PDFParse({ data: new Uint8Array(file.buffer) });
    const result = await parser.getText();

    // hashing PDF parse
    const textHash = crypto
      .createHash('sha256')
      .update(result.text.trim())
      .digest('hex');

    console.log(textHash, 'text hash');
    console.log('Saving resume with sessionId:', sessionId);

    // 1. Cache check — same resume already processed for this session?
    const existingResume = await Resume.findOne({
      where: { textHash , sessionId  },
      include: [
        { model: ResumeAnalysis, as: 'analysis' },
        { model: ResumeSuggestions, as: 'suggestions' },
      ],
    });

    if (existingResume) {
      // Re-run analysis if previous attempt failed
      if (existingResume.status === 'failed') {
        await existingResume.update({
          status: 'processing',
          extractedText: result.text,
          fileName: file.originalname,
          fileType: file.mimetype,
        });

        processResumeInBackground(existingResume.id, result.text).catch(err =>
          console.error('Background processing failed to start:', err)
        );

        return {
          resumeId: existingResume.id,
          status: 'processing',
        };
      }

      if (existingResume.status !== 'completed') {
        return {
          resumeId: existingResume.id,
          status: existingResume.status,
        };
      }

      return {
        resumeId: existingResume.id,
        status: existingResume.status,
        extractedText: existingResume,
        ats_score: existingResume.analysis
          ? {
              score: existingResume.analysis.ats_score,
              breakdown: existingResume.analysis.breakdown,
            }
          : null,
        suggestions: existingResume.suggestions,
      };
    }

    // Legacy rows created before session support have sessionId = NULL.
    // Attach this session instead of failing on the old textHash unique index.
    const legacyResume = await Resume.findOne({
      where: { textHash, sessionId: null },
    });

    if (legacyResume) {
      if (legacyResume.status === 'failed') {
        await legacyResume.update({
          sessionId,
          status: 'processing',
          extractedText: result.text,
          fileName: file.originalname,
          fileType: file.mimetype,
        });

        processResumeInBackground(legacyResume.id, result.text).catch(err =>
          console.error('Background processing failed to start:', err)
        );

        return {
          resumeId: legacyResume.id,
          status: 'processing',
        };
      }

      await legacyResume.update({ sessionId });
      return {
        resumeId: legacyResume.id,
        status: legacyResume.status,
      };
    }

    let createdResume;
    try {
      createdResume = await Resume.create({
        fileName: file.originalname,
        fileType: file.mimetype,
        extractedText: result.text,
        textHash,
        sessionId,
        status: 'processing',
      });
    } catch (createError) {
      // Old DB unique index on textHash alone can still reject the insert.
      if (createError.name === 'SequelizeUniqueConstraintError') {
        const own = await Resume.findOne({ where: { textHash, sessionId } });
        if (own) {
          return { resumeId: own.id, status: own.status };
        }

        const orphan = await Resume.findOne({
          where: { textHash, sessionId: null },
        });
        if (orphan) {
          await orphan.update({ sessionId });
          return { resumeId: orphan.id, status: orphan.status };
        }

        // Another session owns this hash under a leftover unique constraint —
        // do not return their resumeId.
        throw new AppError(
          'This resume content is already stored. Please try a slightly different file or contact support.',
          409
        );
      }
      throw createError;
    }

    console.log('Resume created:', createdResume.id, 'sessionId:', createdResume.sessionId);

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
    console.log(`Resume ${resumeId} parsed OK`);

    const atsResult = await calculateATSScore(structuredResume);
    console.log(`Resume ${resumeId} ATS score: ${atsResult.score}`);

    let suggestions = [];
    try {
      suggestions = await generateSuggestions(structuredResume, atsResult);
      console.log(`Resume ${resumeId} suggestions: ${suggestions.length}`);
    } catch (sugErr) {
      console.error(
        'Suggestions failed (continuing with ATS score only):',
        sugErr?.message || sugErr
      );
    }

    await sequelize.transaction(async t => {
      // Avoid duplicate analysis rows if a previous attempt partially saved
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
        const suggestionRecords = suggestions.map(s => ({
          resumeId,
          category: s.category,
          priority: s.priority,
          issue: s.issue,
          suggestion: s.suggestion,
          original_text: s.originalText,
          improved_text: s.improvedText,
        }));

        await ResumeSuggestions.bulkCreate(suggestionRecords, {
          transaction: t,
        });
      }

      await Resume.update(
        { status: 'completed' },
        { where: { id: resumeId }, transaction: t }
      );
    });

    console.log(
      `Resume ${resumeId} completed — score ${atsResult.score}, suggestions ${suggestions.length}`
    );
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
  sessionId,
  { page = 1, limit = 10 } = {}
) => {
  if (!sessionId) {
    return {
      items: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 },
      stats: { total: 0, completed: 0, averageScore: null, latestScore: null },
    };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const { rows, count } = await Resume.findAndCountAll({
    where: { sessionId },
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

  // Lightweight stats across this session (not just current page)
  const allForStats = await Resume.findAll({
    where: { sessionId },
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

  const stats = {
    total: count,
    completed: completedScores.length,
    averageScore: completedScores.length
      ? Math.round(
          completedScores.reduce((a, b) => a + b, 0) / completedScores.length
        )
      : null,
    latestScore: completedScores[0] ?? null,
  };

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      totalPages: Math.ceil(count / safeLimit) || 0,
    },
    stats,
  };
};

export const getResumeByIdService = async (resumeId, sessionId) => {
  const resume = await Resume.findOne({
    where: { id: resumeId, sessionId },
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

export const deleteResumeService = async (resumeId, sessionId) => {
  const resume = await Resume.findOne({
    where: { id: resumeId, sessionId },
  });

  if (!resume) throw new AppError('Resume not found', 404);

  await resume.destroy();
  return { deleted: true, resumeId: Number(resumeId) };
};

export const getResumeStatusService = async (resumeId, sessionId) => {
  const resume = await Resume.findOne({
    where: { id: resumeId, sessionId },
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