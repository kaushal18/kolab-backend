const Pool = require("pg").Pool;

const pool = new Pool({
  connectionString: process.env.NODE_APP_DATABASE_URL,
  ssl: true
});

module.exports = pool;
