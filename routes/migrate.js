const express = require("express");
const pool = require("../db/config");
const { isTokenPresent } = require("../db/dbOperations");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { oldToken, newToken } = req.body;
    const oldTokenPresent = await isTokenPresent(oldToken);
    if (!oldTokenPresent) return res.status(404).send("token not found");

    const newTokenPresent = await isTokenPresent(newToken);
    if (newTokenPresent) return res.status(400).send("token already present");

    // prettier-ignore
    const { rows: result} = await pool.query(
      `SELECT content FROM pastebin WHERE token = $1`, 
      [oldToken]
    );
    // console.log(result[0].content);
    await pool.query(
      `INSERT INTO pastebin (token, content)
      VALUES ($1, $2)`,
      [newToken, result[0].content]
    );
    await pool.query(`DELETE FROM pastebin WHERE token = $1`, [oldToken]);

    res.send(`succesfully migrated from ${oldToken} to ${newToken}`);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
