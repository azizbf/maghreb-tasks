import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount
} from '../controllers/authController.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.put('/deactivate', authenticateToken, deactivateAccount);

export default router;

