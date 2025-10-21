import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategorySkills,
  getAllSkills,
  createCategory,
  updateCategory,
  deleteCategory,
  createSkill
} from '../controllers/categoryController.js';
import {
  validateId,
  validatePagination
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', validateId, getCategoryById);
router.get('/:id/skills', validateId, getCategorySkills);
router.get('/skills/all', validatePagination, getAllSkills);

// Protected routes (admin only - for now, any authenticated user can create)
router.post('/', authenticateToken, createCategory);
router.put('/:id', authenticateToken, validateId, updateCategory);
router.delete('/:id', authenticateToken, validateId, deleteCategory);
router.post('/skills', authenticateToken, createSkill);

export default router;

