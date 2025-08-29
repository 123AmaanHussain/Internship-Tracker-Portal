const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import database connection
const { pool, testConnection } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const companyRoutes = require('./routes/companies');
const collegeRoutes = require('./routes/colleges');
const adminRoutes = require('./routes/admin');
const demoRoutes = require('./routes/demo');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to our routes
app.set('io', io);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadDirs = ['uploads', 'uploads/resumes', 'uploads/logos'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

// Test database connection
testConnection()
  .then(connected => {
    if (!connected) {
      console.warn('Warning: Database connection failed. Running in memory-only mode.');
    } else {
      console.log('Database connection successful. Running with MySQL database.');
    }
  })
  .catch(err => {
    console.error('Error testing database connection:', err);
  });

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/demo', demoRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Digital Internship & Placement Portal API' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join rooms based on user type
  socket.on('join', (userData) => {
    if (userData && userData.userType) {
      console.log(`User ${socket.id} joined room: ${userData.userType}`);
      socket.join(userData.userType);
      
      // Also join the 'admin' room if the user is an admin
      if (userData.userType === 'admin') {
        socket.join('admin-dashboard');
      }
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`WebSocket server is running`);
});