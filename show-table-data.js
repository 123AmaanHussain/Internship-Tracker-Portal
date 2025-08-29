const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function showTableData() {
  let connection;
  const tableName = process.argv[2];
  
  if (!tableName) {
    console.log('Please provide a table name as an argument');
    console.log('Example: node show-table-data.js users');
    return;
  }
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Amaan@123',
      database: process.env.DB_NAME || 'internship_portal'
    });
    
    console.log(`Connected to MySQL database successfully!\n`);
    
    // Show table structure
    console.log(`=== TABLE STRUCTURE: ${tableName} ===`);
    const [columns] = await connection.query(`DESCRIBE ${tableName}`);
    columns.forEach(column => {
      console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''} ${column.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    
    // Show table data
    console.log(`\n=== TABLE DATA: ${tableName} ===`);
    const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      console.log('  No data found in this table');
    } else {
      console.log(`Found ${rows.length} rows:`);
      
      // Print each row in a readable format
      rows.forEach((row, index) => {
        console.log(`\n--- Row ${index + 1} ---`);
        Object.entries(row).forEach(([key, value]) => {
          // Format date objects for better readability
          if (value instanceof Date) {
            console.log(`  ${key}: ${value.toISOString()}`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        });
      });
    }
    
  } catch (error) {
    console.error('Error viewing table data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

showTableData();
