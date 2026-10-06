import { Router } from 'express';
import {
  getAdminDashboard,
  getClients,
  createClient,
  updateClient,
  getUsers,
  updateUserRole,
  getAdminMessages,
  replyClientMessage,
  getAnalytics
} from '../controllers/adminController';
import { getAllProjectsAdmin } from '../controllers/projectController';
import { updateSettings } from '../controllers/settingsController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Protect all admin routes strictly
router.use(authenticateUser, requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/projects', getAllProjectsAdmin);
router.get('/clients', getClients);
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/messages', getAdminMessages);
router.post('/messages/reply', replyClientMessage);
router.get('/analytics', getAnalytics);
router.put('/settings', updateSettings);

export default router;
