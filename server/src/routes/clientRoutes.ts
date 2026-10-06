import { Router } from 'express';
import {
  getClientDashboard,
  getClientProjects,
  getClientProjectDetails,
  getClientFiles,
  getClientMessages,
  sendClientMessage
} from '../controllers/clientController';
import { getMe, updateProfile } from '../controllers/authController';
import { submitClientProjectRequest } from '../controllers/contactController';
import { authenticateUser, requireClient } from '../middleware/auth';

const router = Router();

// Protect all client routes
router.use(authenticateUser, requireClient);

router.get('/dashboard', getClientDashboard);
router.get('/projects', getClientProjects);
router.get('/projects/:id', getClientProjectDetails);
router.get('/files', getClientFiles);
router.get('/messages', getClientMessages);
router.post('/messages', sendClientMessage);
router.post('/project-requests', submitClientProjectRequest);
router.get('/profile', getMe);
router.put('/profile', updateProfile);

export default router;
