
const express = require("express");
const pool = require("../db/config");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

/*
  Request new access token when it expires 
  Refresh token is sent in cookies
*/
router.get("/", (req, res) => {
  try {
    const cookies = req.cookies;
    // if no refresh token found in cookie
    if(!cookies?.jwt) {
      return res.sendStatus(401);
    }
    
    const refreshToken = cookies.jwt;

    // retrive the url_token for this refresh token
    const res2 = await pool.query(
      `SELECT url_token from token_document_mapping
      WHERE refresh_token = $1`,
      [refreshToken]
    )

    // Forbidden access - if no url_token is associated with this refresh token
    if(!res2.rows[0].url_token) {
      return res.sendStatus(403);
    }

    // evaluate the refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        // decode refresh token and check if it matches with url_token from DB
        if(err || decoded.url_token !== res2.rows[0].url_token) {
          return res.sendStatus(403);
        }
        // generate new access token
        const accessToken = jwt.sign(
          { "url_token": decoded.url_token },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '30s' }
        );

        return res.status(200).send({ accessToken });
      }
    );

  } catch (e) {
    console.log(`error in db operation while storing password -> ${e}`);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
