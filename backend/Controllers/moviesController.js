//DB Model packages
const Movie = require('./../Models/moviesModel');

//Model packages
const ApiFFPS = require('./../Utils/ApiFFPS');
const CustomError = require('./../Utils/CustomError');

//Route packages
const asyncErrorhandler = require('./../Utils/asyncErrorHandler');

//Middleware Alis Router
exports.highestRatings = async (req, res, next) =>{
    req.query.limit = '1';
    req.query.sort = '-ratings';

    next();
}
//Route handlers
exports.getMovies = asyncErrorhandler(async (req, res, next)=>{
    const ffps = new ApiFFPS(Movie.find(), req.query).filter().sort().limitFields().paginate();
    //using mongoose 6.0 or less
    //const exclude = ['sort', 'page', 'limit', 'fields'];
    //creating a shallow obj instead of pointer the reference of req.query
    //let queryObj = {...req.query};
    /* exclude.forEach((el)=>{
        delete queryObj[el];
    }) */
    console.log("All movies are sent!");

    const movies = await ffps.query;

    res.status(200).json({
        status : 'success',
        count : movies.length,
        data : {
            movies
        }
    })
});
exports.getMovie = asyncErrorhandler(async (req, res, next)=>{
    const movie = await Movie.findById(req.params.id);
    if(!movie){
        const err =  new CustomError('Movie with that ID is not found!', 404);
        return next(err);
    }
    console.log(`${movie.name} movie is sent`)
    res.status(200).json({
        status : 'success',
        data : {
            movie
        }
    })
});
exports.createMovie = asyncErrorhandler(async (req, res, next)=>{
    req.body.createdBy = req.user.name;
    const movie = await Movie.create(req.body);
    console.log(`${movie.name} movie is created by ${req.user.name}.`);
    res.status(201).json({
        status : 'success',
        data : {
            movie
        }
    })
});
exports.updateMovie = asyncErrorhandler(async (req, res, next)=>{
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body,{new: true, runValidators: true});
    if(!movie){
        const err =  new CustomError('Movie with that ID is not found!', 404);
        return next(err);
    }
    console.log(`${movie.name} movie is updated`)
    res.status(200).json({
        status : 'success',
        count : movie.length,
        data : {
            movie
        }
    })
});
exports.deleteMovie = asyncErrorhandler(async (req, res, next)=>{
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if(!movie){
        const err =  new CustomError('Movie with that ID is not found!', 404);
        return next(err);
    }
    console.log(`${movie.name} movie is deleted`)
    res.status(204).json({
        status : 'success',
        data : null
    })
});

//Aggregate methods
exports.movieStats = asyncErrorhandler(async (req, res, next)=>{
    const stats = await Movie.aggregate([
        //4 stages
        { $match : {ratings : { $gte : 4.5 }} },
        { $group : {
            _id : '$releaseYear',
            avgRatings : { $avg : '$totalRating' },
            minRatings : { $min : '$totalRating' },
            maxRatings : { $max : '$totalRating' },
            totalRatings : { $sum : '$ratings'},
            movieCount : { $sum : 1 },
            movies : {$push : '$name'}
        }},
        { $sort : { _id : -1 }},
        { $match : { movieCount : { $gte : 1 } }}
    ])
    res.status(200).json({
        status : 'success',
        count : stats.length,
        data : {
            stats
        }
    })
});
//Aggergate Methos of $unwind and $project
exports.moviesByGenres =  asyncErrorhandler(async (req, res, next)=>{
    const genre = req.params.genre;
    const movies = await Movie.aggregate([
        {$unwind : '$genres'},
        {$group : {
            _id : '$genres',
            moviesCount : {$sum : 1},
            movies : {$push : '$name'}
        }},
        {$addFields : {genre : '$_id'}},
        {$project : {_id : 0}},
        {$sort : {moviesCount : -1}},
        {$match : {genre : genre}}
    ])
    res.status(200).json({
        status : 'success',
        data : {
            movies
        }
    })
});