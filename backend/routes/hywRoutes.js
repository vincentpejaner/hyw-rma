const express = require('express');
const router = express.Router();


const {
 insertFormHYW
} = require("../controller/insertForm.js");


router.route("/").post(insertFormHYW);

module.exports = router;