const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.NODE_APP_DB_URL,
  ssl: true
});

module.exports = pool;
