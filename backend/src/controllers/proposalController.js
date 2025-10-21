import { executeQuery, executeTransaction } from '../config/database.js';

// Get proposals for a job
export const getJobProposals = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.job_id = ?'];
    let queryParams = [jobId];

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM proposals p
      WHERE ${whereClause}
    `;

    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult.data[0].total;

    // Get proposals
    const proposalsQuery = `
      SELECT 
        p.id,
        p.cover_letter,
        p.proposed_budget,
        p.proposed_duration,
        p.status,
        p.created_at,
        p.updated_at,
        u.id as freelancer_id,
        u.full_name as freelancer_name,
        u.avatar_url as freelancer_avatar,
        u.bio as freelancer_bio,
        u.location as freelancer_location,
        (SELECT COUNT(*) FROM contracts c WHERE c.freelancer_id = u.id AND c.status = 'completed') as completed_projects
      FROM proposals p
      JOIN users u ON p.freelancer_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const proposalsResult = await executeQuery(proposalsQuery, [...queryParams, parseInt(limit), offset]);

    res.json({
      success: true,
      data: {
        proposals: proposalsResult.data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get job proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals'
    });
  }
};

// Get single proposal
export const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;

    const proposalResult = await executeQuery(
      `SELECT 
        p.id,
        p.job_id,
        p.cover_letter,
        p.proposed_budget,
        p.proposed_duration,
        p.status,
        p.created_at,
        p.updated_at,
        u.id as freelancer_id,
        u.full_name as freelancer_name,
        u.avatar_url as freelancer_avatar,
        u.bio as freelancer_bio,
        u.location as freelancer_location,
        u.phone as freelancer_phone,
        j.title as job_title,
        j.budget_min,
        j.budget_max,
        j.currency
      FROM proposals p
      JOIN users u ON p.freelancer_id = u.id
      JOIN jobs j ON p.job_id = j.id
      WHERE p.id = ?`,
      [id]
    );

    if (!proposalResult.success || proposalResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      data: proposalResult.data[0]
    });
  } catch (error) {
    console.error('Get proposal by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposal'
    });
  }
};

// Create proposal
export const createProposal = async (req, res) => {
  try {
    const { job_id, cover_letter, proposed_budget, proposed_duration } = req.body;
    const freelancer_id = req.user.id;

    // Check if user is a freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can create proposals'
      });
    }

    // Check if job exists and is open
    const jobCheck = await executeQuery(
      'SELECT id, client_id, status FROM jobs WHERE id = ?',
      [job_id]
    );

    if (!jobCheck.success || jobCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = jobCheck.data[0];

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Job is not open for proposals'
      });
    }

    // Check if freelancer is not the job owner
    if (job.client_id === freelancer_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot propose on your own job'
      });
    }

    // Check if proposal already exists
    const existingProposal = await executeQuery(
      'SELECT id FROM proposals WHERE job_id = ? AND freelancer_id = ?',
      [job_id, freelancer_id]
    );

    if (existingProposal.success && existingProposal.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a proposal for this job'
      });
    }

    // Create proposal
    const proposalResult = await executeQuery(
      `INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_budget, proposed_duration)
       VALUES (?, ?, ?, ?, ?)`,
      [job_id, freelancer_id, cover_letter, proposed_budget, proposed_duration]
    );

    if (!proposalResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create proposal'
      });
    }

    const proposalId = proposalResult.data.insertId;

    // Get created proposal with details
    const createdProposalResult = await executeQuery(
      `SELECT 
        p.id,
        p.job_id,
        p.cover_letter,
        p.proposed_budget,
        p.proposed_duration,
        p.status,
        p.created_at,
        j.title as job_title
      FROM proposals p
      JOIN jobs j ON p.job_id = j.id
      WHERE p.id = ?`,
      [proposalId]
    );

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: createdProposalResult.data[0]
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create proposal'
    });
  }
};

// Update proposal
export const updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { cover_letter, proposed_budget, proposed_duration, status } = req.body;
    const freelancer_id = req.user.id;

    // Check if proposal exists and belongs to user
    const proposalCheck = await executeQuery(
      'SELECT id, status FROM proposals WHERE id = ? AND freelancer_id = ?',
      [id, freelancer_id]
    );

    if (!proposalCheck.success || proposalCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found or access denied'
      });
    }

    const proposal = proposalCheck.data[0];

    // Check if proposal can be updated
    if (proposal.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update accepted proposal'
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (cover_letter !== undefined) {
      updates.push('cover_letter = ?');
      values.push(cover_letter);
    }
    if (proposed_budget !== undefined) {
      updates.push('proposed_budget = ?');
      values.push(proposed_budget);
    }
    if (proposed_duration !== undefined) {
      updates.push('proposed_duration = ?');
      values.push(proposed_duration);
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

    // Update proposal
    const updateResult = await executeQuery(
      `UPDATE proposals SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update proposal'
      });
    }

    // Get updated proposal
    const updatedProposalResult = await executeQuery(
      `SELECT 
        p.id,
        p.job_id,
        p.cover_letter,
        p.proposed_budget,
        p.proposed_duration,
        p.status,
        p.created_at,
        p.updated_at,
        j.title as job_title
      FROM proposals p
      JOIN jobs j ON p.job_id = j.id
      WHERE p.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Proposal updated successfully',
      data: updatedProposalResult.data[0]
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update proposal'
    });
  }
};

// Accept proposal (client only)
export const acceptProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const client_id = req.user.id;

    // Check if user is a client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can accept proposals'
      });
    }

    // Get proposal with job details
    const proposalResult = await executeQuery(
      `SELECT 
        p.id,
        p.job_id,
        p.freelancer_id,
        p.proposed_budget,
        p.proposed_duration,
        p.status,
        j.client_id,
        j.title as job_title,
        j.status as job_status
      FROM proposals p
      JOIN jobs j ON p.job_id = j.id
      WHERE p.id = ?`,
      [id]
    );

    if (!proposalResult.success || proposalResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposal = proposalResult.data[0];

    // Check if client owns the job
    if (proposal.client_id !== client_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not job owner'
      });
    }

    // Check if proposal is pending
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Proposal is not pending'
      });
    }

    // Check if job is still open
    if (proposal.job_status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Job is no longer open'
      });
    }

    // Start transaction
    const queries = [
      {
        query: 'UPDATE proposals SET status = "accepted", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        params: [id]
      },
      {
        query: 'UPDATE proposals SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE job_id = ? AND id != ?',
        params: [proposal.job_id, id]
      },
      {
        query: 'UPDATE jobs SET status = "in_progress", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        params: [proposal.job_id]
      },
      {
        query: `INSERT INTO contracts (job_id, proposal_id, client_id, freelancer_id, contract_amount, start_date, end_date)
                VALUES (?, ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))`,
        params: [proposal.job_id, id, client_id, proposal.freelancer_id, proposal.proposed_budget, 30]
      }
    ];

    const result = await executeTransaction(queries);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to accept proposal'
      });
    }

    res.json({
      success: true,
      message: 'Proposal accepted and contract created',
      data: {
        proposal_id: id,
        contract_id: result.data[3].insertId
      }
    });
  } catch (error) {
    console.error('Accept proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept proposal'
    });
  }
};

// Reject proposal (client only)
export const rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const client_id = req.user.id;

    // Check if user is a client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can reject proposals'
      });
    }

    // Get proposal with job details
    const proposalResult = await executeQuery(
      `SELECT 
        p.id,
        p.job_id,
        p.status,
        j.client_id
      FROM proposals p
      JOIN jobs j ON p.job_id = j.id
      WHERE p.id = ?`,
      [id]
    );

    if (!proposalResult.success || proposalResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposal = proposalResult.data[0];

    // Check if client owns the job
    if (proposal.client_id !== client_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not job owner'
      });
    }

    // Check if proposal is pending
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Proposal is not pending'
      });
    }

    // Reject the proposal
    const updateResult = await executeQuery(
      'UPDATE proposals SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reject proposal'
      });
    }

    res.json({
      success: true,
      message: 'Proposal rejected successfully'
    });
  } catch (error) {
    console.error('Reject proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject proposal'
    });
  }
};

// Withdraw proposal (freelancer only)
export const withdrawProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer_id = req.user.id;

    // Check if user is a freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can withdraw proposals'
      });
    }

    // Check if proposal exists and belongs to user
    const proposalCheck = await executeQuery(
      'SELECT id, status FROM proposals WHERE id = ? AND freelancer_id = ?',
      [id, freelancer_id]
    );

    if (!proposalCheck.success || proposalCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found or access denied'
      });
    }

    const proposal = proposalCheck.data[0];

    // Check if proposal can be withdrawn
    if (proposal.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw accepted proposal'
      });
    }

    if (proposal.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Proposal already withdrawn'
      });
    }

    // Withdraw the proposal
    const updateResult = await executeQuery(
      'UPDATE proposals SET status = "withdrawn", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to withdraw proposal'
      });
    }

    res.json({
      success: true,
      message: 'Proposal withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw proposal'
    });
  }
};

// Get freelancer's proposals
export const getFreelancerProposals = async (req, res) => {
  try {
    const freelancer_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.freelancer_id = ?'];
    let queryParams = [freelancer_id];

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM proposals p
      WHERE ${whereClause}
    `;

    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult.data[0].total;

    // Get proposals
    const proposalsQuery = `
      SELECT 
        p.id,
        p.job_id,
        p.cover_letter,
        p.proposed_budget,
        p.proposed_duration,
        p.status,
        p.created_at,
        p.updated_at,
        j.title as job_title,
        j.budget_min,
        j.budget_max,
        j.currency,
        j.location,
        j.is_remote,
        u.full_name as client_name,
        u.avatar_url as client_avatar
      FROM proposals p
      JOIN jobs j ON p.job_id = j.id
      JOIN users u ON j.client_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const proposalsResult = await executeQuery(proposalsQuery, [...queryParams, parseInt(limit), offset]);

    res.json({
      success: true,
      data: {
        proposals: proposalsResult.data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get freelancer proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals'
    });
  }
};
