const express = require("express");
const pool = require("../db/config");
const { isTokenPresent } = require("../db/dbOperations");
const router = express.Router();

/**
 *  DB transaction to migrate document from old token to new one
 */
router.post("/", (req, finalRes) => {
  const { oldToken, newToken } = req.body;
  let statusCode;
  pool
    .query("begin")
    .then(res => {
      return pool.query(
        `SELECT EXISTS(SELECT 1 FROM token_document_mapping where url_token = $1)`, 
        [newToken]
      );
    })
    .then(res => {
      if(res.rows[0].exists) {
        statusCode = "409";
        throw new Error("URL already taken");
      }
      
      return pool.query(
        `SELECT document FROM token_document_mapping WHERE url_token = $1`, 
        [oldToken]
      );
    })
    .then(res => {
      return pool.query(
        `INSERT INTO token_document_mapping (url_token, document)
        VALUES ($1, $2)`,
        [newToken, res.rows[0].document]
      );
    })
    .then(res => {
      return pool.query(
        `DELETE FROM token_document_mapping WHERE url_token = $1`, 
        [oldToken]
      );
    })
    .then(res => {
      return pool.query("commit");
    })
    .then(res => {
      console.log("transaction completed");
      finalRes
        .status(200)
        .send(`succesfully migrated from ${oldToken} to ${newToken}`);
    })
    .catch(err => {
      console.error(err);
      pool.query("rollback");
      if(statusCode === "409")  
        finalRes.status(409).send("URL is already taken");
      else if(statusCode === "500") 
        finalRes.status(500).send("Something went wrong, please try again later");
    })
    .catch(err => {
      console.error(err);
    });
});

module.exports = router;
