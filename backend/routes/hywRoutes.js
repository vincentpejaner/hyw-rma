const express = require("express");
const router = express.Router();

const { getHYW, insertHYW, trackHYWByTicket, getMyRmaRequests, getAccount } = require("../controller/hywController.js");

router.route("/")
  .get(getHYW)
  .post(insertHYW);

router.post("/login", getAccount);
router.get("/track/:ticket", trackHYWByTicket);
router.get("/mine/:email", getMyRmaRequests);

module.exports = router;
