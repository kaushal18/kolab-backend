const pool = require("./config");

async function isTokenPresent(token) {
  try {
    const isPresent = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM pastebin where token = $1)`,
      [token]
    );
    return isPresent.rows[0].exists;
  } catch (e) {
    return e;
  }
}

async function saveMessage(token, msg) {
  // check if token entry is already present in db
  try {
    const alreadyPresent = await isTokenPresent(token);
    if (alreadyPresent instanceof Error) return alreadyPresent;

    if (alreadyPresent) {
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
  isTokenPresent,
  saveMessage,
  getMessage,
};
