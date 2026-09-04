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
    },
    status: {
      type: DataTypes.ENUM ('processing', 'completed', 'failed'),
      defaultValue: 'processing',
      allowNull: false,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'resumes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['textHash', 'sessionId'],
        name: 'resumes_text_hash_session_id_unique',
      },
      {
        fields: ['sessionId'],
        name: 'resumes_session_id_idx',
      },
    ],
  }
);

export default Resume;
