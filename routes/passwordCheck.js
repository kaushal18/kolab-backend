const express = require("express");
const pool = require("../db/config");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { token } = req.body;
    const isPasswordProtected = await pool.query(
      `SELECT is_password_protected FROM token_document_mapping where url_token = $1`,
      [token]
    );
    if (isPasswordProtected.rows[0].exists)
      res.status(200).send("password protected");
    else res.status(404).send("not password protected");
  } catch (e) {
    console.log(`error in db operation while password protection check ${e}`);
  }
});

module.exports = router;
