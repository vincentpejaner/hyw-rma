const express = require("express");
const router = express.Router();

const {
  getHYW,
  insertHYW,
  // trackHYWByTicket,
  getMyRmaRequests,
  getAccount,
  insertProfile,
  selectProfile,
  submitRmaRequest
} = require("../controller/hywController.js");

router.route("/").get(getHYW).post(insertHYW);

router.post("/login", getAccount);
//router.get("/track/:ticket", trackHYWByTicket);
router.get("/mine/:email", getMyRmaRequests);
router.post("/profile", insertProfile);
router.get("/selectprofile/:id", selectProfile);
router.post("/submit-rma", submitRmaRequest);

module.exports = router;
