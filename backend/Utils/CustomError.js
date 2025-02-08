class CustomError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode =  statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}
//here constructor(message,statusCode) is the CustomError(message,statusCode)
// const err = new CustomError(message->"some code", statusCode->404)
//Above will send to errorController
module.exports = CustomError;