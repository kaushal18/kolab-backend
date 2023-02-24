const Pool = require("pg").Pool;

const pool = new Pool({
  user: "kaushal",
  password: "",
  host: "localhost",
  port: 5432,
  database: "kolab",
});

module.exports = pool;
