const { Pool } = require("pg");
require("dotenv").config(); // Ensure you have dotenv installed

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render's managed databases
  },
});

module.exports = pool;
