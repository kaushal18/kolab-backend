const express = require("express");
const pool = require("../db/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

/* 
  Register url_token and password and log in the user by sending jwt
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

    // create and send refresh and access token
    // create JWT
    const accessToken = jwt.sign(
      { "url_token": token },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '120s' }
    );

    const refreshToken = jwt.sign(
      { "url_token": token },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    // keep access token in memory
    // store password and refresh token in DB
    await pool.query(
      `UPDATE token_document_mapping 
      SET is_password_protected = $1, password = $2, refresh_token = $3
      WHERE url_token = $4`,
      [true, hashedPwd, refreshToken, token]
    );
    
    res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000});
    return res.status(200).send({ accessToken });
  
  } catch (e) {
    console.log(`error in db operation while storing password -> ${e}`);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
