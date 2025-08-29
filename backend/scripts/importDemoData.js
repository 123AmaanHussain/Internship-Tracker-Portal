/**
 * Import Demo Data Script
 * This script imports all demo data into the MySQL database
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import demo data
const { 
  demoUsers, 
  demoStudentProfiles, 
  demoCompanyProfiles,
  demoCollegeProfiles,
  demoInternships,
  demoApplications,
  demoPendingCompanies,
  demoAdminStats
} = require('../data/demoData');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'internship_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Main function to import all demo data
async function importDemoData() {
  console.log('Starting demo data import...');
  
  try {
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Import demo users
      await importUsers(connection);
      
      // Import student profiles
      await importStudentProfiles(connection);
      
      // Import company profiles
      await importCompanyProfiles(connection);
      
      // Import college profiles
      await importCollegeProfiles(connection);
      
      // Import internships
      await importInternships(connection);
      
      // Import applications
      await importApplications(connection);
      
      // Import pending companies
      await importPendingCompanies(connection);
      
      // Import report data
      await importReportData(connection);
      
      // Import admin stats
      await importAdminStats(connection);
      
      // Commit transaction
      await connection.commit();
      console.log('Demo data import completed successfully!');
      
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      console.error('Error during import, transaction rolled back:', error);
      throw error;
    } finally {
      // Release connection
      connection.release();
    }
    
  } catch (error) {
    console.error('Failed to import demo data:', error);
  } finally {
    // Close pool
    await pool.end();
  }
}

// Import demo users
async function importUsers(connection) {
  console.log('Importing demo users...');
  
  for (const user of demoUsers) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [user.email]
    );
    
    if (existingUsers.length > 0) {
      // Update existing user
      await connection.execute(
        'UPDATE users SET password = ?, user_type = ? WHERE email = ?',
        [hashedPassword, user.userType, user.email]
      );
      console.log(`Updated existing user: ${user.email}`);
    } else {
      // Insert new user
      await connection.execute(
        'INSERT INTO users (user_id, email, password, user_type) VALUES (?, ?, ?, ?)',
        [user.userId, user.email, hashedPassword, user.userType]
      );
      console.log(`Inserted new user: ${user.email}`);
    }
  }
  
  console.log('Demo users import completed');
}

// Import student profiles
async function importStudentProfiles(connection) {
  console.log('Importing student profiles...');
  
  for (const profile of demoStudentProfiles) {
    // Check if profile already exists
    const [existingProfiles] = await connection.execute(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [profile.userId]
    );
    
    if (existingProfiles.length > 0) {
      // Update existing profile
      await connection.execute(
        `UPDATE student_profiles 
         SET first_name = ?, last_name = ?, college = ?, degree = ?, 
             graduation_year = ?, skills = ?, phone = ?, bio = ?, resume_url = ? 
         WHERE user_id = ?`,
        [
          profile.firstName, profile.lastName, profile.college, profile.degree,
          profile.graduationYear, profile.skills, profile.phone, profile.bio,
          profile.resumeUrl, profile.userId
        ]
      );
      console.log(`Updated student profile for user ID: ${profile.userId}`);
    } else {
      // Insert new profile
      await connection.execute(
        `INSERT INTO student_profiles 
         (user_id, first_name, last_name, college, degree, graduation_year, skills, phone, bio, resume_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.userId, profile.firstName, profile.lastName, profile.college,
          profile.degree, profile.graduationYear, profile.skills, profile.phone,
          profile.bio, profile.resumeUrl
        ]
      );
      console.log(`Inserted student profile for user ID: ${profile.userId}`);
    }
  }
  
  console.log('Student profiles import completed');
}

// Import company profiles
async function importCompanyProfiles(connection) {
  console.log('Importing company profiles...');
  
  for (const profile of demoCompanyProfiles) {
    // Check if profile already exists
    const [existingProfiles] = await connection.execute(
      'SELECT * FROM company_profiles WHERE user_id = ?',
      [profile.userId]
    );
    
    if (existingProfiles.length > 0) {
      // Update existing profile
      await connection.execute(
        `UPDATE company_profiles 
         SET company_name = ?, industry = ?, website = ?, location = ?, 
             description = ?, logo_url = ?, approved = ? 
         WHERE user_id = ?`,
        [
          profile.companyName, profile.industry, profile.website, profile.location,
          profile.description, profile.logoUrl, profile.approved, profile.userId
        ]
      );
      console.log(`Updated company profile for user ID: ${profile.userId}`);
    } else {
      // Insert new profile
      await connection.execute(
        `INSERT INTO company_profiles 
         (user_id, company_name, industry, website, location, description, logo_url, approved) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.userId, profile.companyName, profile.industry, profile.website,
          profile.location, profile.description, profile.logoUrl, profile.approved
        ]
      );
      console.log(`Inserted company profile for user ID: ${profile.userId}`);
    }
  }
  
  console.log('Company profiles import completed');
}

// Import college profiles
async function importCollegeProfiles(connection) {
  console.log('Importing college profiles...');
  
  for (const profile of demoCollegeProfiles) {
    // Check if profile already exists
    const [existingProfiles] = await connection.execute(
      'SELECT * FROM college_profiles WHERE user_id = ?',
      [profile.userId]
    );
    
    if (existingProfiles.length > 0) {
      // Update existing profile
      await connection.execute(
        `UPDATE college_profiles 
         SET college_name = ?, location = ?, website = ?, description = ?, 
             contact_email = ?, contact_phone = ?, approved = ? 
         WHERE user_id = ?`,
        [
          profile.collegeName, profile.location, profile.website, profile.description,
          profile.contactEmail, profile.contactPhone, profile.approved, profile.userId
        ]
      );
      console.log(`Updated college profile for user ID: ${profile.userId}`);
    } else {
      // Insert new profile
      await connection.execute(
        `INSERT INTO college_profiles 
         (user_id, college_name, location, website, description, contact_email, contact_phone, approved) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.userId, profile.collegeName, profile.location, profile.website,
          profile.description, profile.contactEmail, profile.contactPhone, profile.approved
        ]
      );
      console.log(`Inserted college profile for user ID: ${profile.userId}`);
    }
  }
  
  console.log('College profiles import completed');
}

// Import internships
async function importInternships(connection) {
  console.log('Importing internships...');
  
  // Get company profile IDs
  const [companyProfiles] = await connection.execute(
    'SELECT profile_id, user_id FROM company_profiles'
  );
  
  // Create a map of user_id to profile_id
  const companyProfileMap = {};
  companyProfiles.forEach(profile => {
    companyProfileMap[profile.user_id] = profile.profile_id;
  });
  
  for (const internship of demoInternships) {
    // Get the actual company profile ID
    const companyProfileId = companyProfileMap[internship.companyId];
    
    if (!companyProfileId) {
      console.warn(`Company profile not found for user ID: ${internship.companyId}, skipping internship: ${internship.title}`);
      continue;
    }
    
    // Check if internship already exists
    const [existingInternships] = await connection.execute(
      'SELECT * FROM internships WHERE internship_id = ?',
      [internship.internshipId]
    );
    
    // Parse application deadline
    const applicationDeadline = new Date(internship.applicationDeadline);
    
    if (existingInternships.length > 0) {
      // Update existing internship
      await connection.execute(
        `UPDATE internships 
         SET company_id = ?, title = ?, description = ?, requirements = ?, 
             location = ?, stipend = ?, duration = ?, application_deadline = ?, status = ? 
         WHERE internship_id = ?`,
        [
          companyProfileId, internship.title, internship.description, internship.requirements,
          internship.location, internship.stipend, internship.duration, applicationDeadline,
          internship.status, internship.internshipId
        ]
      );
      console.log(`Updated internship: ${internship.title}`);
    } else {
      // Insert new internship
      await connection.execute(
        `INSERT INTO internships 
         (internship_id, company_id, title, description, requirements, location, stipend, duration, application_deadline, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          internship.internshipId, companyProfileId, internship.title, internship.description,
          internship.requirements, internship.location, internship.stipend, internship.duration,
          applicationDeadline, internship.status
        ]
      );
      console.log(`Inserted internship: ${internship.title}`);
    }
  }
  
  console.log('Internships import completed');
}

// Import applications
async function importApplications(connection) {
  console.log('Importing applications...');
  
  // Get student profile IDs
  const [studentProfiles] = await connection.execute(
    'SELECT profile_id, user_id FROM student_profiles'
  );
  
  // Create a map of user_id to profile_id
  const studentProfileMap = {};
  studentProfiles.forEach(profile => {
    studentProfileMap[profile.user_id] = profile.profile_id;
  });
  
  for (const application of demoApplications) {
    // Get the actual student profile ID
    const studentProfileId = studentProfileMap[application.studentId];
    
    if (!studentProfileId) {
      console.warn(`Student profile not found for user ID: ${application.studentId}, skipping application ID: ${application.applicationId}`);
      continue;
    }
    
    // Check if application already exists
    const [existingApplications] = await connection.execute(
      'SELECT * FROM applications WHERE application_id = ?',
      [application.applicationId]
    );
    
    // Parse application date
    const applicationDate = new Date(application.applicationDate);
    
    if (existingApplications.length > 0) {
      // Update existing application
      await connection.execute(
        `UPDATE applications 
         SET internship_id = ?, student_id = ?, status = ?, application_date = ? 
         WHERE application_id = ?`,
        [
          application.internshipId, studentProfileId, application.status,
          applicationDate, application.applicationId
        ]
      );
      console.log(`Updated application ID: ${application.applicationId}`);
    } else {
      // Insert new application
      await connection.execute(
        `INSERT INTO applications 
         (application_id, internship_id, student_id, status, application_date) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          application.applicationId, application.internshipId, studentProfileId,
          application.status, applicationDate
        ]
      );
      console.log(`Inserted application ID: ${application.applicationId}`);
    }
  }
  
  console.log('Applications import completed');
}

// Import pending companies
async function importPendingCompanies(connection) {
  console.log('Importing pending companies...');
  
  for (const company of demoPendingCompanies) {
    // Create a new user for each pending company
    const email = company.email;
    const password = 'pendingcompany123'; // Default password
    const userType = 'company';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    let userId;
    
    if (existingUsers.length > 0) {
      // Use existing user
      userId = existingUsers[0].user_id;
      console.log(`Using existing user ID: ${userId} for pending company: ${company.company_name}`);
    } else {
      // Insert new user
      const [result] = await connection.execute(
        'INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)',
        [email, hashedPassword, userType]
      );
      userId = result.insertId;
      console.log(`Created new user ID: ${userId} for pending company: ${company.company_name}`);
    }
    
    // Check if company profile already exists
    const [existingProfiles] = await connection.execute(
      'SELECT * FROM company_profiles WHERE user_id = ?',
      [userId]
    );
    
    // Parse created_at date
    const createdAt = new Date(company.created_at);
    
    if (existingProfiles.length > 0) {
      // Update existing profile
      await connection.execute(
        `UPDATE company_profiles 
         SET company_name = ?, industry = ?, website = ?, location = ?, 
             description = ?, logo_url = ?, approved = false, created_at = ? 
         WHERE user_id = ?`,
        [
          company.company_name, company.industry, company.website, company.location,
          company.description, company.logo_url, createdAt, userId
        ]
      );
      console.log(`Updated pending company profile: ${company.company_name}`);
    } else {
      // Insert new profile
      await connection.execute(
        `INSERT INTO company_profiles 
         (user_id, company_name, industry, website, location, description, logo_url, approved, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, false, ?)`,
        [
          userId, company.company_name, company.industry, company.website,
          company.location, company.description, company.logo_url, createdAt
        ]
      );
      console.log(`Inserted pending company profile: ${company.company_name}`);
    }
  }
  
  console.log('Pending companies import completed');
}

// Import report data
async function importReportData(connection) {
  console.log('Importing report data...');
  
  // Create a demo_reports table if it doesn't exist
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS demo_reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_type VARCHAR(50) NOT NULL,
      time_range VARCHAR(50) NOT NULL,
      date_value VARCHAR(50) NOT NULL,
      label VARCHAR(50) NOT NULL,
      count INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Clear existing demo reports
  await connection.execute('TRUNCATE TABLE demo_reports');
  
  // Import report data from demoReportData
  const { demoReportData } = require('../data/demoData');
  
  for (const reportType in demoReportData) {
    for (const timeRange in demoReportData[reportType]) {
      const data = demoReportData[reportType][timeRange];
      
      for (const item of data) {
        await connection.execute(
          `INSERT INTO demo_reports (report_type, time_range, date_value, label, count) 
           VALUES (?, ?, ?, ?, ?)`,
          [reportType, timeRange, item.DATE, item.LABEL, item.COUNT]
        );
      }
      
      console.log(`Imported ${data.length} records for ${reportType} - ${timeRange}`);
    }
  }
  
  console.log('Report data import completed');
}

// Import admin stats
async function importAdminStats(connection) {
  console.log('Importing admin stats...');
  
  try {
    // Check if demo_stats table exists, create it if not
    await connection.query(`
      CREATE TABLE IF NOT EXISTS demo_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stat_key VARCHAR(50) NOT NULL,
        stat_value INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Clear existing stats
    await connection.query('TRUNCATE TABLE demo_stats');
    
    // Insert admin stats
    const statsEntries = Object.entries(demoAdminStats);
    for (const [key, value] of statsEntries) {
      await connection.query(
        'INSERT INTO demo_stats (stat_key, stat_value) VALUES (?, ?)',
        [key, value]
      );
      console.log(`Imported stat: ${key} = ${value}`);
    }
    
    console.log(`Imported ${statsEntries.length} admin stats`);
    
    // Verify the stats were imported correctly
    const [rows] = await connection.query('SELECT * FROM demo_stats');
    console.log(`Verification: Found ${rows.length} stats in the database`);
    rows.forEach(row => {
      console.log(`  - ${row.stat_key}: ${row.stat_value}`);
    });
  } catch (error) {
    console.error('Error importing admin stats:', error);
    throw error;
  }
}

// Run the import
importDemoData().catch(console.error);
