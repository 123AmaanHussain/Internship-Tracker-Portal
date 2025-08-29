const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  console.log('Initializing database...');
  
  // Create connection to MySQL server (without specifying a database)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });
  
  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'database.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL script into individual statements
    const statements = sqlScript
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement);
      console.log('Executed SQL statement');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to set up database:', err);
    process.exit(1);
  });
