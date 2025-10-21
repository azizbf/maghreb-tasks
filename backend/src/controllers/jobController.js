import { executeQuery } from '../config/database.js';

// Get all jobs with filters and pagination
export const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q: search,
      category,
      location,
      min_budget,
      max_budget,
      status = 'open',
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['j.status = ?'];
    let queryParams = [status];

    // Search in title and description
    if (search) {
      whereConditions.push('(j.title LIKE ? OR j.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Filter by category
    if (category) {
      whereConditions.push('j.category_id = ?');
      queryParams.push(category);
    }

    // Filter by location
    if (location) {
      whereConditions.push('(j.location LIKE ? OR j.is_remote = TRUE)');
      queryParams.push(`%${location}%`);
    }

    // Filter by budget range
    if (min_budget) {
      whereConditions.push('j.budget_max >= ?');
      queryParams.push(min_budget);
    }
    if (max_budget) {
      whereConditions.push('j.budget_min <= ?');
      queryParams.push(max_budget);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      JOIN categories c ON j.category_id = c.id
      WHERE ${whereClause}
    `;

    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult.data[0].total;

    // Get jobs with pagination
    const jobsQuery = `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.budget_min,
        j.budget_max,
        j.currency,
        j.duration,
        j.location,
        j.is_remote,
        j.status,
        j.created_at,
        j.updated_at,
        c.name as category_name,
        u.full_name as client_name,
        u.avatar_url as client_avatar,
        (SELECT COUNT(*) FROM proposals p WHERE p.job_id = j.id) as proposals_count
      FROM jobs j
      JOIN categories c ON j.category_id = c.id
      JOIN users u ON j.client_id = u.id
      WHERE ${whereClause}
      ORDER BY j.${sort} ${order}
      LIMIT ? OFFSET ?
    `;

    const jobsResult = await executeQuery(jobsQuery, [...queryParams, parseInt(limit), offset]);

    // Get skills for each job
    const jobs = await Promise.all(
      jobsResult.data.map(async (job) => {
        const skillsResult = await executeQuery(
          `SELECT s.id, s.name 
           FROM job_skills js 
           JOIN skills s ON js.skill_id = s.id 
           WHERE js.job_id = ?`,
          [job.id]
        );

        return {
          ...job,
          skills: skillsResult.data || []
        };
      })
    );

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

// Get single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobResult = await executeQuery(
      `SELECT 
        j.id,
        j.title,
        j.description,
        j.budget_min,
        j.budget_max,
        j.currency,
        j.duration,
        j.location,
        j.is_remote,
        j.status,
        j.created_at,
        j.updated_at,
        c.name as category_name,
        u.id as client_id,
        u.full_name as client_name,
        u.avatar_url as client_avatar,
        u.bio as client_bio,
        u.location as client_location,
        (SELECT COUNT(*) FROM proposals p WHERE p.job_id = j.id) as proposals_count
      FROM jobs j
      JOIN categories c ON j.category_id = c.id
      JOIN users u ON j.client_id = u.id
      WHERE j.id = ?`,
      [id]
    );

    if (!jobResult.success || jobResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = jobResult.data[0];

    // Get skills for the job
    const skillsResult = await executeQuery(
      `SELECT s.id, s.name 
       FROM job_skills js 
       JOIN skills s ON js.skill_id = s.id 
       WHERE js.job_id = ?`,
      [id]
    );

    job.skills = skillsResult.data || [];

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
};

// Create new job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      budget_min,
      budget_max,
      currency = 'TND',
      duration,
      location,
      category_id,
      skills,
      is_remote = false
    } = req.body;

    const client_id = req.user.id;

    // Validate budget
    if (budget_min > budget_max) {
      return res.status(400).json({
        success: false,
        message: 'Minimum budget cannot be greater than maximum budget'
      });
    }

    // Create job
    const jobResult = await executeQuery(
      `INSERT INTO jobs (client_id, title, description, budget_min, budget_max, currency, duration, location, category_id, is_remote)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id, title, description, budget_min, budget_max, currency, duration, location, category_id, is_remote]
    );

    if (!jobResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create job'
      });
    }

    const jobId = jobResult.data.insertId;

    // Add skills to job
    if (skills && skills.length > 0) {
      const skillInserts = skills.map(skillId => [jobId, skillId]);
      await executeQuery(
        `INSERT INTO job_skills (job_id, skill_id) VALUES ${skillInserts.map(() => '(?, ?)').join(', ')}`,
        skillInserts.flat()
      );
    }

    // Get created job with all details
    const createdJobResult = await executeQuery(
      `SELECT 
        j.id,
        j.title,
        j.description,
        j.budget_min,
        j.budget_max,
        j.currency,
        j.duration,
        j.location,
        j.is_remote,
        j.status,
        j.created_at,
        c.name as category_name
      FROM jobs j
      JOIN categories c ON j.category_id = c.id
      WHERE j.id = ?`,
      [jobId]
    );

    const job = createdJobResult.data[0];

    // Get skills for the job
    const skillsResult = await executeQuery(
      `SELECT s.id, s.name 
       FROM job_skills js 
       JOIN skills s ON js.skill_id = s.id 
       WHERE js.job_id = ?`,
      [jobId]
    );

    job.skills = skillsResult.data || [];

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      budget_min,
      budget_max,
      currency,
      duration,
      location,
      category_id,
      skills,
      is_remote,
      status
    } = req.body;

    const client_id = req.user.id;

    // Check if job exists and belongs to user
    const jobCheck = await executeQuery(
      'SELECT id, status FROM jobs WHERE id = ? AND client_id = ?',
      [id, client_id]
    );

    if (!jobCheck.success || jobCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Validate budget if provided
    if (budget_min !== undefined && budget_max !== undefined && budget_min > budget_max) {
      return res.status(400).json({
        success: false,
        message: 'Minimum budget cannot be greater than maximum budget'
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (budget_min !== undefined) {
      updates.push('budget_min = ?');
      values.push(budget_min);
    }
    if (budget_max !== undefined) {
      updates.push('budget_max = ?');
      values.push(budget_max);
    }
    if (currency !== undefined) {
      updates.push('currency = ?');
      values.push(currency);
    }
    if (duration !== undefined) {
      updates.push('duration = ?');
      values.push(duration);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(category_id);
    }
    if (is_remote !== undefined) {
      updates.push('is_remote = ?');
      values.push(is_remote);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    // Update job
    const updateResult = await executeQuery(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update job'
      });
    }

    // Update skills if provided
    if (skills !== undefined) {
      // Remove existing skills
      await executeQuery('DELETE FROM job_skills WHERE job_id = ?', [id]);

      // Add new skills
      if (skills.length > 0) {
        const skillInserts = skills.map(skillId => [id, skillId]);
        await executeQuery(
          `INSERT INTO job_skills (job_id, skill_id) VALUES ${skillInserts.map(() => '(?, ?)').join(', ')}`,
          skillInserts.flat()
        );
      }
    }

    // Get updated job
    const updatedJobResult = await executeQuery(
      `SELECT 
        j.id,
        j.title,
        j.description,
        j.budget_min,
        j.budget_max,
        j.currency,
        j.duration,
        j.location,
        j.is_remote,
        j.status,
        j.created_at,
        j.updated_at,
        c.name as category_name
      FROM jobs j
      JOIN categories c ON j.category_id = c.id
      WHERE j.id = ?`,
      [id]
    );

    const job = updatedJobResult.data[0];

    // Get skills for the job
    const skillsResult = await executeQuery(
      `SELECT s.id, s.name 
       FROM job_skills js 
       JOIN skills s ON js.skill_id = s.id 
       WHERE js.job_id = ?`,
      [id]
    );

    job.skills = skillsResult.data || [];

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const client_id = req.user.id;

    // Check if job exists and belongs to user
    const jobCheck = await executeQuery(
      'SELECT id, status FROM jobs WHERE id = ? AND client_id = ?',
      [id, client_id]
    );

    if (!jobCheck.success || jobCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Check if job has active proposals
    const proposalsCheck = await executeQuery(
      'SELECT COUNT(*) as count FROM proposals WHERE job_id = ? AND status = "pending"',
      [id]
    );

    if (proposalsCheck.data[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete job with pending proposals'
      });
    }

    // Delete job (cascade will handle related records)
    const deleteResult = await executeQuery('DELETE FROM jobs WHERE id = ?', [id]);

    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete job'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
};

// Get user's jobs
export const getUserJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['j.client_id = ?'];
    let queryParams = [userId];

    if (status) {
      whereConditions.push('j.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      WHERE ${whereClause}
    `;

    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult.data[0].total;

    // Get jobs
    const jobsQuery = `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.budget_min,
        j.budget_max,
        j.currency,
        j.duration,
        j.location,
        j.is_remote,
        j.status,
        j.created_at,
        j.updated_at,
        c.name as category_name,
        (SELECT COUNT(*) FROM proposals p WHERE p.job_id = j.id) as proposals_count
      FROM jobs j
      JOIN categories c ON j.category_id = c.id
      WHERE ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const jobsResult = await executeQuery(jobsQuery, [...queryParams, parseInt(limit), offset]);

    // Get skills for each job
    const jobs = await Promise.all(
      jobsResult.data.map(async (job) => {
        const skillsResult = await executeQuery(
          `SELECT s.id, s.name 
           FROM job_skills js 
           JOIN skills s ON js.skill_id = s.id 
           WHERE js.job_id = ?`,
          [job.id]
        );

        return {
          ...job,
          skills: skillsResult.data || []
        };
      })
    );

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user jobs'
    });
  }
};

