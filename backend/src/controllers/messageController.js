import { executeQuery } from '../config/database.js';

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { recipient_id, content, job_id } = req.body;
    const sender_id = req.user.id;

    // Validate required fields
    if (!recipient_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and content are required'
      });
    }

    // Check if recipient exists
    const recipientCheck = await executeQuery(
      'SELECT id, full_name FROM users WHERE id = ?',
      [recipient_id]
    );

    if (!recipientCheck.success || recipientCheck.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // If job_id is provided, check if both users are involved in the job
    if (job_id) {
      const jobCheck = await executeQuery(
        `SELECT 
          j.id, 
          j.client_id, 
          j.status
        FROM jobs j
        WHERE j.id = ?`,
        [job_id]
      );

      if (!jobCheck.success || jobCheck.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const job = jobCheck.data[0];
      const isClient = job.client_id === sender_id;

      // Check if sender is the client or has any proposal for this job (pending or accepted)
      let isFreelancer = false;
      if (!isClient) {
        const proposalCheck = await executeQuery(
          `SELECT id FROM proposals 
           WHERE job_id = ? AND freelancer_id = ?`,
          [job_id, sender_id]
        );
        isFreelancer = proposalCheck.success && proposalCheck.data.length > 0;
      }

      if (!isClient && !isFreelancer) {
        return res.status(403).json({
          success: false,
          message: 'You are not involved in this job'
        });
      }

      // Check if recipient is the other party in the job
      const isRecipientClient = job.client_id === parseInt(recipient_id);
      
      // Check if recipient is a freelancer with any proposal for this job
      let isRecipientFreelancer = false;
      if (!isRecipientClient) {
        const recipientProposalCheck = await executeQuery(
          `SELECT id FROM proposals 
           WHERE job_id = ? AND freelancer_id = ?`,
          [job_id, parseInt(recipient_id)]
        );
        isRecipientFreelancer = recipientProposalCheck.success && recipientProposalCheck.data.length > 0;
      }

      if (!isRecipientClient && !isRecipientFreelancer) {
        return res.status(403).json({
          success: false,
          message: 'Recipient is not involved in this job'
        });
      }
    }

    // Create message
    const messageResult = await executeQuery(
      `INSERT INTO messages (sender_id, recipient_id, content, job_id)
       VALUES (?, ?, ?, ?)`,
      [sender_id, recipient_id, content, job_id || null]
    );

    if (!messageResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }

    const messageId = messageResult.data.insertId;

    // Get created message with sender details
    const createdMessageResult = await executeQuery(
      `SELECT 
        m.id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.job_id,
        m.created_at,
        u.full_name as sender_name,
        u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?`,
      [messageId]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: createdMessageResult.data[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Get conversation between two users for a specific job
export const getConversation = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { job_id } = req.query;
    const current_user_id = req.user.id;

    let whereConditions = [
      '(m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)'
    ];
    let queryParams = [current_user_id, user_id, user_id, current_user_id];

    if (job_id) {
      whereConditions.push('m.job_id = ?');
      queryParams.push(job_id);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get messages
    const messagesResult = await executeQuery(
      `SELECT 
        m.id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.job_id,
        m.created_at,
        u.full_name as sender_name,
        u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE ${whereClause}
      ORDER BY m.created_at ASC`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        messages: messagesResult.data,
        conversation_with: user_id,
        job_id: job_id
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
};

// Get all conversations for a user (grouped by job)
export const getUserConversations = async (req, res) => {
  try {
    const current_user_id = req.user.id;

    // Get all unique conversations grouped by job
    const conversationsResult = await executeQuery(
      `SELECT DISTINCT
        m.job_id,
        j.title as job_title,
        CASE 
          WHEN m.sender_id = ? THEN m.recipient_id
          ELSE m.sender_id
        END as other_user_id,
        u.full_name as other_user_name,
        u.avatar_url as other_user_avatar,
        u.role as other_user_role,
        MAX(m.created_at) as last_message_time,
        COUNT(m.id) as message_count,
        (SELECT content FROM messages m2 
         WHERE m2.job_id = m.job_id
           AND ((m2.sender_id = ? AND m2.recipient_id = CASE 
                 WHEN m.sender_id = ? THEN m.recipient_id
                 ELSE m.sender_id
               END) 
                OR (m2.sender_id = CASE 
                 WHEN m.sender_id = ? THEN m.recipient_id
                 ELSE m.sender_id
               END AND m2.recipient_id = ?))
         ORDER BY m2.created_at DESC LIMIT 1) as last_message_content,
        p.status as proposal_status
      FROM messages m
      JOIN jobs j ON m.job_id = j.id
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = ? THEN m.recipient_id
          ELSE m.sender_id
        END = u.id
      )
      LEFT JOIN proposals p ON (p.job_id = m.job_id AND p.freelancer_id = CASE 
        WHEN m.sender_id = ? THEN m.recipient_id
        ELSE m.sender_id
      END)
      WHERE m.sender_id = ? OR m.recipient_id = ?
      GROUP BY m.job_id, j.title, other_user_id, u.full_name, u.avatar_url, u.role, p.status
      ORDER BY last_message_time DESC`,
      [current_user_id, current_user_id, current_user_id, current_user_id, current_user_id, current_user_id, current_user_id, current_user_id, current_user_id]
    );

    res.json({
      success: true,
      data: {
        conversations: conversationsResult.data
      }
    });
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { user_id } = req.params;
    const current_user_id = req.user.id;

    const updateResult = await executeQuery(
      `UPDATE messages 
       SET is_read = true 
       WHERE sender_id = ? AND recipient_id = ? AND is_read = false`,
      [user_id, current_user_id]
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const current_user_id = req.user.id;

    const countResult = await executeQuery(
      'SELECT COUNT(*) as unread_count FROM messages WHERE recipient_id = ? AND is_read = false',
      [current_user_id]
    );

    res.json({
      success: true,
      data: {
        unread_count: countResult.data[0].unread_count
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};
