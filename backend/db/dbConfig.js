const oracledb = require('oracledb');
require('dotenv').config();

// Set Oracle connection pool configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
  poolMin: 2,
  poolMax: 5,
  poolIncrement: 1
};

// Set oracledb configuration options
oracledb.autoCommit = true;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function initialize() {
  try {
    // Initialize the Oracle connection pool
    await oracledb.createPool(dbConfig);
    console.log('Connection pool created successfully');
  } catch (err) {
    console.error('Error creating connection pool:', err);
    throw err;
  }
}

async function closePool() {
  try {
    await oracledb.getPool().close();
    console.log('Pool closed');
  } catch (err) {
    console.error('Error closing pool:', err);
    throw err;
  }
}

async function execute(sql, binds = {}, options = {}) {
  let connection;
  options.outFormat = oracledb.OUT_FORMAT_OBJECT;
  
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error('Error executing SQL:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

module.exports = { initialize, closePool, execute };