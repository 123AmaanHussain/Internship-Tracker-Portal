const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function viewDatabase() {
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
    console.log();
    
    // For each table, show structure and sample data
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`=== TABLE: ${tableName} ===`);
      
      // Show table structure
      console.log('STRUCTURE:');
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      columns.forEach(column => {
        console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''} ${column.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
      });
      console.log();
      
      // Show sample data (up to 5 rows)
      console.log('SAMPLE DATA:');
      const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 5`);
      if (rows.length === 0) {
        console.log('  No data found in this table');
      } else {
        console.table(rows);
      }
      console.log('\n' + '-'.repeat(50) + '\n');
    }
    
  } catch (error) {
    console.error('Error viewing database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

viewDatabase();
