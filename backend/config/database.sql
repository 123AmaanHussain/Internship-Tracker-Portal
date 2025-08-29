-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS internship_portal;
USE internship_portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_type ENUM('student', 'company', 'college', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  college VARCHAR(255) NOT NULL,
  degree VARCHAR(100) NOT NULL,
  graduation_year INT NOT NULL,
  skills TEXT,
  phone VARCHAR(20),
  bio TEXT,
  resume_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Company profiles
CREATE TABLE IF NOT EXISTS company_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  website VARCHAR(255),
  location VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(255),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- College profiles
CREATE TABLE IF NOT EXISTS college_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Internships
CREATE TABLE IF NOT EXISTS internships (
  internship_id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  stipend VARCHAR(100),
  duration VARCHAR(100) NOT NULL,
  application_deadline DATE NOT NULL,
  status ENUM('open', 'closed', 'filled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES company_profiles(profile_id) ON DELETE CASCADE
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  internship_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('pending', 'shortlisted', 'rejected', 'selected') DEFAULT 'pending',
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (internship_id) REFERENCES internships(internship_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (internship_id, student_id)
);

-- College-Student relationships
CREATE TABLE IF NOT EXISTS college_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  college_id INT NOT NULL,
  student_id INT NOT NULL,
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES college_profiles(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(profile_id) ON DELETE CASCADE,
  UNIQUE KEY unique_college_student (college_id, student_id)
);

-- Insert demo admin user
INSERT INTO users (email, password, user_type) 
VALUES ('admin@example.com', '$2b$10$KNvhBIJOKjcKdmLyX1CQNu1sDNGnpUGBZOlUy3YrTXzj.1hbmMIjK', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Insert new admin user with custom credentials
INSERT INTO users (email, password, user_type) 
VALUES ('admin@gmail.com', '$2b$10$wJbSkEG4FGm/Dqmqhvcyj.vpKh8EKh.TBgRcQkvPkbGSRqGf1X9Aq', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Insert demo student user
INSERT INTO users (email, password, user_type)
VALUES ('demo.student@example.com', '$2b$10$X/hX1LzRSgD7UFFOtHqKQ.aUPqRVjAa1VdIZ6qJMFBYOZ3ZB2yBu2', 'student')
ON DUPLICATE KEY UPDATE email = email;

-- Insert demo company user
INSERT INTO users (email, password, user_type)
VALUES ('demo.company@example.com', '$2b$10$8GQfWPBuUBLHBzQpKC6Z0eOXleV9iqM9t0/.wFnWYYD5GrMXyGpYy', 'company')
ON DUPLICATE KEY UPDATE email = email;

-- Insert demo college user
INSERT INTO users (email, password, user_type)
VALUES ('demo.college@example.com', '$2b$10$KNvhBIJOKjcKdmLyX1CQNu1sDNGnpUGBZOlUy3YrTXzj.1hbmMIjK', 'college')
ON DUPLICATE KEY UPDATE email = email;
