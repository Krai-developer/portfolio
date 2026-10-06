import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Public: view website settings & availability
router.get('/', getSettings);

// Admin: update settings
router.put('/', authenticateUser, requireAdmin, updateSettings);

export default router;
