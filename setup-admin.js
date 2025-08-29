const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAdmin() {
  console.log('Setting up admin user in the database...');
  
  try {
    // Create connection to MySQL server with the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'internship_portal'
    });
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin@123', salt);
    
    // Insert or update the admin user
    const query = `
      INSERT INTO users (email, password, user_type) 
      VALUES ('admin@gmail.com', ?, 'admin')
      ON DUPLICATE KEY UPDATE password = ?
    `;
    
    await connection.execute(query, [hashedPassword, hashedPassword]);
    
    console.log('Admin user setup successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin@123');
    
    // Close the connection
    await connection.end();
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

// Run the setup
setupAdmin()
  .then(() => {
    console.log('Admin setup complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to set up admin:', err);
    process.exit(1);
  });
