const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

router.get('/', alertsController.getAllAlerts);
router.patch('/:id/read', alertsController.markAsRead);
router.post('/mark-all-read', alertsController.markAllRead);

module.exports = router;
