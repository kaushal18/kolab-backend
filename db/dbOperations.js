const pool = require("./config");

async function saveOrUpdate(token, document) {
  try {
    await pool.query(`INSERT INTO token_document_mapping (url_token, document) VALUES ($1, $2) 
                      ON CONFLICT (url_token) DO UPDATE
                      SET document = $2 WHERE token_document_mapping.url_token = $1`,
                      [token, document]);
  } catch(e) {
    console.error("database error while inserting or updating record", e);
    return e;
  }
}

async function getDataForToken(token) {
  try {
    let data = await pool.query(
                      `SELECT * FROM token_document_mapping WHERE url_token = $1`, 
                      [token]
                    );

    if (data.rows[0]) {
      return data.rows[0].document;
    }
    return "";
  } catch (e) {
    return e;
  }
}

module.exports = {
  saveOrUpdate,
  getDataForToken
};
