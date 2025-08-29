const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { verifyToken, isCollege } = require('../middleware/auth');
require('dotenv').config();

// Create or update college profile
router.post('/profile', verifyToken, isCollege, async (req, res) => {
  try {
    const { collegeName, location, website, description, accreditation } = req.body;
    const userId = req.user.userId;
    
    if (!collegeName || !location) {
      return res.status(400).json({ message: 'College name and location are required' });
    }
    
    // Check if profile already exists in database
    const [existingProfiles] = await pool.query(
      'SELECT * FROM college_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (existingProfiles.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE college_profiles 
         SET college_name = ?, location = ?, website = ?, description = ?, accreditation = ? 
         WHERE user_id = ?`,
        [collegeName, location, website, description, accreditation, userId]
      );
      
      const profileId = existingProfiles[0].profile_id;
      
      res.json({
        message: 'College profile updated successfully',
        profile: {
          profileId,
          collegeName,
          location,
          website,
          description,
          accreditation
        }
      });
    } else {
      // Create new profile
      const [result] = await pool.query(
        `INSERT INTO college_profiles 
         (user_id, college_name, location, website, description, accreditation) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, collegeName, location, website, description, accreditation]
      );
      
      const profileId = result.insertId;
      
      res.status(201).json({
        message: 'College profile created successfully',
        profile: {
          profileId,
          collegeName,
          location,
          website,
          description,
          accreditation
        }
      });
    }
  } catch (error) {
    console.error('Error creating/updating college profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get college profile
router.get('/profile', verifyToken, isCollege, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find profile in database
    const [profiles] = await pool.query(
      'SELECT * FROM college_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    console.error('Error fetching college profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students associated with the college
router.get('/students', verifyToken, isCollege, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get college profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM college_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'College profile not found' });
    }
    
    const collegeId = profiles[0].profile_id;
    
    // Get associated students with their details
    const [students] = await pool.query(
      `SELECT sp.*, u.email, cs.verification_status, cs.id as association_id
       FROM college_students cs
       JOIN student_profiles sp ON cs.student_id = sp.profile_id
       JOIN users u ON sp.user_id = u.user_id
       WHERE cs.college_id = ?
       ORDER BY cs.verification_status, sp.last_name, sp.first_name`,
      [collegeId]
    );
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching college students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending student verifications
router.get('/students/pending', verifyToken, isCollege, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get college profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM college_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'College profile not found' });
    }
    
    const collegeId = profiles[0].profile_id;
    
    // Get pending student verifications
    const [students] = await pool.query(
      `SELECT sp.*, u.email, cs.verification_status, cs.id as association_id
       FROM college_students cs
       JOIN student_profiles sp ON cs.student_id = sp.profile_id
       JOIN users u ON sp.user_id = u.user_id
       WHERE cs.college_id = ? AND cs.verification_status = 'pending'
       ORDER BY sp.last_name, sp.first_name`,
      [collegeId]
    );
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching pending student verifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify a student
router.put('/students/:id/verify', verifyToken, isCollege, async (req, res) => {
  try {
    const associationId = req.params.id;
    const userId = req.user.userId;
    
    // Get college profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM college_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'College profile not found' });
    }
    
    const collegeId = profiles[0].profile_id;
    
    // Verify the student belongs to this college
    const [associations] = await pool.query(
      'SELECT * FROM college_students WHERE id = ? AND college_id = ?',
      [associationId, collegeId]
    );
    
    if (associations.length === 0) {
      return res.status(404).json({ message: 'Student association not found' });
    }
    
    // Update verification status
    await pool.query(
      'UPDATE college_students SET verification_status = ? WHERE id = ?',
      ['verified', associationId]
    );
    
    res.json({ message: 'Student verified successfully' });
  } catch (error) {
    console.error('Error verifying student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a student
router.put('/students/:id/reject', verifyToken, isCollege, async (req, res) => {
  try {
    const associationId = req.params.id;
    const userId = req.user.userId;
    
    // Get college profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM college_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'College profile not found' });
    }
    
    const collegeId = profiles[0].profile_id;
    
    // Verify the student belongs to this college
    const [associations] = await pool.query(
      'SELECT * FROM college_students WHERE id = ? AND college_id = ?',
      [associationId, collegeId]
    );
    
    if (associations.length === 0) {
      return res.status(404).json({ message: 'Student association not found' });
    }
    
    // Update verification status
    await pool.query(
      'UPDATE college_students SET verification_status = ? WHERE id = ?',
      ['rejected', associationId]
    );
    
    res.json({ message: 'Student rejected successfully' });
  } catch (error) {
    console.error('Error rejecting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a student to the college manually
router.post('/students', verifyToken, isCollege, async (req, res) => {
  try {
    const { studentEmail } = req.body;
    const userId = req.user.userId;
    
    if (!studentEmail) {
      return res.status(400).json({ message: 'Student email is required' });
    }
    
    // Get college profile ID
    const [collegeProfiles] = await pool.query(
      'SELECT profile_id FROM college_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (collegeProfiles.length === 0) {
      return res.status(404).json({ message: 'College profile not found' });
    }
    
    const collegeId = collegeProfiles[0].profile_id;
    
    // Find student by email
    const [users] = await pool.query(
      'SELECT user_id FROM users WHERE email = ? AND user_type = ?',
      [studentEmail, 'student']
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Student not found with the provided email' });
    }
    
    const studentUserId = users[0].user_id;
    
    // Get student profile ID
    const [studentProfiles] = await pool.query(
      'SELECT profile_id FROM student_profiles WHERE user_id = ?',
      [studentUserId]
    );
    
    if (studentProfiles.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const studentId = studentProfiles[0].profile_id;
    
    // Check if student is already associated with this college
    const [existingAssociations] = await pool.query(
      'SELECT * FROM college_students WHERE college_id = ? AND student_id = ?',
      [collegeId, studentId]
    );
    
    if (existingAssociations.length > 0) {
      return res.status(400).json({ message: 'Student is already associated with this college' });
    }
    
    // Add student to college
    await pool.query(
      'INSERT INTO college_students (college_id, student_id, verification_status) VALUES (?, ?, ?)',
      [collegeId, studentId, 'verified']
    );
    
    res.status(201).json({ message: 'Student added to college successfully' });
  } catch (error) {
    console.error('Error adding student to college:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get college dashboard statistics
router.get('/dashboard', verifyToken, isCollege, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get college profile ID
    const [profiles] = await pool.query(
      'SELECT profile_id FROM college_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'College profile not found' });
    }
    
    const collegeId = profiles[0].profile_id;
    
    // Get student counts
    const [totalStudents] = await pool.query(
      'SELECT COUNT(*) as count FROM college_students WHERE college_id = ?',
      [collegeId]
    );
    
    const [verifiedStudents] = await pool.query(
      'SELECT COUNT(*) as count FROM college_students WHERE college_id = ? AND verification_status = ?',
      [collegeId, 'verified']
    );
    
    const [pendingStudents] = await pool.query(
      'SELECT COUNT(*) as count FROM college_students WHERE college_id = ? AND verification_status = ?',
      [collegeId, 'pending']
    );
    
    // Get application statistics
    const [applications] = await pool.query(
      `SELECT COUNT(*) as count, a.status
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.profile_id
       JOIN college_students cs ON sp.profile_id = cs.student_id
       WHERE cs.college_id = ? AND cs.verification_status = 'verified'
       GROUP BY a.status`,
      [collegeId]
    );
    
    const applicationStats = {
      pending: 0,
      shortlisted: 0,
      rejected: 0,
      selected: 0
    };
    
    applications.forEach(stat => {
      applicationStats[stat.status] = stat.count;
    });
    
    res.json({
      students: {
        total: totalStudents[0].count,
        verified: verifiedStudents[0].count,
        pending: pendingStudents[0].count
      },
      applications: applicationStats
    });
  } catch (error) {
    console.error('Error fetching college dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
