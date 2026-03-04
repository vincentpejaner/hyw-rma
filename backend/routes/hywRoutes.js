const express = require("express");
const router = express.Router();

const {
  getHYW,
  insertHYW,
 // trackHYWByTicket,
  getMyRmaRequests,
  getAccount,
  insertProfile,
} = require("../controller/hywController.js");

router.route("/").get(getHYW).post(insertHYW);

router.post("/login", getAccount);
//router.get("/track/:ticket", trackHYWByTicket);
router.get("/mine/:email", getMyRmaRequests);
router.post("/profile", insertProfile);

module.exports = router;
