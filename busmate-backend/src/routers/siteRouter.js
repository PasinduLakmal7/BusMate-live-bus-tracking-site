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
router.get('/buses/:id', siteController.getBusById);
router.get('/stops/:id', siteController.getStopById);

// Stats management
router.get('/stats', siteController.getStats);

module.exports = router;
