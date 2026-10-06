import { Router } from 'express';
import {
  getPublicProjects,
  getPublicProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  uploadProjectFile,
  deleteProjectFile
} from '../controllers/projectController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (Visitors)
router.get('/', getPublicProjects);
router.get('/:slug', getPublicProjectBySlug);

// Protected routes (Admin or authenticated user with access)
router.get('/id/:id', authenticateUser, getProjectById);
router.post('/', authenticateUser, requireAdmin, createProject);
router.put('/:id', authenticateUser, requireAdmin, updateProject);
router.delete('/:id', authenticateUser, requireAdmin, deleteProject);

// Milestones
router.post('/:projectId/milestones', authenticateUser, requireAdmin, createMilestone);
router.put('/milestones/:milestoneId', authenticateUser, requireAdmin, updateMilestone);
router.delete('/milestones/:milestoneId', authenticateUser, requireAdmin, deleteMilestone);

// Files
router.post('/:projectId/files', authenticateUser, uploadProjectFile);
router.delete('/files/:fileId', authenticateUser, requireAdmin, deleteProjectFile);

export default router;
