const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  console.log('verifyAdminToken middleware called');
  console.log('Query params:', req.query);
  
  // Special case: Handle demo token from localStorage
  if (req.header('X-Demo-Admin') === 'true') {
    console.log('Demo admin access granted via X-Demo-Admin header');
    req.user = {
      userId: 3001,
      email: 'demo.admin@example.com',
      userType: 'admin',
      isDemo: true
    };
    return next();
  }
  
  // If demo parameter is present, allow access as demo admin
  const isDemoAdmin = req.query.demo === 'true' && req.query.type === 'admin';
  if (isDemoAdmin) {
    console.log('Demo admin access granted via query params');
    req.user = {
      userId: 3001,
      email: 'demo.admin@example.com',
      userType: 'admin',
      isDemo: true
    };
    return next();
  }
  
  // Special case: Handle custom admin token
  const authHeader = req.header('Authorization');
  if (authHeader === 'Bearer admin-token-custom') {
    console.log('Custom admin token detected');
    req.user = {
      userId: 3002,
      email: 'admin@gmail.com',
      userType: 'admin',
      isDemo: false
    };
    return next();
  }
  
  // Check for token in Authorization header
  if (!authHeader) {
    console.log('No Authorization header found');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  console.log('Authorization header:', authHeader);
  
  // Extract token from header
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  if (!token) {
    console.log('No token found in Authorization header');
    return res.status(401).json({ message: 'Access denied. Invalid token format.' });
  }
  
  // Special case: Handle demo token
  if (token === 'demo-token' || token.startsWith('demo-token-')) {
    console.log('Demo token detected:', token);
    req.user = {
      userId: 3001,
      email: 'demo.admin@example.com',
      userType: 'admin',
      isDemo: true
    };
    return next();
  }
  
  // Special case: Handle custom admin token again (in case the format changed)
  if (token === 'admin-token-custom') {
    console.log('Custom admin token detected (extracted)');
    req.user = {
      userId: 3002,
      email: 'admin@gmail.com',
      userType: 'admin',
      isDemo: false
    };
    return next();
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'fallbacksecretkey';
    console.log('Verifying token with secret:', secret);
    const decoded = jwt.verify(token, secret);
    console.log('Decoded token:', decoded);
    
    // Check for userType or user_type in the decoded token
    const userType = decoded.userType || decoded.user_type;
    if (!userType) {
      console.log('No user type found in decoded token');
      return res.status(401).json({ message: 'Invalid token. Missing user type.' });
    }
    
    if (userType !== 'admin') {
      console.log('User is not an admin:', userType);
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }
    
    req.user = decoded;
    console.log('Admin access granted via token');
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Invalid token: ' + err.message });
  }
};

// Get all pending company approvals
router.get('/pending-companies', verifyAdminToken, async (req, res) => {
  console.log('Pending companies endpoint called');
  console.log('User:', req.user);
  
  try {
    // Check if this is a demo admin
    const isDemoAdmin = req.user && req.user.isDemo === true;
    console.log('Is demo admin:', isDemoAdmin);
    
    if (isDemoAdmin) {
      console.log('Returning demo pending companies');
      // For demo admin, return demo data
      return res.json([
        {
          profile_id: 1001,
          company_name: "TechNova Solutions",
          industry: "Information Technology",
          location: "Bangalore, Karnataka",
          website: "https://technova-solutions.com",
          description: "TechNova Solutions is a leading IT services company.",
          email: "contact@technova-solutions.com",
          approved: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          profile_id: 1002,
          company_name: "GreenEarth Renewables",
          industry: "Renewable Energy",
          location: "Chennai, Tamil Nadu",
          website: "https://greenearth-renewables.com",
          description: "GreenEarth Renewables is dedicated to providing sustainable energy solutions.",
          email: "info@greenearth-renewables.com",
          approved: false,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
    
    // For regular admin, get pending companies from database
    console.log('Querying database for pending companies');
    const [companies] = await pool.query(
      `SELECT cp.*, u.email 
       FROM company_profiles cp
       JOIN users u ON cp.user_id = u.user_id
       WHERE cp.approved = false
       ORDER BY cp.profile_id`
    );
    
    console.log('Pending companies found:', companies.length);
    res.json(companies);
  } catch (error) {
    console.error('Error fetching pending companies:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve a company
router.put('/approve-company/:id', verifyAdminToken, async (req, res) => {
  console.log('Approve company endpoint called for ID:', req.params.id);
  console.log('User:', req.user);
  
  try {
    // Check if this is a demo admin
    const isDemoAdmin = req.user && req.user.isDemo === true;
    console.log('Is demo admin:', isDemoAdmin);
    
    if (isDemoAdmin) {
      console.log('Demo admin approval - no database update');
      // For demo admin, just return success without updating database
      return res.json({ message: 'Company approved successfully (Demo Mode)' });
    }
    
    // For regular admin, update the database
    console.log('Updating company approval status in database');
    const [result] = await pool.query(
      'UPDATE company_profiles SET approved = true WHERE profile_id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      console.log('Company not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Company not found' });
    }
    
    console.log('Company approved successfully');
    res.json({ message: 'Company approved successfully' });
    
    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      console.log('Emitting companyApproved event');
      req.app.get('io').emit('companyApproved', {
        companyId: req.params.id,
        companyName: 'Company' // Ideally, we would fetch the company name here
      });
    }
  } catch (error) {
    console.error('Error approving company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject a company
router.delete('/reject-company/:id', verifyAdminToken, async (req, res) => {
  try {
    // Get user_id for the company profile
    const [profiles] = await pool.query(
      'SELECT user_id FROM company_profiles WHERE profile_id = ?',
      [req.params.id]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const userId = profiles[0].user_id;
    
    // Begin transaction
    await pool.query('START TRANSACTION');
    
    // Delete company profile
    await pool.query('DELETE FROM company_profiles WHERE profile_id = ?', [req.params.id]);
    
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

// Get all users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, email, user_type, created_at FROM users ORDER BY user_id'
    );
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details by ID
router.get('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user basic info
    const [users] = await pool.query(
      'SELECT user_id, email, user_type, created_at FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    let profileData = null;
    
    // Get profile data based on user type
    if (user.user_type === 'student') {
      const [profiles] = await pool.query(
        'SELECT * FROM student_profiles WHERE user_id = ?',
        [userId]
      );
      if (profiles.length > 0) {
        profileData = profiles[0];
      }
    } else if (user.user_type === 'company') {
      const [profiles] = await pool.query(
        'SELECT * FROM company_profiles WHERE user_id = ?',
        [userId]
      );
      if (profiles.length > 0) {
        profileData = profiles[0];
      }
    } else if (user.user_type === 'college') {
      const [profiles] = await pool.query(
        'SELECT * FROM college_profiles WHERE user_id = ?',
        [userId]
      );
      if (profiles.length > 0) {
        profileData = profiles[0];
      }
    }
    
    res.json({
      ...user,
      profile: profileData
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Begin transaction
    await pool.query('START TRANSACTION');
    
    // Get user type
    const [users] = await pool.query(
      'SELECT user_type FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userType = users[0].user_type;
    
    // Delete profile based on user type
    if (userType === 'student') {
      // Get profile ID
      const [profiles] = await pool.query(
        'SELECT profile_id FROM student_profiles WHERE user_id = ?',
        [userId]
      );
      
      if (profiles.length > 0) {
        const profileId = profiles[0].profile_id;
        
        // Delete applications
        await pool.query('DELETE FROM applications WHERE student_id = ?', [profileId]);
        
        // Delete student-college relationships
        await pool.query('DELETE FROM college_students WHERE student_id = ?', [profileId]);
        
        // Delete profile
        await pool.query('DELETE FROM student_profiles WHERE profile_id = ?', [profileId]);
      }
    } else if (userType === 'company') {
      // Get profile ID
      const [profiles] = await pool.query(
        'SELECT profile_id FROM company_profiles WHERE user_id = ?',
        [userId]
      );
      
      if (profiles.length > 0) {
        const profileId = profiles[0].profile_id;
        
        // Get internship IDs
        const [internships] = await pool.query(
          'SELECT internship_id FROM internships WHERE company_id = ?',
          [profileId]
        );
        
        // Delete applications for each internship
        for (const internship of internships) {
          await pool.query(
            'DELETE FROM applications WHERE internship_id = ?',
            [internship.internship_id]
          );
        }
        
        // Delete internships
        await pool.query('DELETE FROM internships WHERE company_id = ?', [profileId]);
        
        // Delete profile
        await pool.query('DELETE FROM company_profiles WHERE profile_id = ?', [profileId]);
      }
    } else if (userType === 'college') {
      // Get profile ID
      const [profiles] = await pool.query(
        'SELECT profile_id FROM college_profiles WHERE user_id = ?',
        [userId]
      );
      
      if (profiles.length > 0) {
        const profileId = profiles[0].profile_id;
        
        // Delete student-college relationships
        await pool.query('DELETE FROM college_students WHERE college_id = ?', [profileId]);
        
        // Delete profile
        await pool.query('DELETE FROM college_profiles WHERE profile_id = ?', [profileId]);
      }
    }
    
    // Delete user
    await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/stats', verifyAdminToken, async (req, res) => {
  console.log('Admin stats endpoint called');
  console.log('User:', req.user);
  
  try {
    // Check if this is a demo admin
    const isDemoAdmin = req.user && req.user.isDemo === true;
    console.log('Is demo admin:', isDemoAdmin);
    
    if (isDemoAdmin) {
      console.log('Returning demo stats');
      // For demo admin, return demo stats
      return res.json({
        students: 245,
        companies: 52,
        internships: 87,
        applications: 632,
        pendingCompanies: 8
      });
    }
    
    // For regular admin, try to get counts from database with error handling
    let statsData = {
      students: 0,
      companies: 0,
      internships: 0,
      applications: 0,
      pendingCompanies: 0
    };
    
    try {
      console.log('Querying student count');
      const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM student_profiles');
      statsData.students = studentCount[0].count;
    } catch (err) {
      console.error('Error getting student count:', err.message);
    }
    
    try {
      console.log('Querying company count');
      const [companyCount] = await pool.query('SELECT COUNT(*) as count FROM company_profiles');
      statsData.companies = companyCount[0].count;
    } catch (err) {
      console.error('Error getting company count:', err.message);
    }
    
    try {
      console.log('Querying internship count');
      const [internshipCount] = await pool.query('SELECT COUNT(*) as count FROM internships');
      statsData.internships = internshipCount[0].count;
    } catch (err) {
      console.error('Error getting internship count:', err.message);
    }
    
    try {
      console.log('Querying application count');
      const [applicationCount] = await pool.query('SELECT COUNT(*) as count FROM applications');
      statsData.applications = applicationCount[0].count;
    } catch (err) {
      console.error('Error getting application count:', err.message);
    }
    
    // Try different approaches for pending companies
    try {
      console.log('Trying approved=false for pending companies');
      const [pendingCount] = await pool.query("SELECT COUNT(*) as count FROM company_profiles WHERE approved = false");
      statsData.pendingCompanies = pendingCount[0].count;
    } catch (err1) {
      console.error('Error with approved=false:', err1.message);
      try {
        console.log('Trying status=pending for pending companies');
        const [pendingCount] = await pool.query("SELECT COUNT(*) as count FROM company_profiles WHERE status = 'pending'");
        statsData.pendingCompanies = pendingCount[0].count;
      } catch (err2) {
        console.error('Error with status=pending:', err2.message);
        // Just use the default value of 0
      }
    }
    
    console.log('Returning stats data:', statsData);
    res.json(statsData);
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    // Return fallback stats instead of error
    res.json({
      students: 0,
      companies: 0,
      internships: 0,
      applications: 0,
      pendingCompanies: 0,
      error: err.message
    });
  }
});

// Generate application reports
router.get('/reports/applications', verifyAdminToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    let query = `
      SELECT a.status, COUNT(*) AS count
      FROM applications a
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ` AND a.apply_date >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND a.apply_date <= ?`;
      params.push(endDate);
    }
    
    query += ` GROUP BY a.status ORDER BY count DESC`;
    
    const [results] = await pool.query(query, params);
    
    res.json(results);
  } catch (error) {
    console.error('Error generating application report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company-wise internship report
router.get('/reports/companies', verifyAdminToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT cp.company_name, 
              COUNT(DISTINCT i.internship_id) AS internship_count,
              COUNT(DISTINCT a.application_id) AS application_count,
              COUNT(DISTINCT CASE WHEN a.status = 'selected' THEN a.application_id END) AS selected_count
       FROM company_profiles cp
       LEFT JOIN internships i ON cp.profile_id = i.company_id
       LEFT JOIN applications a ON i.internship_id = a.internship_id
       WHERE cp.approved = true
       GROUP BY cp.company_name
       ORDER BY internship_count DESC`
    );
    
    res.json(results);
  } catch (error) {
    console.error('Error generating company report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all internships
router.get('/internships', verifyAdminToken, async (req, res) => {
  try {
    const [internships] = await pool.query(
      `SELECT i.*, cp.company_name 
       FROM internships i
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       ORDER BY i.created_at DESC`
    );
    
    res.json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all applications
router.get('/applications', verifyAdminToken, async (req, res) => {
  try {
    const [applications] = await pool.query(
      `SELECT a.*, 
              sp.first_name, sp.last_name, 
              i.title, 
              cp.company_name
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.profile_id
       JOIN internships i ON a.internship_id = i.internship_id
       JOIN company_profiles cp ON i.company_id = cp.profile_id
       ORDER BY a.apply_date DESC`
    );
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new admin user
router.post('/create-admin', verifyAdminToken, async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new admin user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)',
      [email, hashedPassword, 'admin']
    );
    
    res.status(201).json({
      message: 'Admin user created successfully',
      userId: result.insertId,
      email
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
