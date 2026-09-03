import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/AppError.js';
import { structureResume } from './resumeParser.service.js';
import { calculateATSScore } from './atsScore.service.js';
import { generateSuggestions } from './suggestions.service.js';
import { Resume, ResumeAnalysis, ResumeSuggestions } from '../model/index.js';
import { sequelize } from '../config/database.js';
import crypto from 'crypto';

export const uploadResumeService = async file => {
  if (!file || !file.buffer) {
    throw new AppError(
      'No file buffer received — check multer config (memoryStorage + correct field name)',
      400
    );
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

    // 1. Cache check — same resume already processed?
    const existingResume = await Resume.findOne({
      where: { textHash },
      include: [
        { model: ResumeAnalysis, as: 'analysis' },
        { model: ResumeSuggestions, as: 'suggestions' },
      ],
    });

    if (existingResume) {
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
        ats_score: {
          score: existingResume.analysis.ats_score,
          breakdown: existingResume.analysis.breakdown,
        },
        suggestions: existingResume.suggestions,
      };
    }

    const createdResume = await Resume.create({
      fileName: file.originalname,
      fileType: file.mimetype,
      extractedText: result.text,
      textHash,
      status: 'processing',
    });

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
    const structuredResume = await structureResume(text);
    const atsResult = await calculateATSScore(structuredResume);
    const suggestions = await generateSuggestions(structuredResume, atsResult);

    await sequelize.transaction(async t => {
      await ResumeAnalysis.create(
        { resumeId, ats_score: atsResult.score, breakdown: atsResult.breakdown },
        { transaction: t }
      );

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
  } catch (error) {
    console.error('Background LLM processing failed:', error);
    await Resume.update({ status: 'failed' }, { where: { id: resumeId } });
  }
};

export const getResumeStatusService = async resumeId => {
  const resume = await Resume.findByPk(resumeId, {
    include: [
      { model: ResumeAnalysis, as: 'analysis' },
      { model: ResumeSuggestions, as: 'suggestions' },
    ],
  });

  if (!resume) throw new AppError('Resume not found', 404);

  return {
    resumeId: resume.id,
    status: resume.status,
    ats_score: resume.analysis
      ? { score: resume.analysis.ats_score, breakdown: resume.analysis.breakdown }
      : null,
    suggestions: resume.suggestions ?? [],
  };
};