import { Router } from 'express';
import {
  submitContact,
  getContactMessages,
  updateContactStatus,
  deleteContactMessage
} from '../controllers/contactController';
import { authenticateUser, requireAdmin } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for contact submissions: 5 requests per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many contact requests from this IP, please try again after 15 minutes.'
  }
});

// Public submission
router.post('/', contactLimiter, submitContact);

// Admin contact management
router.get('/', authenticateUser, requireAdmin, getContactMessages);
router.put('/:id', authenticateUser, requireAdmin, updateContactStatus);
router.delete('/:id', authenticateUser, requireAdmin, deleteContactMessage);

export default router;
