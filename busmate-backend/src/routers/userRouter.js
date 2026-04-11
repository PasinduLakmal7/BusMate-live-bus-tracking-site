const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.getProfile);
router.patch('/preferences', userController.updatePreferences);

module.exports = router;
