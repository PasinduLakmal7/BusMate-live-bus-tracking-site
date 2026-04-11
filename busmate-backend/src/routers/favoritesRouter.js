const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');

router.get('/', favoritesController.getFavorites);
router.post('/add', favoritesController.addFavorite);
router.post('/remove', favoritesController.removeFavorite);

module.exports = router;
