const express = require("express");
const pool = require("../db/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

/* 
  This route checks if the "token" and "password" is valid
  If the token and password are valid the function returns an access token with limited time expiry and an refresh token as httpOnly cookie
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
      // create JWT
      const accessToken = jwt.sign(
        { "url_token": token },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30s' }
      );

      const refreshToken = jwt.sign(
        { "url_token": token },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      // keep access token in memory
      // store the refresh token in DB
      await pool.query(
        `UPDATE token_document_mapping 
        SET refresh_token = $1
        WHERE url_token = $2`,
        [refreshToken, token]
      );
      
      res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000});
      return res.status(200).send({ accessToken });
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
