const multer = require('multer');
const path = require('path');

// Configure storage for resume uploads
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Configure storage for company logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logos');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for resumes (PDF, DOC, DOCX)
const resumeFilter = (req, file, cb) => {
  const allowedFileTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
  }
};

// File filter for logos (JPG, PNG)
const logoFilter = (req, file, cb) => {
  const allowedFileTypes = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed for logos'), false);
  }
};

// Create multer upload instances
const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: logoFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

module.exports = { uploadResume, uploadLogo };