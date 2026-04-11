const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const searchController = require('../controllers/searchController');

// Route management
router.get('/routes', siteController.getAllRoutes);
router.get('/routes/:id', siteController.getRouteById);
router.get('/suggest', searchController.suggestRoutes);

// Schedule management
router.get('/schedules', siteController.getAllSchedules);
router.get('/routes/:id/timetable', siteController.getRouteTimetable);
router.get('/buses/:id', siteController.getBusById);
router.get('/stops', siteController.getAllStops);
router.get('/stops/:id', siteController.getStopById);

// Stats management
router.get('/stats', siteController.getStats);
router.get('/predictions', siteController.getSmartPredictions);

// Crowd management
router.get('/crowd-status', siteController.getCrowdStatus);
router.post('/report-crowd', siteController.reportCrowd);

// Alert management
router.get('/alerts/latest', siteController.getLatestAlerts);
router.get('/alerts/bus/:id', siteController.getBusAlerts);
router.get('/alerts/stop/:id', siteController.getStopAlerts);

// Support ticket management
router.post('/submit-ticket', siteController.submitSupportTicket);

module.exports = router;
