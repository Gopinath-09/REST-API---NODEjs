//Node Packages
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

//Route packages
const moviesRouter = require('./Routers/moviesRouters');
const authRoutes = require('./Routers/authRoutes');
const CustomError = require('./Utils/CustomError');
const globalErrorHandler = require('./Controllers/errorController');

//storing all express objects inside app
const app = express();

//Cross-Origin Resource Sharing
app.use(cors({
    origin: 'http://localhost:5173'
}))

app.get('/',(req, res)=>{
    res.status(200).json({
        status: 'success',
        data: {
            movies: []
        }
    })
})

//middleware to enable json formats etc..
app.use(express.json());
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
app.use(express.static('./public'))

//Routers
app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/users', authRoutes);
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