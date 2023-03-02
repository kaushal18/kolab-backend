const express = require("express");
const pool = require("../db/config");
const bcrypt = require("bcrypt");
const router = express.Router();

/* 
  This route checks if the "token" and "password" is valid
*/
router.post("/", async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log("Login route, token - ", token, ", password - ", password);
    if(!token || !password) {
      return res.status(400).send("Token or Password is empty");
    }
    const existRes = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM token_document_mapping
      WHERE url_token = $1)`, 
      [token]
    );

    // if token dosen't exists throw error
    if(!existRes.rows[0].exists) {
      return res.status(401).send("Unauthenticated token");
    }

    const res2 = await pool.query(
      `SELECT password from token_document_mapping
      WHERE url_token = $1`,
      [token]
    )

    const match = await bcrypt.compare(password, res2.rows[0].password);
    if(match) {
      // TODO: create JWT
      return res.status(200).send("Token Authenticated succesfully");
    }
    else {
      return res.status(401).send("Incorrect Token or Password");
    }
    

  } catch (e) {
    console.log(`error in db operation while storing password -> ${e}`);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
