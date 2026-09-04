import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export const sessionMiddleware = (req, res, next) => {
  let sessionId =
    req.cookies?.sessionId ||
    req.headers['x-session-id'] ||
    null;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    path: '/',
    maxAge: 365 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  req.sessionId = sessionId;
  next();
};
