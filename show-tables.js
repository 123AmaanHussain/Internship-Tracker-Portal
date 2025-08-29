const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function showTables() {
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
    
    // Show all tables
    console.log('=== TABLES IN DATABASE ===');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    // Ask which table to view
    console.log('\nTo view a specific table, run:');
    console.log('node show-table-data.js <table_name>');
    
  } catch (error) {
    console.error('Error viewing database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

showTables();
