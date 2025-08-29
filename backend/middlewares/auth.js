const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Check if user is a company
const isCompany = (req, res, next) => {
  if (req.user.userType !== 'company') {
    return res.status(403).json({ message: 'Access denied. Company only.' });
  }
  next();
};

// Check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.userType !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student only.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isCompany, isStudent };