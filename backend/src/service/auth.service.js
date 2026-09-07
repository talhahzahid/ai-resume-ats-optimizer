import bcrypt from 'bcryptjs';
import { User } from '../model/index.js';
import { AppError } from '../utils/AppError.js';
import { publicUser, signUserToken } from '../utils/jwt.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = email => String(email || '').trim().toLowerCase();

const validateCredentials = ({ name, email, password, isRegister }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || '');
  const cleanName = String(name || '').trim();

  if (isRegister && cleanName.length < 2) {
    throw new AppError('Please enter your name', 400);
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    throw new AppError('Please enter a valid email', 400);
  }
  if (cleanPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  return { name: cleanName, email: cleanEmail, password: cleanPassword };
};

const authPayload = user => ({
  token: signUserToken(user),
  user: publicUser(user),
});

export const registerUserService = async ({ name, email, password }) => {
  const data = validateCredentials({ name, email, password, isRegister: true });

  const existing = await User.findOne({ where: { email: data.email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: await bcrypt.hash(data.password, 10),
  });

  return authPayload(user);
};

export const loginUserService = async ({ email, password }) => {
  const data = validateCredentials({
    email,
    password,
    isRegister: false,
  });

  const user = await User.findOne({ where: { email: data.email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const ok = await bcrypt.compare(data.password, user.password);
  if (!ok) {
    throw new AppError('Invalid email or password', 401);
  }

  return authPayload(user);
};

export const getMeService = async userId => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);
  return publicUser(user);
};
