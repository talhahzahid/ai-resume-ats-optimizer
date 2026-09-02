// import Resume from '../model/resume.model.js';
// import ResumeAnalysis from '../model/resume_analysis.model.js';
// import ResumeSuggestions from '../model/resume_suggestions.model.js';
import {uploadResumeService} from '../service/resume.service.js';
import {Resume, ResumeAnalysis, ResumeSuggestions} from '../model/index.js';
import {AppError} from '../utils/AppError.js';
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findByPk (req.params.id, {
      include: [
        {model: ResumeAnalysis, as: 'analysis'},
        {model: ResumeSuggestions, as: 'suggestions'},
      ],
    });
    if (!resume) throw new AppError ('Resume not found', 404);
    res.status (200).json ({success: true, data: resume});
  } catch (err) {
    next (err);
  }
};

export const createResumeController = async (req, res, next) => {
  try {
    const result = await uploadResumeService (req.file);
    res.json ({text: result});
  } catch (error) {
    next (error);
  }
};
