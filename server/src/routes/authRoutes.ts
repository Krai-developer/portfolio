import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile
} from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
import { requestPasswordReset, resetPassword } from '../controllers/authController';

const router = Router();

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts. Please try again later.' }
});

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

export default router;
