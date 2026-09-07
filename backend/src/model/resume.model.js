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
      unique: false,
    },
    status: {
      type: DataTypes.ENUM ('processing', 'completed', 'failed'),
      defaultValue: 'processing',
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'resumes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['textHash', 'userId'],
        name: 'resumes_text_hash_user_id_unique',
      },
      {
        fields: ['userId'],
        name: 'resumes_user_id_idx',
      },
    ],
  }
);

export default Resume;
