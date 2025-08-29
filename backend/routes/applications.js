const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isStudent, isCompany, isAdmin } = require('../middleware/auth');

// Apply for internship (student only)
router.post('/', verifyToken, isStudent, async (req, res) => {
  try {
    const { internshipId, coverLetter } = req.body;
    const userId = req.user.userId;
    
    if (!internshipId) {
      return res.status(400).json({ message: 'Internship ID is required' });
    }
    
    // Get student profile ID
    const [studentProfiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (studentProfiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found. Please create a profile first.' });
    }
    
    const studentId = studentProfiles[0].profile_id;
    
    // Check if internship exists and is from an approved company
    const [internships] = await pool.query(
      `SELECT i.* FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE i.internship_id = ? AND i.status = 'open' AND cp.approved = true`,
      [internshipId]
    );
    
    if (internships.length === 0) {
      return res.status(404).json({ message: 'Internship not found or not accepting applications' });
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
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's applications (student only)
router.get('/student', verifyToken, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get student profile ID
    const [studentProfiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (studentProfiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const studentId = studentProfiles[0].profile_id;
    
    // Get all applications with internship and company details
    const [applications] = await pool.query(
      `SELECT a.*, i.title, i.location, i.duration, i.stipend, cp.company_name
       FROM applications a
       JOIN internships i ON a.internship_id = i.internship_id
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE a.student_id = ?
       ORDER BY a.apply_date DESC`,
      [studentId]
    );
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for an internship (company only)
router.get('/internship/:id', verifyToken, isCompany, async (req, res) => {
  try {
    const internshipId = req.params.id;
    const userId = req.user.userId;
    
    // Check if internship belongs to the company
    const [internships] = await pool.query(
      `SELECT i.* FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE i.internship_id = ? AND cp.user_id = ?`,
      [internshipId, userId]
    );
    
    if (internships.length === 0) {
      return res.status(404).json({ message: 'Internship not found or you do not have permission to view applications' });
    }
    
    // Get applications with student details
    const [applications] = await pool.query(
      `SELECT a.*, sp.first_name, sp.last_name, sp.college, sp.degree, sp.skills, sp.resume_url, u.email
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.profile_id
       JOIN users u ON sp.user_id = u.user_id
       WHERE a.internship_id = ?
       ORDER BY a.apply_date DESC`,
      [internshipId]
    );
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (company only)
router.put('/:id/status', verifyToken, isCompany, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status, feedback } = req.body;
    const userId = req.user.userId;
    
    if (!status || !['pending', 'shortlisted', 'rejected', 'selected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (pending, shortlisted, rejected, selected)' });
    }
    
    // Check if application belongs to an internship from this company
    const [applications] = await pool.query(
      `SELECT a.* FROM applications a
       JOIN internships i ON a.internship_id = i.internship_id
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE a.application_id = ? AND cp.user_id = ?`,
      [applicationId, userId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found or you do not have permission to update it' });
    }
    
    // Update application status
    await pool.query(
      'UPDATE applications SET status = ?, feedback = ?, updated_at = NOW() WHERE application_id = ?',
      [status, feedback, applicationId]
    );
    
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get application details (student or company)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.userId;
    const userType = req.user.userType;
    
    let application;
    
    if (userType === 'student') {
      // Get student profile ID
      const [studentProfiles] = await pool.query(
        'SELECT profile_id FROM student_profiles WHERE user_id = ?',
        [userId]
      );
      
      if (studentProfiles.length === 0) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      
      const studentId = studentProfiles[0].profile_id;
      
      // Get application if it belongs to the student
      const [applications] = await pool.query(
        `SELECT a.*, i.title, i.description, i.requirements, i.location, i.type, i.duration, i.stipend, 
                cp.company_name, cp.industry, cp.website, cp.location as company_location
         FROM applications a
         JOIN internships i ON a.internship_id = i.internship_id
         JOIN company_profiles cp ON i.company_id = cp.profile_id
         WHERE a.application_id = ? AND a.student_id = ?`,
        [applicationId, studentId]
      );
      
      if (applications.length === 0) {
        return res.status(404).json({ message: 'Application not found or you do not have permission to view it' });
      }
      
      application = applications[0];
      
    } else if (userType === 'company') {
      // Get application if it belongs to an internship from this company
      const [applications] = await pool.query(
        `SELECT a.*, sp.first_name, sp.last_name, sp.college, sp.degree, sp.skills, sp.resume_url,
                i.title, i.description, u.email
         FROM applications a
         JOIN student_profiles sp ON a.student_id = sp.profile_id
         JOIN users u ON sp.user_id = u.user_id
         JOIN internships i ON a.internship_id = i.internship_id
         JOIN company_profiles cp ON i.company_id = cp.profile_id
         WHERE a.application_id = ? AND cp.user_id = ?`,
        [applicationId, userId]
      );
      
      if (applications.length === 0) {
        return res.status(404).json({ message: 'Application not found or you do not have permission to view it' });
      }
      
      application = applications[0];
      
    } else if (userType === 'admin') {
      // Admins can view any application
      const [applications] = await pool.query(
        `SELECT a.*, 
              sp.first_name, sp.last_name, sp.college, sp.degree,
              i.title as internship_title, i.location as internship_location,
              cp.company_name, cp.industry,
              u_student.email as student_email, u_company.email as company_email
         FROM applications a
         JOIN student_profiles sp ON a.student_id = sp.profile_id
         JOIN users u_student ON sp.user_id = u_student.user_id
         JOIN internships i ON a.internship_id = i.internship_id
         JOIN company_profiles cp ON i.company_id = cp.profile_id
         JOIN users u_company ON cp.user_id = u_company.user_id
         WHERE a.application_id = ?`,
        [applicationId]
      );
      
      if (applications.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      application = applications[0];
    } else {
      return res.status(403).json({ message: 'Unauthorized to view this application' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw application (student only)
router.delete('/:id', verifyToken, isStudent, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.userId;
    
    // Get student profile ID
    const [studentProfiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (studentProfiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const studentId = studentProfiles[0].profile_id;
    
    // Check if application exists and belongs to this student
    const [applications] = await pool.query(
      'SELECT * FROM applications WHERE application_id = ? AND student_id = ?',
      [applicationId, studentId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found or you do not have permission to withdraw it' });
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

// Get all applications (admin only)
router.get('/admin/all', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get all applications with student, internship, and company details
    const [applications] = await pool.query(
      `SELECT a.*, 
              sp.first_name, sp.last_name, sp.college, sp.degree,
              i.title as internship_title, i.location as internship_location,
              cp.company_name, cp.industry,
              u_student.email as student_email, u_company.email as company_email
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.profile_id
       JOIN users u_student ON sp.user_id = u_student.user_id
       JOIN internships i ON a.internship_id = i.internship_id
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       JOIN users u_company ON cp.user_id = u_company.user_id
       ORDER BY a.apply_date DESC
       LIMIT 100`
    );
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get application statistics (admin only)
router.get('/admin/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get overall application statistics
    const [overallStats] = await pool.query(
      `SELECT 
        COUNT(*) AS total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_applications,
        COUNT(CASE WHEN status = 'shortlisted' THEN 1 END) AS shortlisted_applications,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_applications,
        COUNT(CASE WHEN status = 'selected' THEN 1 END) AS selected_applications,
        COUNT(DISTINCT student_id) AS total_students_applied,
        COUNT(DISTINCT internship_id) AS total_internships_applied_to
       FROM applications`
    );
    
    // Get company-wise application statistics
    const [companyStats] = await pool.query(
      `SELECT 
        cp.company_name,
        COUNT(*) AS total_applications,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_applications,
        COUNT(CASE WHEN a.status = 'shortlisted' THEN 1 END) AS shortlisted_applications,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) AS rejected_applications,
        COUNT(CASE WHEN a.status = 'selected' THEN 1 END) AS selected_applications
       FROM applications a
       JOIN internships i ON a.internship_id = i.internship_id
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       GROUP BY cp.company_name
       ORDER BY total_applications DESC
       LIMIT 10`
    );
    
    // Get college-wise application statistics
    const [collegeStats] = await pool.query(
      `SELECT 
        sp.college,
        COUNT(*) AS total_applications,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_applications,
        COUNT(CASE WHEN a.status = 'shortlisted' THEN 1 END) AS shortlisted_applications,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) AS rejected_applications,
        COUNT(CASE WHEN a.status = 'selected' THEN 1 END) AS selected_applications,
        COUNT(DISTINCT a.student_id) AS total_students
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.profile_id
       GROUP BY sp.college
       ORDER BY total_applications DESC
       LIMIT 10`
    );
    
    res.json({
      overallStats: overallStats[0],
      companyStats,
      collegeStats
    });
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
