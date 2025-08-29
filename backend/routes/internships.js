const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isCompany, isApprovedCompany, isAdmin } = require('../middleware/auth');

// Get all internships (public)
router.get('/', async (req, res) => {
  try {
    const [internships] = await pool.query(
      `SELECT i.*, cp.company_name, cp.industry, cp.location as company_location
       FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE i.status = 'open' AND cp.approved = true
       ORDER BY i.created_at DESC`
    );
    
    res.json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get internship by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const internshipId = req.params.id;
    
    const [internships] = await pool.query(
      `SELECT i.*, cp.company_name, cp.industry, cp.location as company_location, cp.website, cp.description as company_description
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
    console.error('Error fetching internship:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new internship (company only)
router.post('/', verifyToken, isApprovedCompany, async (req, res) => {
  try {
    const { title, description, requirements, location, type, duration, stipend, applicationDeadline } = req.body;
    const userId = req.user.userId;
    
    if (!title || !description || !location || !duration) {
      return res.status(400).json({ message: 'Title, description, location, and duration are required' });
    }
    
    // Get company profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM company_profiles WHERE user_id = ? AND approved = true',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Company profile not found or not approved yet' });
    }
    
    const companyId = profiles[0].profile_id;
    
    // Create internship
    const [result] = await pool.query(
      `INSERT INTO internships 
       (company_id, title, description, requirements, location, type, duration, stipend, application_deadline, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [companyId, title, description, requirements, location, type, duration, stipend, applicationDeadline, 'open']
    );
    
    const internshipId = result.insertId;
    
    res.status(201).json({
      message: 'Internship created successfully',
      internship: {
        internshipId,
        companyId,
        title,
        status: 'open'
      }
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update internship (company only)
router.put('/:id', verifyToken, isCompany, async (req, res) => {
  try {
    const internshipId = req.params.id;
    const { title, description, requirements, location, type, duration, stipend, applicationDeadline, status } = req.body;
    const userId = req.user.userId;
    
    // Check if internship exists and belongs to the company
    const [internships] = await pool.query(
      `SELECT i.* FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE i.internship_id = ? AND cp.user_id = ?`,
      [internshipId, userId]
    );
    
    if (internships.length === 0) {
      return res.status(404).json({ message: 'Internship not found or you do not have permission to edit it' });
    }
    
    // Update internship
    await pool.query(
      `UPDATE internships SET 
       title = ?, 
       description = ?, 
       requirements = ?, 
       location = ?, 
       type = ?, 
       duration = ?, 
       stipend = ?, 
       application_deadline = ?,
       status = ?,
       updated_at = NOW()
       WHERE internship_id = ?`,
      [title, description, requirements, location, type, duration, stipend, applicationDeadline, status, internshipId]
    );
    
    res.json({ message: 'Internship updated successfully' });
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company's internships (company only)
router.get('/company/listings', verifyToken, isCompany, async (req, res) => {
  try {
    const userId = req.user.userId;
    
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
      'SELECT * FROM internships WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );
    
    res.json(internships);
  } catch (error) {
    console.error('Error fetching company internships:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete internship (company only)
router.delete('/:id', verifyToken, isCompany, async (req, res) => {
  try {
    const internshipId = req.params.id;
    const userId = req.user.userId;
    
    // Check if internship exists and belongs to the company
    const [internships] = await pool.query(
      `SELECT i.* FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE i.internship_id = ? AND cp.user_id = ?`,
      [internshipId, userId]
    );
    
    if (internships.length === 0) {
      return res.status(404).json({ message: 'Internship not found or you do not have permission to delete it' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete all applications for this internship
      await connection.query(
        'DELETE FROM applications WHERE internship_id = ?',
        [internshipId]
      );
      
      // Delete the internship
      await connection.query(
        'DELETE FROM internships WHERE internship_id = ?',
        [internshipId]
      );
      
      await connection.commit();
      res.json({ message: 'Internship deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting internship:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for an internship (company only)
router.get('/:id/applications', verifyToken, isCompany, async (req, res) => {
  try {
    const internshipId = req.params.id;
    const userId = req.user.userId;
    
    // Check if internship exists and belongs to the company
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
      `SELECT a.*, 
              sp.first_name, sp.last_name, sp.college, sp.degree, sp.skills, sp.resume_url,
              u.email
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
router.put('/:internshipId/applications/:applicationId', verifyToken, isCompany, async (req, res) => {
  try {
    const { internshipId, applicationId } = req.params;
    const { status, feedback } = req.body;
    const userId = req.user.userId;
    
    if (!status || !['pending', 'shortlisted', 'rejected', 'selected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (pending, shortlisted, rejected, selected)' });
    }
    
    // Check if internship exists and belongs to the company
    const [internships] = await pool.query(
      `SELECT i.* FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       WHERE i.internship_id = ? AND cp.user_id = ?`,
      [internshipId, userId]
    );
    
    if (internships.length === 0) {
      return res.status(404).json({ message: 'Internship not found or you do not have permission to update applications' });
    }
    
    // Check if application exists for this internship
    const [applications] = await pool.query(
      'SELECT * FROM applications WHERE application_id = ? AND internship_id = ?',
      [applicationId, internshipId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found for this internship' });
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

// Get internship statistics (company only)
router.get('/company/stats', verifyToken, isCompany, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get company profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    
    const companyId = profiles[0].profile_id;
    
    // Get internship statistics
    const [stats] = await pool.query(
      `SELECT 
        COUNT(DISTINCT i.internship_id) AS total_internships,
        COUNT(DISTINCT CASE WHEN i.status = 'open' THEN i.internship_id END) AS open_internships,
        COUNT(DISTINCT CASE WHEN i.status = 'closed' THEN i.internship_id END) AS closed_internships,
        COUNT(DISTINCT a.application_id) AS total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.application_id END) AS pending_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'shortlisted' THEN a.application_id END) AS shortlisted_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'rejected' THEN a.application_id END) AS rejected_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'selected' THEN a.application_id END) AS selected_applications
       FROM company_profiles cp
       LEFT JOIN internships i ON cp.profile_id = i.company_id
       LEFT JOIN applications a ON i.internship_id = a.internship_id
       WHERE cp.profile_id = ?`,
      [companyId]
    );
    
    // Get application count by internship
    const [internshipStats] = await pool.query(
      `SELECT 
        i.internship_id, i.title,
        COUNT(a.application_id) AS application_count,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN a.status = 'shortlisted' THEN 1 END) AS shortlisted_count,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) AS rejected_count,
        COUNT(CASE WHEN a.status = 'selected' THEN 1 END) AS selected_count
       FROM internships i
       LEFT JOIN applications a ON i.internship_id = a.internship_id
       WHERE i.company_id = ?
       GROUP BY i.internship_id, i.title
       ORDER BY application_count DESC`,
      [companyId]
    );
    
    res.json({
      overallStats: stats[0],
      internshipStats
    });
  } catch (error) {
    console.error('Error fetching internship statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
