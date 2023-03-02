const express = require("express");
const pool = require("../db/config");
const router = express.Router();

router.get("/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const isPasswordProtected = await pool.query(
      `SELECT is_password_protected FROM token_document_mapping where url_token = $1`,
      [token]
    );
    // if the token dosen't exist in DB
    if (isPasswordProtected.rows.length === 0) {
      res.status(200).send("Token is not password protected");
    }
    // if the token is password protected return status 401 as user needs to be authenticated first
    else if (isPasswordProtected.rows[0].is_password_protected) {
      res.status(401).send("Token is password protected");
    }
    else {
      res.status(200).send("Token is not password protected");
    }
  } catch (e) {
    console.log(`error in db operation while password protection check -> ${e}`);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
