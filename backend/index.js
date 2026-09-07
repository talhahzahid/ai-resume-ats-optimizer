import express from 'express';
import dotenv from 'dotenv';
import {sequelize} from './src/config/database.js';
import {
  dropLegacyTextHashUniques,
  ensureResumeSchema,
} from './src/config/resumeSchema.js';
import {getJwtSecret} from './src/utils/jwt.js';
import authRouter from './src/routes/auth.routes.js';
import resumeRouter from './src/routes/resume.routes.js';
import './src/model/index.js';
import cors from 'cors';
dotenv.config ();
const app = express ();
const port = process.env.PORT || 9000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://ai-resume-ats-optimizer-nine.vercel.app',
  'https://ai-resume-ats-optimizer-nine.vercel.app/',
];

app.set ('trust proxy', 1);

app.use (
  cors ({
    origin (origin, callback) {
      if (!origin) return callback (null, true);
      const normalized = origin.replace (/\/$/, '');
      if (allowedOrigins.includes (normalized)) {
        return callback (null, true);
      }
      return callback (null, false);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use (express.json ());

app.get ('/', (req, res) => {
  res.send ('Server is running');
});

app.use ('/api/v1', authRouter);
app.use ('/api/v1', resumeRouter);

app.use ((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status (status).json ({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  try {
    getJwtSecret ();
    await sequelize.authenticate ();
    await ensureResumeSchema ();
    await sequelize.sync ({alter: true});
    await dropLegacyTextHashUniques ();
    console.log ('Database connected successfully');
    app.listen (port, () => {
      console.log (`server is running at port ${port}`);
    });
  } catch (error) {
    console.log ('Unable to connect to database', error);
  }
};

startServer ();
