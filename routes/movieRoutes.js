const express = require('express');
const { getMovies, addMovie, getSeatMap, searchMovies } = require('../controllers/movieController');
const router = express.Router();

router.get('/', getMovies);
router.post('/add', addMovie);
router.get('/seatMap', getSeatMap);
router.get('/search', searchMovies)
module.exports = router;
