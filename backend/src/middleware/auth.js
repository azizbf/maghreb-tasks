import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const result = await executeQuery(
      'SELECT id, email, full_name, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!result.success || !result.data.length) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    const user = result.data[0];
    
    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Middleware to check user role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Middleware to check if user owns resource
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id;

      let query, params;
      
      switch (resourceType) {
        case 'job':
          query = 'SELECT client_id FROM jobs WHERE id = ?';
          params = [resourceId];
          break;
        case 'proposal':
          query = 'SELECT freelancer_id FROM proposals WHERE id = ?';
          params = [resourceId];
          break;
        case 'contract':
          query = 'SELECT client_id, freelancer_id FROM contracts WHERE id = ?';
          params = [resourceId];
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid resource type' 
          });
      }

      const result = await executeQuery(query, params);
      
      if (!result.success || !result.data.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Resource not found' 
        });
      }

      const resource = result.data[0];
      let isOwner = false;

      if (resourceType === 'contract') {
        isOwner = resource.client_id === userId || resource.freelancer_id === userId;
      } else {
        const ownerField = resourceType === 'job' ? 'client_id' : 'freelancer_id';
        isOwner = resource[ownerField] === userId;
      }

      if (!isOwner) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied - not resource owner' 
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Authorization error' 
      });
    }
  };
};

// Generate JWT token
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify token without middleware (for optional auth)
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

