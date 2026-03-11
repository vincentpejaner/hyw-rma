const express = require("express");
const router = express.Router();

const {
  getHYW,
  insertHYW,
  getMyRmaRequests,
  getRmaByTicket,
  getAccount,
  insertProfile,
  selectProfile,
  submitRmaRequest,
} = require("../controller/hywController.js");

router.route("/").get(getHYW).post(insertHYW);

router.post("/login", getAccount);
//router.get("/mine/:id", getMyRmaRequests);
router.get("/track/:ticketId", getRmaByTicket);
router.post("/profile", insertProfile);
router.get("/selectprofile/:id", selectProfile);
router.post("/submit-rma", submitRmaRequest);

module.exports = router;
