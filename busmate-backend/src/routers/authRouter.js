const express = require('express');
const router = express.Router();
const registerUser = require('../controllers/registerController');
const loginUser = require('../controllers/loginController');

router.post("/login", loginUser);
router.post("/register", registerUser);

module.exports = router;