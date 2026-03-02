const express = require("express");
const router = express.Router();

const { getHYW, insertHYW, trackHYWByTicket } = require("../controller/hywController.js");

router.route("/")
  .get(getHYW)
  .post(insertHYW);


router.get("/track/:ticket", trackHYWByTicket);

module.exports = router;