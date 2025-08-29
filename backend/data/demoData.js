/**
 * Demo Data for the Digital Internship & Placement Portal
 * This file contains all the demo data used in the application
 */

// Demo Users
const demoUsers = [
  {
    userId: 1001,
    email: 'demo.student@example.com',
    password: 'demostudent123', // Will be hashed before insertion
    userType: 'student'
  },
  {
    userId: 2001,
    email: 'demo.company@example.com',
    password: 'democompany123', // Will be hashed before insertion
    userType: 'company'
  },
  {
    userId: 3001,
    email: 'demo.admin@example.com',
    password: 'demoadmin123', // Will be hashed before insertion
    userType: 'admin'
  },
  {
    userId: 4001,
    email: 'demo.college@example.com',
    password: 'democollege123', // Will be hashed before insertion
    userType: 'college'
  }
];

// Demo Student Profiles
const demoStudentProfiles = [
  {
    userId: 1001,
    firstName: 'Demo',
    lastName: 'Student',
    college: 'Demo University',
    degree: 'Bachelor of Technology',
    graduationYear: 2026,
    skills: 'JavaScript, React, Node.js, SQL',
    phone: '9876543210',
    bio: 'A passionate computer science student looking for internship opportunities in web development and software engineering.',
    resumeUrl: '/uploads/resumes/demo-student-resume.pdf'
  }
];

// Demo Company Profiles
const demoCompanyProfiles = [
  {
    userId: 2001,
    companyName: 'Demo Tech Solutions',
    industry: 'Information Technology',
    website: 'https://demo-tech.example.com',
    location: 'Bangalore, Karnataka',
    description: 'A leading technology company specializing in web development, mobile applications, and cloud solutions.',
    logoUrl: '/uploads/logos/demo-company-logo.png',
    approved: true
  }
];

// Demo College Profiles
const demoCollegeProfiles = [
  {
    userId: 4001,
    collegeName: 'Demo University',
    location: 'Chennai, Tamil Nadu',
    website: 'https://demo-university.example.com',
    description: 'A premier educational institution offering various undergraduate and postgraduate programs in engineering and technology.',
    contactEmail: 'contact@demo-university.example.com',
    contactPhone: '1234567890',
    approved: true
  }
];

// Demo Internships
const demoInternships = [
  {
    internshipId: 101,
    companyId: 2001, // Demo Tech Solutions
    title: 'Web Development Intern',
    description: 'We are looking for a passionate web development intern to join our team. The intern will work on real-world projects using modern web technologies.',
    requirements: 'Knowledge of HTML, CSS, JavaScript, and React. Familiarity with Node.js and databases is a plus.',
    location: 'Bangalore (Remote)',
    stipend: '₹15,000 per month',
    duration: '3 months',
    applicationDeadline: '2025-05-30',
    status: 'open'
  },
  {
    internshipId: 102,
    companyId: 2001, // Demo Tech Solutions
    title: 'Mobile App Development Intern',
    description: 'Join our mobile development team to create innovative applications for iOS and Android platforms.',
    requirements: 'Experience with React Native or Flutter. Knowledge of mobile app architecture and state management.',
    location: 'Bangalore (Hybrid)',
    stipend: '₹18,000 per month',
    duration: '6 months',
    applicationDeadline: '2025-06-15',
    status: 'open'
  },
  {
    internshipId: 103,
    companyId: 2001, // Demo Tech Solutions
    title: 'Data Science Intern',
    description: 'Work on data analysis and machine learning projects to extract insights from large datasets.',
    requirements: 'Knowledge of Python, pandas, NumPy, and scikit-learn. Experience with data visualization tools.',
    location: 'Remote',
    stipend: '₹20,000 per month',
    duration: '4 months',
    applicationDeadline: '2025-05-20',
    status: 'open'
  }
];

// Demo Applications
const demoApplications = [
  {
    applicationId: 201,
    internshipId: 101,
    studentId: 1001,
    status: 'pending',
    applicationDate: '2025-04-10'
  },
  {
    applicationId: 202,
    internshipId: 102,
    studentId: 1001,
    status: 'shortlisted',
    applicationDate: '2025-04-08'
  }
];

// Demo Pending Companies
const demoPendingCompanies = [
  {
    profile_id: 1001,
    company_name: "TechNova Solutions",
    industry: "Information Technology",
    location: "Bangalore, Karnataka",
    website: "https://technova-solutions.com",
    description: "TechNova Solutions is a leading IT services company specializing in cloud computing, AI solutions, and enterprise software development. We help businesses transform their digital landscape with cutting-edge technology solutions.",
    email: "contact@technova-solutions.com",
    logo_url: "https://randomuser.me/api/portraits/men/1.jpg",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    profile_id: 1002,
    company_name: "GreenEarth Renewables",
    industry: "Renewable Energy",
    location: "Chennai, Tamil Nadu",
    website: "https://greenearth-renewables.com",
    description: "GreenEarth Renewables is dedicated to providing sustainable energy solutions through solar, wind, and hydroelectric power generation. Our mission is to accelerate the world's transition to clean energy.",
    email: "info@greenearth-renewables.com",
    logo_url: "https://randomuser.me/api/portraits/women/2.jpg",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    profile_id: 1003,
    company_name: "HealthPlus Medical Systems",
    industry: "Healthcare & Medical",
    location: "Mumbai, Maharashtra",
    website: "https://healthplus-medical.com",
    description: "HealthPlus Medical Systems develops innovative healthcare solutions including telemedicine platforms, medical record systems, and patient care management software. We're committed to improving healthcare delivery through technology.",
    email: "support@healthplus-medical.com",
    logo_url: "https://randomuser.me/api/portraits/men/3.jpg",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    profile_id: 1004,
    company_name: "FinEdge Analytics",
    industry: "Financial Services",
    location: "Hyderabad, Telangana",
    website: "https://finedge-analytics.com",
    description: "FinEdge Analytics provides advanced financial data analysis and reporting solutions for banks, investment firms, and insurance companies. Our AI-powered platform delivers actionable insights for better financial decision-making.",
    email: "hello@finedge-analytics.com",
    logo_url: "https://randomuser.me/api/portraits/women/4.jpg",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    profile_id: 1005,
    company_name: "EduSpark Learning",
    industry: "Education Technology",
    location: "Pune, Maharashtra",
    website: "https://eduspark-learning.com",
    description: "EduSpark Learning creates interactive educational platforms and digital learning tools for schools, colleges, and corporate training programs. We're revolutionizing education through engaging, personalized learning experiences.",
    email: "connect@eduspark-learning.com",
    logo_url: "https://randomuser.me/api/portraits/men/5.jpg",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
  },
  {
    profile_id: 1006,
    company_name: "LogiTech Freight Systems",
    industry: "Logistics & Transportation",
    location: "Delhi, NCR",
    website: "https://logitech-freight.com",
    description: "LogiTech Freight Systems offers end-to-end logistics solutions including supply chain management, warehouse automation, and transportation optimization. We leverage technology to make logistics more efficient and sustainable.",
    email: "operations@logitech-freight.com",
    logo_url: "https://randomuser.me/api/portraits/women/6.jpg",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  },
  {
    profile_id: 1007,
    company_name: "AgroSmart Technologies",
    industry: "Agriculture",
    location: "Chandigarh, Punjab",
    website: "https://agrosmart-tech.com",
    description: "AgroSmart Technologies develops precision farming solutions, crop monitoring systems, and agricultural analytics platforms. Our technology helps farmers increase yields, reduce costs, and practice sustainable agriculture.",
    email: "info@agrosmart-tech.com",
    logo_url: "https://randomuser.me/api/portraits/men/7.jpg",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    profile_id: 1008,
    company_name: "CreativeMinds Studio",
    industry: "Digital Media & Entertainment",
    location: "Kolkata, West Bengal",
    website: "https://creativeminds-studio.com",
    description: "CreativeMinds Studio specializes in animation, visual effects, game development, and interactive media. We blend creativity with technology to create immersive digital experiences for global audiences.",
    email: "create@creativeminds-studio.com",
    logo_url: "https://randomuser.me/api/portraits/women/8.jpg",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
  }
];

// Admin Dashboard Stats
const demoAdminStats = {
  students: 245,
  companies: 52,
  internships: 87,
  applications: 632,
  pendingCompanies: 8
};

// Demo Reports Data
const demoReportData = {
  internships: {
    week: [
      { DATE: '2025-04-06', LABEL: 'Apr 06', COUNT: 5 },
      { DATE: '2025-04-07', LABEL: 'Apr 07', COUNT: 3 },
      { DATE: '2025-04-08', LABEL: 'Apr 08', COUNT: 7 },
      { DATE: '2025-04-09', LABEL: 'Apr 09', COUNT: 4 },
      { DATE: '2025-04-10', LABEL: 'Apr 10', COUNT: 8 },
      { DATE: '2025-04-11', LABEL: 'Apr 11', COUNT: 6 },
      { DATE: '2025-04-12', LABEL: 'Apr 12', COUNT: 9 }
    ],
    month: [
      { DATE: '2025-03-15', LABEL: 'Mar 15-21', COUNT: 18 },
      { DATE: '2025-03-22', LABEL: 'Mar 22-28', COUNT: 24 },
      { DATE: '2025-03-29', LABEL: 'Mar 29-Apr 04', COUNT: 31 },
      { DATE: '2025-04-05', LABEL: 'Apr 05-12', COUNT: 42 }
    ],
    quarter: [
      { DATE: '2025-01', LABEL: 'Jan 2025', COUNT: 65 },
      { DATE: '2025-02', LABEL: 'Feb 2025', COUNT: 78 },
      { DATE: '2025-03', LABEL: 'Mar 2025', COUNT: 93 },
      { DATE: '2025-04', LABEL: 'Apr 2025', COUNT: 42 }
    ],
    year: [
      { DATE: '2024-Q2', LABEL: 'Q2 2024', COUNT: 187 },
      { DATE: '2024-Q3', LABEL: 'Q3 2024', COUNT: 215 },
      { DATE: '2024-Q4', LABEL: 'Q4 2024', COUNT: 246 },
      { DATE: '2025-Q1', LABEL: 'Q1 2025', COUNT: 278 }
    ]
  },
  applications: {
    week: [
      { DATE: '2025-04-06', LABEL: 'Apr 06', COUNT: 12 },
      { DATE: '2025-04-07', LABEL: 'Apr 07', COUNT: 18 },
      { DATE: '2025-04-08', LABEL: 'Apr 08', COUNT: 15 },
      { DATE: '2025-04-09', LABEL: 'Apr 09', COUNT: 22 },
      { DATE: '2025-04-10', LABEL: 'Apr 10', COUNT: 19 },
      { DATE: '2025-04-11', LABEL: 'Apr 11', COUNT: 25 },
      { DATE: '2025-04-12', LABEL: 'Apr 12', COUNT: 16 }
    ],
    month: [
      { DATE: '2025-03-15', LABEL: 'Mar 15-21', COUNT: 76 },
      { DATE: '2025-03-22', LABEL: 'Mar 22-28', COUNT: 92 },
      { DATE: '2025-03-29', LABEL: 'Mar 29-Apr 04', COUNT: 104 },
      { DATE: '2025-04-05', LABEL: 'Apr 05-12', COUNT: 127 }
    ],
    quarter: [
      { DATE: '2025-01', LABEL: 'Jan 2025', COUNT: 245 },
      { DATE: '2025-02', LABEL: 'Feb 2025', COUNT: 287 },
      { DATE: '2025-03', LABEL: 'Mar 2025', COUNT: 342 },
      { DATE: '2025-04', LABEL: 'Apr 2025', COUNT: 127 }
    ],
    year: [
      { DATE: '2024-Q2', LABEL: 'Q2 2024', COUNT: 756 },
      { DATE: '2024-Q3', LABEL: 'Q3 2024', COUNT: 892 },
      { DATE: '2024-Q4', LABEL: 'Q4 2024', COUNT: 1045 },
      { DATE: '2025-Q1', LABEL: 'Q1 2025', COUNT: 1001 }
    ]
  },
  students: {
    week: [
      { DATE: '2025-04-06', LABEL: 'Apr 06', COUNT: 8 },
      { DATE: '2025-04-07', LABEL: 'Apr 07', COUNT: 12 },
      { DATE: '2025-04-08', LABEL: 'Apr 08', COUNT: 7 },
      { DATE: '2025-04-09', LABEL: 'Apr 09', COUNT: 15 },
      { DATE: '2025-04-10', LABEL: 'Apr 10', COUNT: 9 },
      { DATE: '2025-04-11', LABEL: 'Apr 11', COUNT: 14 },
      { DATE: '2025-04-12', LABEL: 'Apr 12', COUNT: 11 }
    ],
    month: [
      { DATE: '2025-03-15', LABEL: 'Mar 15-21', COUNT: 42 },
      { DATE: '2025-03-22', LABEL: 'Mar 22-28', COUNT: 56 },
      { DATE: '2025-03-29', LABEL: 'Mar 29-Apr 04', COUNT: 63 },
      { DATE: '2025-04-05', LABEL: 'Apr 05-12', COUNT: 76 }
    ],
    quarter: [
      { DATE: '2025-01', LABEL: 'Jan 2025', COUNT: 145 },
      { DATE: '2025-02', LABEL: 'Feb 2025', COUNT: 178 },
      { DATE: '2025-03', LABEL: 'Mar 2025', COUNT: 203 },
      { DATE: '2025-04', LABEL: 'Apr 2025', COUNT: 76 }
    ],
    year: [
      { DATE: '2024-Q2', LABEL: 'Q2 2024', COUNT: 456 },
      { DATE: '2024-Q3', LABEL: 'Q3 2024', COUNT: 532 },
      { DATE: '2024-Q4', LABEL: 'Q4 2024', COUNT: 612 },
      { DATE: '2025-Q1', LABEL: 'Q1 2025', COUNT: 602 }
    ]
  },
  companies: {
    week: [
      { DATE: '2025-04-06', LABEL: 'Apr 06', COUNT: 2 },
      { DATE: '2025-04-07', LABEL: 'Apr 07', COUNT: 1 },
      { DATE: '2025-04-08', LABEL: 'Apr 08', COUNT: 3 },
      { DATE: '2025-04-09', LABEL: 'Apr 09', COUNT: 0 },
      { DATE: '2025-04-10', LABEL: 'Apr 10', COUNT: 2 },
      { DATE: '2025-04-11', LABEL: 'Apr 11', COUNT: 1 },
      { DATE: '2025-04-12', LABEL: 'Apr 12', COUNT: 2 }
    ],
    month: [
      { DATE: '2025-03-15', LABEL: 'Mar 15-21', COUNT: 8 },
      { DATE: '2025-03-22', LABEL: 'Mar 22-28', COUNT: 6 },
      { DATE: '2025-03-29', LABEL: 'Mar 29-Apr 04', COUNT: 9 },
      { DATE: '2025-04-05', LABEL: 'Apr 05-12', COUNT: 11 }
    ],
    quarter: [
      { DATE: '2025-01', LABEL: 'Jan 2025', COUNT: 23 },
      { DATE: '2025-02', LABEL: 'Feb 2025', COUNT: 28 },
      { DATE: '2025-03', LABEL: 'Mar 2025', COUNT: 32 },
      { DATE: '2025-04', LABEL: 'Apr 2025', COUNT: 11 }
    ],
    year: [
      { DATE: '2024-Q2', LABEL: 'Q2 2024', COUNT: 65 },
      { DATE: '2024-Q3', LABEL: 'Q3 2024', COUNT: 78 },
      { DATE: '2024-Q4', LABEL: 'Q4 2024', COUNT: 92 },
      { DATE: '2025-Q1', LABEL: 'Q1 2025', COUNT: 94 }
    ]
  }
};

module.exports = {
  demoUsers,
  demoStudentProfiles,
  demoCompanyProfiles,
  demoCollegeProfiles,
  demoInternships,
  demoApplications,
  demoPendingCompanies,
  demoAdminStats,
  demoReportData
};
