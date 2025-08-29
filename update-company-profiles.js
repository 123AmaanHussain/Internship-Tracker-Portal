// Script to update company profiles table and fix approval workflow
require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function updateCompanyProfiles() {
  // Create connection pool with credentials from .env
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  try {
    console.log('Checking if company_profiles table has approved column...');
    
    // Check if the approved column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'company_profiles' 
      AND COLUMN_NAME = 'approved'
    `);
    
    if (columns.length === 0) {
      console.log('Adding approved column to company_profiles table...');
      
      // Add the approved column if it doesn't exist
      await pool.query(`
        ALTER TABLE company_profiles 
        ADD COLUMN approved BOOLEAN DEFAULT FALSE
      `);
      
      console.log('Column added successfully!');
    } else {
      console.log('Approved column already exists.');
    }
    
    // Update any existing company profiles to have approved = false if not set
    console.log('Updating existing company profiles...');
    await pool.query(`
      UPDATE company_profiles 
      SET approved = false 
      WHERE approved IS NULL
    `);
    
    console.log('Company profiles updated successfully!');
    
    // Display all company profiles for verification
    const [companies] = await pool.query(`
      SELECT cp.profile_id, cp.company_name, cp.approved, u.email 
      FROM company_profiles cp 
      JOIN users u ON cp.user_id = u.user_id
    `);
    
    console.log('\nCurrent Company Profiles:');
    console.table(companies);
    
    console.log('\nUpdate completed successfully!');
  } catch (error) {
    console.error('Error updating company profiles:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the update
updateCompanyProfiles().catch(console.error);
