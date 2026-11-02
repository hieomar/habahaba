import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from './errors.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '15m',
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};
