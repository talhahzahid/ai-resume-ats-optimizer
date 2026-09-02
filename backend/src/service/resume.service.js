import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/AppError.js';
import { structureResume } from './resumeParser.service.js';
import { calculateATSScore } from './atsScore.service.js';
import { generateSuggestions } from './suggestions.service.js';
import { Resume, ResumeAnalysis, ResumeSuggestions } from '../model/index.js';
import { sequelize } from '../config/database.js';

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

    // 1. LLM processing FIRST — outside any transaction (slow/unpredictable)
    const structuredResume = await structureResume(result.text);
    const atsResult = await calculateATSScore(structuredResume);
    const suggestions = await generateSuggestions(structuredResume, atsResult);

    // 2. Only now touch DB — everything in ONE transaction
    const resume = await sequelize.transaction(async t => {
      const createdResume = await Resume.create(
        {
          fileName: file.originalname,
          fileType: file.mimetype,
          extractedText: result.text,
        },
        { transaction: t }
      );

      await ResumeAnalysis.create(
        {
          resumeId: createdResume.id,
          ats_score: atsResult.score,
          breakdown: atsResult.breakdown,
        },
        { transaction: t }
      );

      if (suggestions.length) {
        const suggestionRecords = suggestions.map(s => ({
          resumeId: createdResume.id,
          category: s.category,
          priority: s.priority,
          issue: s.issue,
          suggestion: s.suggestion,
          original_text: s.originalText,
          improved_text: s.improvedText,
        }));

        await ResumeSuggestions.bulkCreate(suggestionRecords, { transaction: t });
      }

      return createdResume;
    });

    return {
      extractedText: resume,
      ats_score: atsResult,
      suggestions,
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