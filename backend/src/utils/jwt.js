import jwt from 'jsonwebtoken';

const TOKEN_EXPIRES_IN = '7d';

export const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  return 'dev-jwt-secret-change-me';
};

export const signUserToken = user =>
  jwt.sign({ id: user.id }, getJwtSecret(), { expiresIn: TOKEN_EXPIRES_IN });

export const verifyUserToken = token => jwt.verify(token, getJwtSecret());

export const publicUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
});
