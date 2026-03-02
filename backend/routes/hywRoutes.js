const express = require('express');
const router = express.Router();
const { getHYW, insertHYW, getAccount } = require('../controller/hywController.js');


router.route('/')
    .get(getHYW)
    .post(insertHYW);

router.route('/login').post(getAccount);

module.exports = router;