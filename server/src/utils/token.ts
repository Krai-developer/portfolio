import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const isProduction = process.env.NODE_ENV === 'production';
const cookieSameSite = isProduction ? ('none' as const) : ('lax' as const);

export const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: cookieSameSite,
    path: '/'
  };

  // Safe user payload without sensitive fields
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token, // Also provided so API clients or fallback headers work seamlessly
      user: safeUser
    });
};

export const clearTokenResponse = (res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() - 10000),
    httpOnly: true,
    secure: isProduction,
    sameSite: cookieSameSite,
    path: '/'
  });
};
