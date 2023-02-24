const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.DB_PORT,
  database: process.env.DATABASE,
  ssl: true
});

module.exports = pool;
