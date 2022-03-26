const express = require("express");
const pool = require("../db/config");
const { isTokenPresent } = require("../db/dbOperations");
const router = express.Router();

/**
 *  DB transaction to migrate document from old token to new one
 */
router.post("/", (req, res) => {
  const { oldToken, newToken } = req.body;
  console.log(`migrating ${oldToken} to ${newToken}`);
  pool
    .query("begin")
    .then(res => {
      return pool.query(
        `SELECT EXISTS(SELECT 1 FROM token_document_mapping where url_token = $1)`, 
        [newToken]
      );
    })
    .then(res => {
      if(!res.rows[0].exists) {
        throw new Error("token already present");
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
      res
        .status(200)
        .send(`succesfully migrated from ${oldToken} to ${newToken}`);
    })
    .catch(err => {
      console.error("error while querying:", err);
      return pool.query("rollback");
    })
    .catch(err => {
      console.error("error while rolling back transaction:", err);
    });
});

module.exports = router;
