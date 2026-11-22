import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateAccessToken = (payload: { userId: string; email: string; role: string }) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: { userId: string }) => {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret) as { userId: string; email: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwtRefreshSecret) as { userId: string };
};
