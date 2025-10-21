import bcrypt from 'bcryptjs';
import { executeQuery } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, full_name, role, phone, location, bio } = req.body;

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.success && existingUser.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await executeQuery(
      `INSERT INTO users (email, password_hash, full_name, role, phone, location, bio) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, password_hash, full_name, role, phone || null, location || null, bio || null]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    const userId = result.data.insertId;

    // Generate JWT token
    const token = generateToken(userId, role);

    // Get user data (without password)
    const userResult = await executeQuery(
      'SELECT id, email, full_name, role, avatar_url, bio, location, phone, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResult.data[0],
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user with password
    const result = await executeQuery(
      'SELECT id, email, password_hash, full_name, role, avatar_url, bio, location, phone, is_verified, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.data[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await executeQuery(
      `SELECT id, email, full_name, role, avatar_url, bio, location, phone, is_verified, created_at, updated_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.data[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, location, bio, avatar_url } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const result = await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    // Get updated user data
    const userResult = await executeQuery(
      `SELECT id, email, full_name, role, avatar_url, bio, location, phone, is_verified, created_at, updated_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResult.data[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Get current password hash
    const result = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, result.data[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const new_password_hash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const updateResult = await executeQuery(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [new_password_hash, userId]
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Deactivate account
export const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await executeQuery(
      'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate account'
      });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account'
    });
  }
};

