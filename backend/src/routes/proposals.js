import express from 'express';
import {
  getJobProposals,
  getProposalById,
  createProposal,
  updateProposal,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
  getFreelancerProposals
} from '../controllers/proposalController.js';
import {
  validateProposalCreation,
  validateProposalUpdate,
  validateId,
  validateJobId,
  validatePagination
} from '../middleware/validation.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/job/:jobId', authenticateToken, validateJobId, validatePagination, getJobProposals);
router.get('/:id', authenticateToken, validateId, getProposalById);
router.post('/', authenticateToken, requireRole(['freelancer']), validateProposalCreation, createProposal);
router.put('/:id', authenticateToken, requireRole(['freelancer']), validateId, validateProposalUpdate, updateProposal);
router.put('/:id/accept', authenticateToken, requireRole(['client']), validateId, acceptProposal);
router.put('/:id/reject', authenticateToken, requireRole(['client']), validateId, rejectProposal);
router.put('/:id/withdraw', authenticateToken, requireRole(['freelancer']), validateId, withdrawProposal);
router.get('/user/my-proposals', authenticateToken, requireRole(['freelancer']), validatePagination, getFreelancerProposals);

export default router;
