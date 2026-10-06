import { Request, Response } from 'express';
import { User } from '../models/User';
import { ClientProfile } from '../models/ClientProfile';
import { sendTokenResponse, clearTokenResponse } from '../utils/token';
import { AuthRequest } from '../middleware/auth';
import { createHash, randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService';

const hashResetToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const genericMessage = 'If an active account uses that email, a password reset link will be sent.';
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (email && email.length <= 254) {
      const user = await User.findOne({ email, isActive: true });
      if (user) {
        const token = randomBytes(32).toString('hex');
        user.resetPasswordToken = hashResetToken(token);
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
        const resetUrl = `${clientUrl}/client/reset-password?token=${encodeURIComponent(token)}`;
        try {
          await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
        } catch (error) {
          user.resetPasswordToken = null;
          user.resetPasswordExpires = null;
          await user.save();
          console.error('[Password Reset] Could not send reset email:', error);
        }
      }
    }
    res.status(200).json({ success: true, message: genericMessage });
  } catch (error) {
    console.error('[Password Reset] Request failed:', error);
    res.status(200).json({ success: true, message: genericMessage });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body || {};
    if (typeof token !== 'string' || token.length !== 64 || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ success: false, message: 'This reset link is invalid or expired. Request a new one.' });
      return;
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const user = await User.findOne({
      isActive: true,
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      res.status(400).json({ success: false, message: 'This reset link is invalid or expired. Request a new one.' });
      return;
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Your password has been reset. Sign in with your new password.',
      data: { role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to reset your password right now. Please try again.' });
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new client account (Visitors can only register as Client)
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with that email already exists.' });
      return;
    }

    // Role is strictly 'client' for public registration
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'client'
    });

    // Create corresponding ClientProfile
    await ClientProfile.create({
      userId: user._id,
      company: req.body.company || '',
      phone: req.body.phone || '',
      location: req.body.location || '',
      bio: req.body.bio || ''
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message || 'Server error during registration.'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login client or admin
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    if (portal === 'client' && user.role !== 'client') {
      res.status(403).json({
        success: false,
        message: 'This is an administrator account. Please sign in through Admin Login.'
      });
      return;
    }

    if (portal === 'admin' && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'This is a client account. Please sign in through the Client Portal.'
      });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message || 'Server error during login.'
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Log out current user & clear cookie
 * @access  Private
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearTokenResponse(res);
  res.status(200).json({
    success: true,
    message: 'Successfully logged out.'
  });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user & client profile if applicable
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let clientProfile = null;
    if (req.user.role === 'client') {
      clientProfile = await ClientProfile.findOne({ userId: req.user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt
      },
      profile: clientProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user data.'
    });
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update client or admin profile
 * @access  Private
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, avatar, company, phone, location, bio, website } = req.body;

    // Update User model fields (Clients cannot change their own role or isActive!)
    if (name) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;
    await req.user.save();

    let profile = null;
    if (req.user.role === 'client') {
      profile = await ClientProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          company: company !== undefined ? company : undefined,
          phone: phone !== undefined ? phone : undefined,
          location: location !== undefined ? location : undefined,
          bio: bio !== undefined ? bio : undefined,
          website: website !== undefined ? website : undefined,
          avatar: avatar !== undefined ? avatar : undefined
        },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt
      },
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
};
