import { executeQuery } from '../config/database.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.icon,
        c.created_at,
        COUNT(j.id) as job_count
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id AND j.status = 'open'
      GROUP BY c.id, c.name, c.description, c.icon, c.created_at
      ORDER BY c.name`
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.icon,
        c.created_at,
        COUNT(j.id) as job_count
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id AND j.status = 'open'
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.description, c.icon, c.created_at`,
      [id]
    );

    if (!result.success || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: result.data[0]
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

// Get skills for a category
export const getCategorySkills = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      `SELECT 
        s.id,
        s.name,
        s.created_at,
        COUNT(us.user_id) as freelancer_count
      FROM skills s
      LEFT JOIN user_skills us ON s.id = us.skill_id
      WHERE s.category_id = ?
      GROUP BY s.id, s.name, s.created_at
      ORDER BY s.name`,
      [id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch skills'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get category skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills'
    });
  }
};

// Get all skills
export const getAllSkills = async (req, res) => {
  try {
    const { category_id, search } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (category_id) {
      whereConditions.push('s.category_id = ?');
      queryParams.push(category_id);
    }

    if (search) {
      whereConditions.push('s.name LIKE ?');
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await executeQuery(
      `SELECT 
        s.id,
        s.name,
        s.category_id,
        c.name as category_name,
        s.created_at,
        COUNT(us.user_id) as freelancer_count
      FROM skills s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN user_skills us ON s.id = us.skill_id
      ${whereClause}
      GROUP BY s.id, s.name, s.category_id, c.name, s.created_at
      ORDER BY s.name`,
      queryParams
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch skills'
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get all skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills'
    });
  }
};

// Create category (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    // Check if category already exists
    const existingCategory = await executeQuery(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );

    if (existingCategory.success && existingCategory.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const result = await executeQuery(
      'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
      [name, description, icon]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create category'
      });
    }

    const categoryId = result.data.insertId;

    // Get created category
    const categoryResult = await executeQuery(
      'SELECT id, name, description, icon, created_at FROM categories WHERE id = ?',
      [categoryId]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: categoryResult.data[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// Update category (admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    // Check if category exists
    const categoryCheck = await executeQuery(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (!categoryCheck.success || categoryCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name) {
      const existingCategory = await executeQuery(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name, id]
      );

      if (existingCategory.success && existingCategory.data.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    const result = await executeQuery(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update category'
      });
    }

    // Get updated category
    const updatedCategoryResult = await executeQuery(
      'SELECT id, name, description, icon, created_at FROM categories WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategoryResult.data[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const categoryCheck = await executeQuery(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (!categoryCheck.success || categoryCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has jobs
    const jobsCheck = await executeQuery(
      'SELECT COUNT(*) as count FROM jobs WHERE category_id = ?',
      [id]
    );

    if (jobsCheck.data[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing jobs'
      });
    }

    // Delete category
    const result = await executeQuery(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// Create skill (admin only)
export const createSkill = async (req, res) => {
  try {
    const { name, category_id } = req.body;

    // Check if skill already exists
    const existingSkill = await executeQuery(
      'SELECT id FROM skills WHERE name = ?',
      [name]
    );

    if (existingSkill.success && existingSkill.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Skill with this name already exists'
      });
    }

    // Check if category exists
    const categoryCheck = await executeQuery(
      'SELECT id FROM categories WHERE id = ?',
      [category_id]
    );

    if (!categoryCheck.success || categoryCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const result = await executeQuery(
      'INSERT INTO skills (name, category_id) VALUES (?, ?)',
      [name, category_id]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create skill'
      });
    }

    const skillId = result.data.insertId;

    // Get created skill
    const skillResult = await executeQuery(
      `SELECT 
        s.id,
        s.name,
        s.category_id,
        c.name as category_name,
        s.created_at
      FROM skills s
      JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?`,
      [skillId]
    );

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skillResult.data[0]
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create skill'
    });
  }
};

