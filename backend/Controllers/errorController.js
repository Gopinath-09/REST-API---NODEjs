//Model packages
const CustomError = require("../Utils/CustomError");


//Global Controller have 4 parameters 1st one cares the error
const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status : error.statusCode,
        message : error.message,
        stackTrace : error.stack,
        error : error
    });
}

const prodErrors = (res, error) => {
    if(error.isOperational){
        res.status(error.statusCode).json({
            status : error.statusCode,
            message : error.message
        });
    }else{
        res.status(500).json({
            status : 'error',
            message : 'Something went wrong! Please try again later.'
        });
    }
}

const castErrorHandler = err =>{
    const msg = `Invalid value for ${err.path}: ${err.value}`;
    return new CustomError(msg, 400)
}
const duplicateKeyErrorHandler = err =>{
    const name = err.keyValue.name;
    const msg = `There is alrady a movie with name: ${name}. Please use another name`;
    return new CustomError(msg, 400);
}
const validationErrorHandler = err =>{
    const errors = Object.values(err.errors).map(val => val.message);
    const errorMessages = errors.join('., ');
    const msg = `Invalid input data: ${errorMessages}`;
    return new CustomError(msg, 400);
}

//Auth erros handlers
const handleExpiredJWT = err => {
    return new CustomError('JWT token expired, please login again', 401);
}
const handleJWTError = err => {
    return new CustomError('Invalid Token Error, please login again', 401);
}

module.exports = (error, req, res, next)=>{
    error.statusCode = error.statusCode || 500;
    error.status = error.status ||  'error';

    if(process.env.NODE_ENV === 'development'){
        devErrors(res, error);
    }else if(process.env.NODE_ENV === 'production'){
        if(error.name === 'CastError') error = castErrorHandler(error); //don't need to make a copy of error
        if(error.code === 11000) error = duplicateKeyErrorHandler(error);
        if(error.name === 'ValidationError') error = validationErrorHandler(error);
        if(error.name === 'TokenExpiredError') error = handleExpiredJWT(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError(error);

        prodErrors(res, error);
    }
};




//error.statusCode = error.statusCode || 500;
//error.status = error.status ||  'error';
//res.status(error.statusCode).json({
//    status : error.statusCode,
//    message : error.message
//});
//here consider argument error as -> CustomError, then
//error.statusCode is == CustomError.statusCode
//error.status is == CustomError.status
//error.message is == super(message)