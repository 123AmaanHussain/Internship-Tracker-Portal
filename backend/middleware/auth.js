const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  console.log('Verifying token...');
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('No authorization header provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.log('No token in authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    console.log('Attempting to verify token');
    const secret = process.env.JWT_SECRET || 'fallbacksecretkey';
    const decoded = jwt.verify(token, secret);
    console.log('Token verified successfully for user:', decoded.userId, 'type:', decoded.userType);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.userType !== 'student') {
    return res.status(403).json({ message: 'Access denied. Not a student.' });
  }
  next();
};

// Middleware to check if user is a company
const isCompany = (req, res, next) => {
  if (req.user.userType !== 'company') {
    return res.status(403).json({ message: 'Access denied. Not a company.' });
  }
  next();
};

// Middleware to check if user is a college
const isCollege = (req, res, next) => {
  if (req.user.userType !== 'college') {
    return res.status(403).json({ message: 'Access denied. Not a college.' });
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

// Middleware to check if user is approved (for companies)
const isApprovedCompany = async (req, res, next) => {
  try {
    console.log('Checking if company is approved, user:', req.user);
    
    if (req.user.userType !== 'company') {
      console.log('User is not a company, type:', req.user.userType);
      return res.status(403).json({ message: 'Access denied. Not a company.' });
    }
    
    // Handle demo users
    if (req.user.isDemo === true) {
      console.log('Demo company user detected, allowing access');
      return next();
    }
    
    console.log('Querying database for company approval status, userId:', req.user.userId);
    const [companies] = await pool.query(
      'SELECT * FROM company_profiles WHERE user_id = ? AND approved = true',
      [req.user.userId]
    );
    
    console.log('Company approval query result:', companies.length > 0 ? 'Approved' : 'Not approved');
    
    if (companies.length === 0) {
      return res.status(403).json({ message: 'Access denied. Company not approved yet.' });
    }
    
    // Add company profile to request for convenience
    req.companyProfile = companies[0];
    next();
  } catch (error) {
    console.error('Error checking company approval status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Middleware to check if user is either an admin or the owner of the resource
const isAdminOrOwner = (req, res, next) => {
  if (req.user.userType === 'admin' || req.user.userId === parseInt(req.params.userId)) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Not authorized.' });
  }
};

// Middleware to check if user is either an admin or a company
const isAdminOrCompany = (req, res, next) => {
  if (req.user.userType === 'admin' || req.user.userType === 'company') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Not authorized.' });
  }
};

module.exports = {
  verifyToken,
  isStudent,
  isCompany,
  isCollege,
  isAdmin,
  isApprovedCompany,
  isAdminOrOwner,
  isAdminOrCompany
};
