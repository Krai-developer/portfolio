import { Router } from 'express';
import {
  getPublicSkills,
  getAllSkillsAdmin,
  createSkill,
  updateSkill,
  deleteSkill
} from '../controllers/skillController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Public: get skills
router.get('/', getPublicSkills);

// Admin: manage skills
router.get('/all', authenticateUser, requireAdmin, getAllSkillsAdmin);
router.post('/', authenticateUser, requireAdmin, createSkill);
router.put('/:id', authenticateUser, requireAdmin, updateSkill);
router.delete('/:id', authenticateUser, requireAdmin, deleteSkill);

export default router;
