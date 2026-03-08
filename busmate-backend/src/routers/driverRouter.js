const express = require('express');
const router = express.Router();
const registerDriver = require('../controllers/driverRegisterController');
const approveDriver = require('../controllers/approveDriverController');
const verifyDriverExists = require('../controllers/verifyDriverExistsController');
const driverLogin = require('../controllers/driverLoginController');
const requestOtp = require('../controllers/requestOtpController');
const verifyOtp = require('../controllers/verifyOtpController');
const getTestOtp = require('../controllers/getTestOtpController');
const getPendingDrivers = require('../controllers/getPendingDriversController');
const getPendingDriverById = require('../controllers/getPendingDriverByIdController');
const getAllDrivers = require('../controllers/getAllDriversController');
const getDriverById = require('../controllers/getDriverByIdController');

// Driver registration
router.post('/register', registerDriver);

// Admin approval
router.post('/approve/:id', approveDriver);

// Get all pending registrations
router.get('/pending', getPendingDrivers);

// Get a single pending registration by ID
router.get('/pending/:id', getPendingDriverById);

// Get all approved drivers
router.get('/all', getAllDrivers);

// Get a single approved driver by ID
router.get('/:id', getDriverById);

// ── Login via backend OTP (no Firebase) ─────────────────────────────────────
// Step 1: request OTP → stored in Redis, logged to console in dev
router.post('/request-otp', requestOtp);
// Step 2: verify OTP + receive JWT
router.post('/verify-otp', verifyOtp);

// Check driver existence by name & phone
router.post('/check', verifyDriverExists);

// Dev helper: read the OTP from Redis without SMS
router.get('/test-otp/:phone', getTestOtp);

module.exports = router;
