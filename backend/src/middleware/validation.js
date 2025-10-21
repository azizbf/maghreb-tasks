import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('role')
    .isIn(['freelancer', 'client'])
    .withMessage('Role must be either freelancer or client'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateUserUpdate = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  handleValidationErrors
];

// Job validation rules
export const validateJobCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('budget_min')
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a positive number'),
  body('budget_max')
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a positive number'),
  body('duration')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Duration is required and must be less than 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Location is required and must be less than 255 characters'),
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('skills.*')
    .isInt({ min: 1 })
    .withMessage('All skill IDs must be valid integers'),
  body('is_remote')
    .optional()
    .isBoolean()
    .withMessage('is_remote must be a boolean'),
  handleValidationErrors
];

export const validateJobUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('budget_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a positive number'),
  body('budget_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a positive number'),
  body('duration')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Duration must be less than 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: open, in_progress, completed, cancelled'),
  body('is_remote')
    .optional()
    .isBoolean()
    .withMessage('is_remote must be a boolean'),
  handleValidationErrors
];

// Proposal validation rules
export const validateProposalCreation = [
  body('job_id')
    .isInt({ min: 1 })
    .withMessage('Valid job ID is required'),
  body('cover_letter')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Cover letter must be between 50 and 1000 characters'),
  body('proposed_budget')
    .isFloat({ min: 0 })
    .withMessage('Proposed budget must be a positive number'),
  body('proposed_duration')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Proposed duration is required and must be less than 100 characters'),
  handleValidationErrors
];

export const validateProposalUpdate = [
  body('cover_letter')
    .optional()
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Cover letter must be between 50 and 1000 characters'),
  body('proposed_budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Proposed budget must be a positive number'),
  body('proposed_duration')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Proposed duration must be less than 100 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('Status must be one of: pending, accepted, rejected, withdrawn'),
  handleValidationErrors
];

// Review validation rules
export const validateReviewCreation = [
  body('contract_id')
    .isInt({ min: 1 })
    .withMessage('Valid contract ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters'),
  handleValidationErrors
];

// Message validation rules
export const validateMessageCreation = [
  body('contract_id')
    .isInt({ min: 1 })
    .withMessage('Valid contract ID is required'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  handleValidationErrors
];

// Portfolio validation rules
export const validatePortfolioItem = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('project_url')
    .optional()
    .isURL()
    .withMessage('Project URL must be a valid URL'),
  body('skills_used')
    .optional()
    .isArray()
    .withMessage('Skills used must be an array'),
  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Job ID parameter validation
export const validateJobId = [
  param('jobId')
    .isInt({ min: 1 })
    .withMessage('Valid job ID is required'),
  handleValidationErrors
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Search validation
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category must be a valid integer'),
  query('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  query('min_budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a positive number'),
  query('max_budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a positive number'),
  handleValidationErrors
];
