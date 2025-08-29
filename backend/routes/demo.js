/**
 * Demo Data API Routes
 * These routes provide access to demo data for the application
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Import demo data
const { 
  demoAdminStats, 
  demoReportData,
  demoPendingCompanies
} = require('../data/demoData');

/**
 * @route   GET /api/demo/stats
 * @desc    Get demo admin dashboard stats
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching demo stats from database...');
    
    // Try to get stats from the database first
    try {
      const [rows] = await pool.query('SELECT * FROM demo_stats');
      
      // If we have stats in the database, format and return them
      if (rows && rows.length > 0) {
        console.log('Found demo stats in database:', rows.length, 'rows');
        const statsFromDb = {};
        
        // Convert the rows to an object
        rows.forEach(row => {
          statsFromDb[row.stat_key] = row.stat_value;
        });
        
        console.log('Formatted stats:', statsFromDb);
        
        // Return the stats from database
        return res.json(statsFromDb);
      } else {
        console.log('No demo stats found in database, using hardcoded stats');
      }
    } catch (dbError) {
      console.error('Error querying demo_stats table:', dbError);
      // If there's an error with the database query, check if the table exists
      try {
        const [tables] = await pool.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = DATABASE() 
          AND table_name = 'demo_stats'
        `);
        
        if (tables[0].count === 0) {
          console.log('demo_stats table does not exist, creating it...');
          
          // Create the demo_stats table
          await pool.query(`
            CREATE TABLE IF NOT EXISTS demo_stats (
              id INT AUTO_INCREMENT PRIMARY KEY,
              stat_key VARCHAR(50) NOT NULL,
              stat_value INT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          // Insert the hardcoded stats
          const statsEntries = Object.entries(demoAdminStats);
          for (const [key, value] of statsEntries) {
            await pool.query(
              'INSERT INTO demo_stats (stat_key, stat_value) VALUES (?, ?)',
              [key, value]
            );
          }
          
          console.log('Created demo_stats table and inserted hardcoded stats');
        }
      } catch (tableError) {
        console.error('Error checking/creating demo_stats table:', tableError);
      }
    }
    
    // Fallback to hardcoded stats if not in database
    console.log('Returning hardcoded demo stats');
    res.json(demoAdminStats);
  } catch (error) {
    console.error('Error fetching demo stats:', error);
    
    // Fallback to hardcoded stats on error
    res.json(demoAdminStats);
  }
});

/**
 * @route   GET /api/demo/pending-companies
 * @desc    Get demo pending companies
 * @access  Public
 */
router.get('/pending-companies', (req, res) => {
  try {
    res.json(demoPendingCompanies);
  } catch (error) {
    console.error('Error fetching demo pending companies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/demo/reports/:reportType/:timeRange
 * @desc    Get demo report data
 * @access  Public
 */
router.get('/reports/:reportType/:timeRange', (req, res) => {
  try {
    const { reportType, timeRange } = req.params;
    
    if (!demoReportData[reportType] || !demoReportData[reportType][timeRange]) {
      return res.status(404).json({ message: 'Report data not found' });
    }
    
    res.json(demoReportData[reportType][timeRange]);
  } catch (error) {
    console.error('Error fetching demo report data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/demo/check-database
 * @desc    Check if demo data exists in the database
 * @access  Public
 */
router.get('/check-database', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users WHERE email LIKE "demo.%@example.com"');
    const demoDataExists = users[0].count > 0;
    
    res.json({ 
      demoDataExists,
      count: users[0].count,
      message: demoDataExists ? 'Demo data exists in the database' : 'Demo data not found in the database'
    });
  } catch (error) {
    console.error('Error checking demo data in database:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/demo/import
 * @desc    Trigger demo data import
 * @access  Public
 */
router.post('/import', (req, res) => {
  try {
    // Import demo data using child process
    const { spawn } = require('child_process');
    const path = require('path');
    
    const importProcess = spawn('node', [path.join(__dirname, '..', 'scripts', 'importDemoData.js')]);
    
    // Get Socket.io instance
    const io = req.app.get('io');
    
    importProcess.stdout.on('data', (data) => {
      console.log(`Import stdout: ${data}`);
      
      // Check if this is the completion message
      const dataStr = data.toString();
      if (dataStr.includes('Demo data import completed successfully')) {
        // Emit real-time update to admin dashboard
        if (io) {
          // Fetch updated stats
          pool.query(`
            SELECT 
              (SELECT COUNT(*) FROM student_profiles) as students,
              (SELECT COUNT(*) FROM company_profiles) as companies,
              (SELECT COUNT(*) FROM internships) as internships,
              (SELECT COUNT(*) FROM applications) as applications,
              (SELECT COUNT(*) FROM company_profiles WHERE approved = false) as pendingCompanies
          `).then(([stats]) => {
            // Format the stats for the dashboard
            const formattedStats = {
              students: stats[0].students,
              companies: stats[0].companies,
              internships: stats[0].internships,
              applications: stats[0].applications,
              pendingCompanies: stats[0].pendingCompanies
            };
            
            // Emit to all admin dashboards
            io.to('admin-dashboard').emit('stats-updated', formattedStats);
            io.to('admin-dashboard').emit('demo-data-imported', {
              success: true,
              timestamp: new Date(),
              stats: formattedStats
            });
          }).catch(err => {
            console.error('Error fetching updated stats after import:', err);
          });
        }
      }
    });
    
    importProcess.stderr.on('data', (data) => {
      console.error(`Import stderr: ${data}`);
    });
    
    importProcess.on('close', (code) => {
      console.log(`Import process exited with code ${code}`);
    });
    
    res.json({ message: 'Demo data import started' });
  } catch (error) {
    console.error('Error starting demo data import:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/demo/delete
 * @desc    Delete all demo data from the database
 * @access  Public
 */
router.delete('/delete', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      console.log('Deleting all demo data from the database...');
      
      // Delete demo reports (special table for demo data)
      if (await tableExists(connection, 'demo_reports')) {
        await connection.query('TRUNCATE TABLE demo_reports');
        console.log('Deleted data from demo_reports table');
      }
      
      // Delete applications from demo students
      await connection.query(`
        DELETE a FROM applications a
        JOIN student_profiles sp ON a.student_id = sp.profile_id
        JOIN users u ON sp.user_id = u.user_id
        WHERE u.email LIKE 'demo.%@example.com'
      `);
      console.log('Deleted applications from demo students');
      
      // Delete internships from demo companies
      await connection.query(`
        DELETE i FROM internships i
        JOIN company_profiles cp ON i.company_id = cp.profile_id
        JOIN users u ON cp.user_id = u.user_id
        WHERE u.email LIKE 'demo.%@example.com'
      `);
      console.log('Deleted internships from demo companies');
      
      // Delete student profiles for demo users
      await connection.query(`
        DELETE sp FROM student_profiles sp
        JOIN users u ON sp.user_id = u.user_id
        WHERE u.email LIKE 'demo.%@example.com'
      `);
      console.log('Deleted student profiles for demo users');
      
      // Delete company profiles for demo users
      await connection.query(`
        DELETE cp FROM company_profiles cp
        JOIN users u ON cp.user_id = u.user_id
        WHERE u.email LIKE 'demo.%@example.com'
      `);
      console.log('Deleted company profiles for demo users');
      
      // Delete college profiles for demo users
      await connection.query(`
        DELETE cp FROM college_profiles cp
        JOIN users u ON cp.user_id = u.user_id
        WHERE u.email LIKE 'demo.%@example.com'
      `);
      console.log('Deleted college profiles for demo users');
      
      // Finally, delete demo users
      await connection.query(`
        DELETE FROM users
        WHERE email LIKE 'demo.%@example.com'
      `);
      console.log('Deleted demo users');
      
      // Commit the transaction
      await connection.commit();
      
      // Get Socket.io instance and emit real-time update
      const io = req.app.get('io');
      if (io) {
        // Fetch updated stats
        const [stats] = await pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM student_profiles) as students,
            (SELECT COUNT(*) FROM company_profiles) as companies,
            (SELECT COUNT(*) FROM internships) as internships,
            (SELECT COUNT(*) FROM applications) as applications,
            (SELECT COUNT(*) FROM company_profiles WHERE approved = false) as pendingCompanies
        `);
        
        // Format the stats for the dashboard
        const formattedStats = {
          students: stats[0].students,
          companies: stats[0].companies,
          internships: stats[0].internships,
          applications: stats[0].applications,
          pendingCompanies: stats[0].pendingCompanies
        };
        
        // Emit to all admin dashboards
        io.to('admin-dashboard').emit('stats-updated', formattedStats);
        io.to('admin-dashboard').emit('demo-data-deleted', {
          success: true,
          timestamp: new Date(),
          stats: formattedStats
        });
      }
      
      res.json({ 
        success: true, 
        message: 'All demo data has been successfully deleted from the database' 
      });
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      console.error('Error deleting demo data:', error);
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting demo data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting demo data', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/demo/user
 * @desc    Get a demo user by email
 * @access  Public
 */
router.get('/user', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Get the user from the database
    const [users] = await pool.query(
      'SELECT user_id, email, user_type FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Demo user not found' });
    }
    
    const user = users[0];
    
    // Format the user object to match the expected format
    const formattedUser = {
      userId: user.user_id,
      email: user.email,
      userType: user.user_type,
      isDemo: true
    };
    
    res.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching demo user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to check if a table exists
async function tableExists(connection, tableName) {
  try {
    const [result] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = ?
    `, [tableName]);
    
    return result[0].count > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

module.exports = router;
