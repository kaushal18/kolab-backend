const express = require("express");
const pool = require("../db/config");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { token } = req.body;
    const isPasswordProtected = await pool.query(
      `SELECT password FROM pastebin where token = $1`,
      [token]
    );
    if (isPasswordProtected.rows[0].exists)
      res.status(200).send("password found");
    else res.status(404).send("password not found");
  } catch (e) {
    console.log(`error in db operation in password ${e}`);
  }
});

module.exports = router;
