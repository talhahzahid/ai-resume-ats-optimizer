import {DataTypes} from 'sequelize';
import {sequelize} from '../config/database.js';

const Resume = sequelize.define (
  'Resume',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    extractedText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    textHash: {
      type: DataTypes.STRING (64),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM ('processing', 'completed', 'failed'),
      defaultValue: 'processing',
      allowNull: false,
    },
  },
  {
    tableName: 'resumes',
    timestamps: true,
  }
);

export default Resume;
