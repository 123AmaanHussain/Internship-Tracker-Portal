const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecretkey');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is a company
const isCompany = (req, res, next) => {
  if (req.user.userType !== 'company') {
    return res.status(403).json({ message: 'Access denied. Not a company.' });
  }
  next();
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Not an admin.' });
  }
  next();
};

// Get all companies (public route)
router.get('/', async (req, res) => {
  try {
    // Get approved companies from database
    const [companies] = await pool.query(
      'SELECT cp.*, u.email FROM company_profiles cp JOIN users u ON cp.user_id = u.user_id WHERE cp.approved = true'
    );
    
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending companies (admin route)
router.get('/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get pending companies from database
    const [companies] = await pool.query(
      'SELECT cp.*, u.email FROM company_profiles cp JOIN users u ON cp.user_id = u.user_id WHERE cp.approved = false'
    );
    
    res.json(companies);
  } catch (error) {
    console.error('Error fetching pending companies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a company (admin route)
router.put('/approve/:id', verifyToken, isAdmin, async (req, res) => {
  const profileId = req.params.id;
  
  try {
    // Update company approval status in database
    const [result] = await pool.query(
      'UPDATE company_profiles SET approved = true WHERE profile_id = ?',
      [profileId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json({ message: 'Company approved successfully' });
  } catch (error) {
    console.error('Error approving company:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a company (admin route)
router.delete('/reject/:id', verifyToken, isAdmin, async (req, res) => {
  const profileId = req.params.id;
  
  try {
    // Get user_id for the company profile
    const [profiles] = await pool.query(
      'SELECT user_id FROM company_profiles WHERE profile_id = ?',
      [profileId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const userId = profiles[0].user_id;
    
    // Begin transaction
    await pool.query('START TRANSACTION');
    
    // Delete company profile
    await pool.query('DELETE FROM company_profiles WHERE profile_id = ?', [profileId]);
    
    // Delete user account
    await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    res.json({ message: 'Company rejected and removed successfully' });
  } catch (error) {
    console.error('Error rejecting company:', error);
    
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  }
});

// Create company profile (company route)
router.post('/profile', verifyToken, isCompany, async (req, res) => {
  const { companyName, industry, website, location, description } = req.body;
  const userId = req.user.userId;
  
  if (!companyName || !industry) {
    return res.status(400).json({ message: 'Company name and industry are required' });
  }
  
  try {
    // Check if profile already exists
    const [existingProfiles] = await pool.query(
      'SELECT * FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (existingProfiles.length > 0) {
      return res.status(400).json({ message: 'Profile already exists' });
    }
    
    // Insert new profile
    const [result] = await pool.query(
      'INSERT INTO company_profiles (user_id, company_name, industry, website, location, description, approved) VALUES (?, ?, ?, ?, ?, ?, false)',
      [userId, companyName, industry, website, location, description]
    );
    
    const profileId = result.insertId;
    
    res.status(201).json({
      message: 'Company profile created successfully. Awaiting admin approval.',
      profile: {
        profileId,
        companyName,
        industry,
        website,
        location,
        description,
        approved: false
      }
    });
  } catch (error) {
    console.error('Error creating company profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company profile (company route)
router.get('/profile', verifyToken, isCompany, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    // Get profile from database
    const [profiles] = await pool.query(
      'SELECT * FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company profile (company route)
router.put('/profile', verifyToken, isCompany, async (req, res) => {
  const { companyName, industry, website, location, description } = req.body;
  const userId = req.user.userId;
  
  if (!companyName || !industry) {
    return res.status(400).json({ message: 'Company name and industry are required' });
  }
  
  try {
    // Update profile in database
    const [result] = await pool.query(
      'UPDATE company_profiles SET company_name = ?, industry = ?, website = ?, location = ?, description = ? WHERE user_id = ?',
      [companyName, industry, website, location, description, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({
      message: 'Company profile updated successfully',
      profile: {
        companyName,
        industry,
        website,
        location,
        description
      }
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create internship (company route)
router.post('/internships', verifyToken, isCompany, async (req, res) => {
  const { title, description, requirements, location, stipend, duration, applicationDeadline } = req.body;
  const userId = req.user.userId;
  
  if (!title || !description || !requirements || !location || !duration || !applicationDeadline) {
    return res.status(400).json({ message: 'All fields except stipend are required' });
  }
  
  try {
    // Get company profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    
    const companyId = profiles[0].profile_id;
    
    // Insert internship
    const [result] = await pool.query(
      'INSERT INTO internships (company_id, title, description, requirements, location, stipend, duration, application_deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [companyId, title, description, requirements, location, stipend, duration, applicationDeadline, 'open']
    );
    
    const internshipId = result.insertId;
    
    res.status(201).json({
      message: 'Internship created successfully',
      internship: {
        internshipId,
        title,
        description,
        requirements,
        location,
        stipend,
        duration,
        applicationDeadline,
        status: 'open'
      }
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company internships (company route)
router.get('/internships', verifyToken, isCompany, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    // Get company profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    
    const companyId = profiles[0].profile_id;
    
    // Get internships
    const [internships] = await pool.query(
      'SELECT * FROM internships WHERE company_id = ?',
      [companyId]
    );
    
    res.json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get internship applications (company route)
router.get('/internships/:id/applications', verifyToken, isCompany, async (req, res) => {
  const internshipId = req.params.id;
  const userId = req.user.userId;
  
  try {
    // Verify company owns this internship
    const [profiles] = await pool.query(
      'SELECT cp.profile_id FROM company_profiles cp WHERE cp.user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    
    const companyId = profiles[0].profile_id;
    
    const [internships] = await pool.query(
      'SELECT * FROM internships WHERE internship_id = ? AND company_id = ?',
      [internshipId, companyId]
    );
    
    if (internships.length === 0) {
      return res.status(404).json({ message: 'Internship not found or not owned by this company' });
    }
    
    // Get applications with student details
    const [applications] = await pool.query(
      `SELECT a.*, sp.first_name, sp.last_name, sp.college, sp.degree, sp.resume_url, u.email 
       FROM applications a 
       JOIN student_profiles sp ON a.student_id = sp.profile_id 
       JOIN users u ON sp.user_id = u.user_id 
       WHERE a.internship_id = ?`,
      [internshipId]
    );
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (company route)
router.put('/applications/:id/status', verifyToken, isCompany, async (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body;
  const userId = req.user.userId;
  
  if (!status || !['pending', 'shortlisted', 'rejected', 'selected'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required' });
  }
  
  try {
    // Verify company owns this application
    const [applications] = await pool.query(
      `SELECT a.* FROM applications a 
       JOIN internships i ON a.internship_id = i.internship_id 
       JOIN company_profiles cp ON i.company_id = cp.profile_id 
       WHERE a.application_id = ? AND cp.user_id = ?`,
      [applicationId, userId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found or not owned by this company' });
    }
    
    // Update application status
    await pool.query(
      'UPDATE applications SET status = ? WHERE application_id = ?',
      [status, applicationId]
    );
    
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
