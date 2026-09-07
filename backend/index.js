import express from 'express';
import dotenv from 'dotenv';
import {sequelize} from './src/config/database.js';
import router from './src/routes/resume.routes.js';
import './src/model/index.js';
import cors from 'cors';
import {sessionMiddleware} from './src/middleware/session.middleware.js';
import cookieParser from 'cookie-parser';
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
  })
);
app.use (cookieParser ());
app.use (sessionMiddleware);

app.use (express.json ());

app.get ('/', (req, res) => {
  res.send ('Server is running');
});

app.use ('/api/v1', router);

app.use ((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status (status).json ({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const ensureResumeSchema = async () => {
  // Drop legacy global unique on textHash (blocks same PDF across sessions).
  await sequelize.query (
    'ALTER TABLE IF EXISTS resumes DROP CONSTRAINT IF EXISTS "resumes_textHash_key";'
  );
  await sequelize.query (
    'DROP INDEX IF EXISTS "resumes_textHash_key";'
  );

  // sync({ alter: true }) often skips new columns on hosted Postgres — add explicitly.
  await sequelize.query (`
    ALTER TABLE IF EXISTS resumes
    ADD COLUMN IF NOT EXISTS "sessionId" VARCHAR(255);
  `);

  await sequelize.query (`
    CREATE INDEX IF NOT EXISTS resumes_session_id_idx
    ON resumes ("sessionId");
  `);

  await sequelize.query (`
    CREATE UNIQUE INDEX IF NOT EXISTS resumes_text_hash_session_id_unique
    ON resumes ("textHash", "sessionId");
  `);
};

const startServer = async () => {
  try {
    await sequelize.authenticate ();
    await ensureResumeSchema ();
    await sequelize.sync ({alter: true});
    console.log ('Database connected successfully');
    app.listen (port, () => {
      console.log (`server is running at port ${port}`);
    });
  } catch (error) {
    console.log ('Unable to connect to database', error);
  }
};

startServer ();
