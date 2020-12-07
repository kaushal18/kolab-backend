const pool = require("./config");

async function saveMessage(token, msg) {
  // check if token entry is already present in db
  const isPresent = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM pastebin where token = $1)`,
    [token]
  );

  try {
    if (isPresent.rows[0].exists) {
      await pool.query(
        `UPDATE pastebin
        SET content = $2
        WHERE token = $1`,
        [token, msg]
      );
    } else {
      await pool.query(
        `INSERT INTO pastebin (token, content) 
        VALUES ($1, $2)`,
        [token, msg]
      );
    }
  } catch (e) {
    console.log(e);
  }
}

async function getMessage(token) {
  try {
    let data = await pool.query(`SELECT * FROM pastebin WHERE token=$1`, [
      token,
    ]);
    if (data.rows[0]) {
      return data.rows[0].content;
    }
    return "";
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  saveMessage,
  getMessage,
};
