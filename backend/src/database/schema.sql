-- FreelanceTN Database Schema
-- Create database (run this first)
-- CREATE DATABASE IF NOT EXISTS freelance_tn;
-- USE freelance_tn;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('freelancer', 'client') NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  location VARCHAR(255),
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_location (location)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id)
);

-- User skills (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_skill (user_id, skill_id),
  INDEX idx_user (user_id),
  INDEX idx_skill (skill_id)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10,2) NOT NULL,
  budget_max DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TND',
  duration VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  category_id INT NOT NULL,
  status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
  is_remote BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_client (client_id),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_location (location),
  INDEX idx_budget (budget_min, budget_max),
  INDEX idx_created (created_at)
);

-- Job skills (many-to-many relationship)
CREATE TABLE IF NOT EXISTS job_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  skill_id INT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE KEY unique_job_skill (job_id, skill_id),
  INDEX idx_job (job_id),
  INDEX idx_skill (skill_id)
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  cover_letter TEXT NOT NULL,
  proposed_budget DECIMAL(10,2) NOT NULL,
  proposed_duration VARCHAR(100) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_job_freelancer (job_id, freelancer_id),
  INDEX idx_job (job_id),
  INDEX idx_freelancer (freelancer_id),
  INDEX idx_status (status)
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  proposal_id INT NOT NULL,
  client_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  contract_amount DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'completed', 'cancelled', 'disputed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_job (job_id),
  INDEX idx_client (client_id),
  INDEX idx_freelancer (freelancer_id),
  INDEX idx_status (status)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contract_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_contract_reviewer (contract_id, reviewer_id),
  INDEX idx_contract (contract_id),
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_reviewee (reviewee_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contract_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_contract (contract_id),
  INDEX idx_sender (sender_id),
  INDEX idx_created (created_at)
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  freelancer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  project_url VARCHAR(500),
  skills_used JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_freelancer (freelancer_id)
);

-- Insert default categories
INSERT IGNORE INTO categories (name, description, icon) VALUES
('Web Development', 'Frontend and backend web development services', 'code'),
('Mobile Apps', 'iOS and Android mobile application development', 'smartphone'),
('Graphic Design', 'Logo design, branding, and visual identity', 'palette'),
('Content Writing', 'Blog posts, articles, and copywriting', 'pen-tool'),
('Digital Marketing', 'SEO, social media, and online advertising', 'trending-up'),
('Translation Services', 'Document and content translation', 'languages'),
('Video Editing', 'Video production and post-production', 'video'),
('Data Entry', 'Data processing and administrative tasks', 'database'),
('Photography', 'Professional photography services', 'camera'),
('Consulting', 'Business and technical consulting', 'briefcase');

-- Insert default skills
INSERT IGNORE INTO skills (name, category_id) VALUES
-- Web Development
('React', 1), ('Vue.js', 1), ('Angular', 1), ('Node.js', 1), ('Express', 1),
('PHP', 1), ('Laravel', 1), ('Python', 1), ('Django', 1), ('Flask', 1),
('JavaScript', 1), ('TypeScript', 1), ('HTML/CSS', 1), ('MySQL', 1), ('PostgreSQL', 1),
('MongoDB', 1), ('Redis', 1), ('AWS', 1), ('Docker', 1), ('Git', 1),

-- Mobile Apps
('React Native', 2), ('Flutter', 2), ('iOS Development', 2), ('Android Development', 2),
('Swift', 2), ('Kotlin', 2), ('Xamarin', 2), ('Ionic', 2),

-- Graphic Design
('Photoshop', 3), ('Illustrator', 3), ('Figma', 3), ('Sketch', 3), ('InDesign', 3),
('Logo Design', 3), ('Branding', 3), ('UI/UX Design', 3), ('Print Design', 3),

-- Content Writing
('Blog Writing', 4), ('Copywriting', 4), ('Technical Writing', 4), ('SEO Writing', 4),
('Social Media Content', 4), ('Email Marketing', 4), ('Press Releases', 4),

-- Digital Marketing
('SEO', 5), ('Google Ads', 5), ('Facebook Ads', 5), ('Instagram Marketing', 5),
('LinkedIn Marketing', 5), ('Email Marketing', 5), ('Analytics', 5), ('Content Strategy', 5),

-- Translation Services
('French', 6), ('Arabic', 6), ('English', 6), ('German', 6), ('Italian', 6),
('Spanish', 6), ('Technical Translation', 6), ('Legal Translation', 6),

-- Video Editing
('Adobe Premiere', 7), ('After Effects', 7), ('Final Cut Pro', 7), ('DaVinci Resolve', 7),
('Motion Graphics', 7), ('Color Grading', 7), ('Video Production', 7),

-- Data Entry
('Excel', 8), ('Google Sheets', 8), ('Data Processing', 8), ('Web Research', 8),
('Lead Generation', 8), ('Virtual Assistant', 8),

-- Photography
('Portrait Photography', 9), ('Event Photography', 9), ('Product Photography', 9),
('Real Estate Photography', 9), ('Wedding Photography', 9),

-- Consulting
('Business Strategy', 10), ('IT Consulting', 10), ('Financial Consulting', 10),
('Marketing Consulting', 10), ('Project Management', 10);

