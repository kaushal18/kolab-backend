const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "kaushal",
  host: "localhost",
  port: 5432,
  database: "pastebindb",
});

module.exports = pool;
