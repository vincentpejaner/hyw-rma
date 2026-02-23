const express = require('express');
const router = express.Router();
const { getHYW, insertHYW } = require('../controller/hywController.js');


router.route('/')
    .get(getHYW)
    .post(insertHYW);

module.exports = router;