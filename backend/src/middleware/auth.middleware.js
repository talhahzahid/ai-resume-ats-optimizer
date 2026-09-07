import { AppError } from '../utils/AppError.js';
import { verifyUserToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return next(new AppError('Please log in to continue', 401));
  }

  try {
    const payload = verifyUserToken(token);
    req.user = { id: payload.id };
    next();
  } catch {
    next(new AppError('Session expired. Please log in again.', 401));
  }
};
