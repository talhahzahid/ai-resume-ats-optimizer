import {DataTypes} from 'sequelize';
import {sequelize} from '../config/database.js';

const ResumeSuggestions = sequelize.define (
  'ResumeSuggestions',
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    suggestion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    original_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    improved_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'resume_suggestions',
    timestamps: true,
  }
);

export default ResumeSuggestions;
