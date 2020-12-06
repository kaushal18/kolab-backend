const pool = require("./config");

async function saveMessage(token, msg) {
  // check if token entry is already present in db
  const prevData = await getMessage(token);
  // update
  if (prevData) {
    await pool.query(
      `UPDATE pastebin
      SET content=$2
      WHERE token = $1`,
      [token, msg]
    );
  }
  // insert new db entry
  else {
    await pool.query(
      `INSERT INTO pastebin (token, content) 
      VALUES ($1, $2)`,
      [token, msg]
    );
  }

  // console.log(data);
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
    console.log(e.message);
  }
}

module.exports = {
  saveMessage,
  getMessage,
};
