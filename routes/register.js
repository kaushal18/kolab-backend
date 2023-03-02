const express = require("express");
const pool = require("../db/config");
const bcrypt = require("bcrypt");
const router = express.Router();

/* 
  This route saves the "token" and "password" from the req body into the database
  For every request the provided password is overwritten
*/
router.post("/", async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log("Register route, token - ", token, ", password - ", password);
    if(!token || !password) {
      return res.status(400).send("Token or Password is empty");
    }
    const existRes = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM token_document_mapping where url_token = $1)`, 
      [token]
    );

    // if token dosen't exists in database throw error
    if(!existRes.rows[0].exists) {
      return res.status(401).send("Unauthenticated token");
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE token_document_mapping 
      SET is_password_protected = $1, password = $2
      WHERE url_token = $3`,
      [true, hashedPwd, token]
    );

    return res.status(200).send("Password set successfully");

  } catch (e) {
    console.log(`error in db operation while storing password -> ${e}`);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
