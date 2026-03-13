const express = require("express");
const router = express.Router();

const {
  getHYW,
  getHealthStatus,
  insertHYW,
  getMyRmaRequests,
  getRmaByTicket,
  getAccount,
  insertProfile,
  selectProfile,
  submitRmaRequest,
  updateProfile
} = require("../controller/hywController.js");

router.get("/health", getHealthStatus);
//router.route("/").get(getHYW).post(insertHYW);

router.post("/login", getAccount);
router.get("/mine/:accountId", getMyRmaRequests);
router.get("/track/:ticketId", getRmaByTicket);
router.post("/insert-profile", insertProfile);
router.get("/selectprofile/:id", selectProfile);
router.post("/submit-rma", submitRmaRequest);
router.put("/update-profile/:id", updateProfile);

module.exports = router;
