const express = require('express');
const router = express.Router();
const registerUser = require('../controllers/registerController');
const loginUser = require('../controllers/loginController');
const logoutUser = require('../controllers/logoutController');

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);

module.exports = router;