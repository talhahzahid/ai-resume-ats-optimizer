import Resume from './resume.model.js';
import ResumeAnalysis from './resume_analysis.model.js';
import ResumeSuggestions from './resume_suggestions.model.js';

Resume.hasOne (ResumeAnalysis, {
  foreignKey: 'resumeId',
  as: 'analysis',
  onDelete: 'CASCADE',
});
ResumeAnalysis.belongsTo (Resume, {foreignKey: 'resumeId'});

Resume.hasMany (ResumeSuggestions, {
  foreignKey: 'resumeId',
  as: 'suggestions',
  onDelete: 'CASCADE',
});
ResumeSuggestions.belongsTo (Resume, {foreignKey: 'resumeId'});

export {Resume, ResumeAnalysis, ResumeSuggestions};
