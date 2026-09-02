import {DataTypes} from 'sequelize';
import {sequelize} from '../config/database.js';

const ResumeAnalysis = sequelize.define (
  'ResumeAnalysis',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    resumeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'resumes',
        key: 'id',
      },
    },
    ats_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    breakdown: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: 'resume_analysis',
    timestamps: true,
  }
);

export default ResumeAnalysis;
