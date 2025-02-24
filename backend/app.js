//Node Packages
const express = require('express');
const rateLimit = require('express-rate-limit');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

//Route packages
const moviesRouter = require('./Routers/moviesRouters');
const authRoutes = require('./Routers/authRoutes');
const userRoute = require('./Routers/userRoute');
const CustomError = require('./Utils/CustomError');
const globalErrorHandler = require('./Controllers/errorController');

//storing all express objects inside app
const app = express();

//security in headers cors , cdn etc..
app.use(helmet());

//Rate limiter middleware
//Prevent DOS and Brute Force Attack
let limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: "we have received too many requests from this IP. Please try after one hour."
})
app.use('/api', limiter);

//Cross-Origin Resource Sharing
app.use(cors({
    origin: '*'
}))

//navigations guider
app.get('/',(req, res)=>{
    res.status(200).json({
        status: 'success',
        use: '/api/v1/',
        data: {
            moviesRoutes: {
                getAllMoviesData: 'movies | GET',
                createMovie: 'movies | POST',
                getAMovieData: 'movies/:id | GET',
                updateMovie: 'movies/:id | PATCH',
                deleteMovie: 'movies/:id | DELETE'
            },
            userRoutes: {
                getAllUsersData: 'user/getallusers | GET',
                deleteUser: 'user/deleteMe | DELETE'
            },
            authRoutes: {
                loginUser: 'auth/signup | POST',
                createUser: 'auth/login | POST'
            }
        }
    })
})

//middleware to enable json formats etc..
//also we limit file size getting within 10kb
app.use(express.json({limit: '10kb'}));

app.use(sanitize());

app.use(xss());

app.use(hpp({whitelist: [
    'duration',
    'ratings',
    'releaseYear',
    'releaseDate',
    'genres',
    'directors'
]}));

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//used to host html as ssr
app.use(express.static('./public'))

//Routers
app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoute);
//Default Routes and it must be define Last
app.all('*',(req, res, next)=>{
    //res.status(404).json({
    //    status : 'fail',
    //    message : `ERROR: no page found in --> ${req.originalUrl}`
    //})
    //below can also written normally as const err = new Error('message here')
    const err = new CustomError(`ERROR: no page found in --> ${req.originalUrl}`, 404)
    next(err); //mentioning a data as an argument this will only find Global middleware 
});

//Global Middleware - Error Handling
app.use(globalErrorHandler);

module.exports = app;