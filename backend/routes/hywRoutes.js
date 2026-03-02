const express = require("express");
const router = express.Router();

const { getHYW, insertHYW, trackHYWByTicket, getAccount } = require("../controller/hywController.js");

router.route("/")
  .get(getHYW)
  .post(insertHYW);

router.post("/login", getAccount);
router.get("/track/:ticket", trackHYWByTicket);

module.exports = router;