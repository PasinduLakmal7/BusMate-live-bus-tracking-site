const express = require('express');
const router = express.Router();
const registerDriver = require('../controllers/driverRegisterController');

// Driver registration endpoint
router.post("/register", registerDriver);

module.exports = router;
