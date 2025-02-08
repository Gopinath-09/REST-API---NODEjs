const express = require('express');
const moviesController = require('./../Controllers/moviesController')

//creating a route and its handlers + Mounting Routes in ExpressJS
const router = express.Router();

//middleware
//router.param('id', moviesController.checkId);
//Aggregate Routes
router.route('/movie-stats').get(moviesController.movieStats); //this won't work afer ObjectId /:id
router.route('/movies-by-genre/:genre').get(moviesController.moviesByGenres); //this won't work afer ObjectId /:id
router.route('/highest-ratings').get(moviesController.highestRatings, moviesController.getMovies); //this won't work afer ObjectId /:id
router.route('/').get(moviesController.getMovies).post(moviesController.createMovie);
router.route('/:id').get(moviesController.getMovie).patch(moviesController.updateMovie).delete(moviesController.deleteMovie);


module.exports = router;