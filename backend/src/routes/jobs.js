import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getUserJobs
} from '../controllers/jobController.js';
import {
  validateJobCreation,
  validateJobUpdate,
  validateId,
  validatePagination,
  validateSearch
} from '../middleware/validation.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, getJobs);
router.get('/:id', validateId, getJobById);

// Protected routes
router.post('/', authenticateToken, requireRole(['client']), validateJobCreation, createJob);
router.put('/:id', authenticateToken, requireRole(['client']), validateId, validateJobUpdate, updateJob);
router.delete('/:id', authenticateToken, requireRole(['client']), validateId, deleteJob);
router.get('/user/my-jobs', authenticateToken, requireRole(['client']), validatePagination, getUserJobs);

export default router;

