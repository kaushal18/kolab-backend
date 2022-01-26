const pool = require("./config");

async function saveOrUpdate(token, msg) {
  try {
    await pool.query(`INSERT INTO pastebin (token, content) VALUES ($1, $2) 
                      ON CONFLICT (token) DO UPDATE
                      SET content = $2 WHERE token = $1`,
                      [token, msg]);
  } catch(e) {
    return e;
  }
}

async function getMessage(token) {
  try {
    let data = await pool.query(`SELECT * FROM pastebin WHERE token = $1`, [
      token,
    ]);
    if (data.rows[0]) {
      return data.rows[0].content;
    }
    return "";
  } catch (e) {
    return e;
  }
}

module.exports = {
  saveOrUpdate,
  getMessage,
};
