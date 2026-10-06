import { Router } from 'express';
import {
  getPublicServices,
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Public: get enabled services
router.get('/', getPublicServices);

// Admin: manage services
router.get('/all', authenticateUser, requireAdmin, getAllServicesAdmin);
router.post('/', authenticateUser, requireAdmin, createService);
router.put('/:id', authenticateUser, requireAdmin, updateService);
router.delete('/:id', authenticateUser, requireAdmin, deleteService);

export default router;
