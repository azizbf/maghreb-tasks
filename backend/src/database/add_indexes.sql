-- Database Performance Indexes for FreelanceTN
-- This file adds indexes to improve query performance

USE freelance_tn;

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_client_status ON jobs(client_id, status);

-- Proposals table indexes
CREATE INDEX IF NOT EXISTS idx_proposals_job_id ON proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_job_freelancer ON proposals(job_id, freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_job_status ON proposals(job_id, status);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_created ON messages(job_id, created_at);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Contracts table indexes
CREATE INDEX IF NOT EXISTS idx_contracts_job_id ON contracts(job_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Portfolio items table indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_items_freelancer_id ON portfolio_items(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_created_at ON portfolio_items(created_at);

-- Skills table indexes
CREATE INDEX IF NOT EXISTS idx_skills_category_id ON skills(category_id);

-- Job skills table indexes
CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill_id ON job_skills(skill_id);

-- Show index information
SHOW INDEX FROM jobs;
SHOW INDEX FROM proposals;
SHOW INDEX FROM messages;
SHOW INDEX FROM users;

