const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isStudent } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only PDF and DOCX files
    const filetypes = /pdf|docx|doc/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed!'));
    }
  }
});

// Create student profile
router.post('/profile', verifyToken, isStudent, upload.single('resume'), async (req, res) => {
  try {
    const { firstName, lastName, college, degree, skills, bio } = req.body;
    const userId = req.user.userId;
    
    if (!firstName || !lastName || !college || !degree) {
      return res.status(400).json({ message: 'First name, last name, college and degree are required' });
    }
    
    // Check if profile already exists
    const [existingProfiles] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    let profileId;
    let resumeUrl = null;
    
    // If file was uploaded, save the path
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }
    
    if (existingProfiles.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE student_profiles 
         SET first_name = ?, last_name = ?, college = ?, degree = ?, skills = ?, bio = ?, resume_url = COALESCE(?, resume_url)
         WHERE user_id = ?`,
        [firstName, lastName, college, degree, skills, bio, resumeUrl || null, userId]
      );
      
      profileId = existingProfiles[0].profile_id;
    } else {
      // Create new profile
      const [result] = await pool.query(
        `INSERT INTO student_profiles 
         (user_id, first_name, last_name, college, degree, skills, bio, resume_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, college, degree, skills, bio, resumeUrl]
      );
      
      profileId = result.insertId;
    }
    
    res.status(201).json({
      message: 'Profile updated successfully',
      profile: {
        profileId,
        firstName,
        lastName,
        college,
        degree,
        skills,
        bio,
        resumeUrl
      }
    });
  } catch (error) {
    console.error('Error creating/updating student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student profile
router.get('/profile', verifyToken, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find profile in database
    const [profiles] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all available internships
router.get('/internships', verifyToken, isStudent, async (req, res) => {
  try {
    // Get all internships from approved companies
    const [internships] = await pool.query(
      `SELECT i.*, cp.company_name, cp.industry, cp.location as company_location
       FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE cp.approved = true AND i.status = 'open'
       ORDER BY i.created_at DESC`
    );
    
    res.json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get internship details
router.get('/internships/:id', verifyToken, isStudent, async (req, res) => {
  try {
    const internshipId = req.params.id;
    
    // Get internship details
    const [internships] = await pool.query(
      `SELECT i.*, cp.company_name, cp.industry, cp.website, cp.location as company_location, cp.description as company_description
       FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE i.internship_id = ? AND cp.approved = true`,
      [internshipId]
    );
    
    if (internships.length === 0) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    
    res.json(internships[0]);
  } catch (error) {
    console.error('Error fetching internship details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for internship
router.post('/apply/:id', verifyToken, isStudent, async (req, res) => {
  try {
    const internshipId = req.params.id;
    const userId = req.user.userId;
    const { coverLetter } = req.body;
    
    // Get student profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found. Please create a profile first.' });
    }
    
    const studentId = profiles[0].profile_id;
    
    // Check if internship exists and is from an approved company
    const [internships] = await pool.query(
      `SELECT i.* FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE i.internship_id = ? AND cp.approved = true AND i.status = 'open'`,
      [internshipId]
    );
    
    if (internships.length === 0) {
      return res.status(404).json({ message: 'Internship not found or not available' });
    }
    
    // Check if already applied
    const [existingApplications] = await pool.query(
      'SELECT * FROM applications WHERE student_id = ? AND internship_id = ?',
      [studentId, internshipId]
    );
    
    if (existingApplications.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this internship' });
    }
    
    // Create application
    const [result] = await pool.query(
      'INSERT INTO applications (student_id, internship_id, cover_letter, status, apply_date) VALUES (?, ?, ?, ?, NOW())',
      [studentId, internshipId, coverLetter, 'pending']
    );
    
    const applicationId = result.insertId;
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        applicationId,
        internshipId,
        studentId,
        status: 'pending',
        applyDate: new Date()
      }
    });
  } catch (error) {
    console.error('Error applying for internship:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student applications
router.get('/applications', verifyToken, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get student profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const studentId = profiles[0].profile_id;
    
    // Get applications with internship and company details
    const [applications] = await pool.query(
      `SELECT a.*, i.title, i.location, i.duration, cp.company_name
       FROM applications a
       JOIN internships i ON a.internship_id = i.internship_id
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE a.student_id = ?
       ORDER BY a.apply_date DESC`,
      [studentId]
    );
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get application details
router.get('/applications/:id', verifyToken, isStudent, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.userId;
    
    // Get student profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const studentId = profiles[0].profile_id;
    
    // Get application with internship and company details
    const [applications] = await pool.query(
      `SELECT a.*, i.title, i.description, i.requirements, i.location, i.stipend, i.duration, 
              cp.company_name, cp.industry, cp.website
       FROM applications a
       JOIN internships i ON a.internship_id = i.internship_id
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE a.application_id = ? AND a.student_id = ?`,
      [applicationId, studentId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(applications[0]);
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw application
router.delete('/applications/:id', verifyToken, isStudent, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.userId;
    
    // Get student profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const studentId = profiles[0].profile_id;
    
    // Check if application exists and belongs to this student
    const [applications] = await pool.query(
      'SELECT * FROM applications WHERE application_id = ? AND student_id = ?',
      [applicationId, studentId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Delete application
    await pool.query(
      'DELETE FROM applications WHERE application_id = ?',
      [applicationId]
    );
    
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get college details for a student
router.get('/college', verifyToken, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get student profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const studentId = profiles[0].profile_id;
    
    // Get college details
    const [colleges] = await pool.query(
      `SELECT cp.* 
       FROM college_students cs
       JOIN college_profiles cp ON cs.college_id = cp.profile_id
       WHERE cs.student_id = ?`,
      [studentId]
    );
    
    if (colleges.length === 0) {
      return res.status(404).json({ message: 'No college association found' });
    }
    
    res.json(colleges[0]);
  } catch (error) {
    console.error('Error fetching college details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
