import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { messagingLimiter } from '../middleware/security.js';
import { 
  sendMessage, 
  getConversation, 
  getUserConversations, 
  markMessagesAsRead, 
  getUnreadCount 
} from '../controllers/messageController.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const validateMessage = [
  body('recipient_id')
    .isInt({ min: 1 })
    .withMessage('Valid recipient ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('job_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Job ID must be a valid integer'),
  handleValidationErrors
];

// All routes require authentication and use messaging rate limiter
router.use(authenticateToken);
router.use(messagingLimiter);

// Send message
router.post('/', validateMessage, sendMessage);

// Get conversation with specific user
router.get('/conversation/:user_id', getConversation);

// Get all conversations for current user
router.get('/conversations', getUserConversations);

// Mark messages as read
router.put('/read/:user_id', markMessagesAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

export default router;
