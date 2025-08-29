const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './backend/.env' });

async function checkAdminUsers() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Amaan@123',
      database: process.env.DB_NAME || 'internship_portal'
    });
    
    console.log('Connected to MySQL database successfully!\n');
    
    // Check admin users
    console.log('=== ADMIN USERS IN DATABASE ===');
    const [adminUsers] = await connection.query('SELECT * FROM users WHERE user_type = ?', ['admin']);
    
    if (adminUsers.length === 0) {
      console.log('No admin users found in the database.');
    } else {
      console.log(`Found ${adminUsers.length} admin users:`);
      
      for (const user of adminUsers) {
        console.log(`\n--- Admin User ---`);
        console.log(`User ID: ${user.user_id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Password Hash: ${user.password}`);
        console.log(`Created: ${user.created_at}`);
        
        // Test if 'admin123' matches the stored hash
        const isMatch = await bcrypt.compare('admin123', user.password);
        console.log(`Password 'admin123' matches: ${isMatch ? 'YES' : 'NO'}`);
      }
    }
    
    // Create a new admin user with correct hash
    console.log('\n=== CREATING NEW ADMIN USER ===');
    
    // Check if our test admin already exists
    const [existingTestAdmin] = await connection.query(
      'SELECT * FROM users WHERE email = ?', 
      ['test.admin@example.com']
    );
    
    if (existingTestAdmin.length > 0) {
      console.log('Test admin user already exists. Deleting...');
      await connection.query('DELETE FROM users WHERE email = ?', ['test.admin@example.com']);
    }
    
    // Create a new admin with proper hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const [result] = await connection.query(
      'INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)',
      ['test.admin@example.com', hashedPassword, 'admin']
    );
    
    console.log(`New admin user created with ID: ${result.insertId}`);
    console.log('Email: test.admin@example.com');
    console.log('Password: admin123');
    console.log('Please try logging in with these credentials.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

checkAdminUsers();
