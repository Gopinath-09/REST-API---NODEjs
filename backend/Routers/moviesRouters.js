const express = require('express');
const moviesController = require('./../Controllers/moviesController')
const authController = require('./../Controllers/authController');

//creating a route and its handlers + Mounting Routes in ExpressJS
const router = express.Router();

//middleware
//router.param('id', moviesController.checkId);
//Aggregate Routes
router.route('/movie-stats').get(moviesController.movieStats); //this won't work afer ObjectId /:id
router.route('/movies-by-genre/:genre').get(moviesController.moviesByGenres); //this won't work afer ObjectId /:id
router.route('/highest-ratings').get(moviesController.highestRatings, moviesController.getMovies); //this won't work afer ObjectId /:id
router.route('/').get(authController.protect,moviesController.getMovies).post(moviesController.createMovie);
router.route('/:id').get(moviesController.getMovie).patch(moviesController.updateMovie).delete(authController.protect,authController.restrict('admin','operator'),moviesController.deleteMovie);


module.exports = router;