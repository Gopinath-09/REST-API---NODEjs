const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');
const util = require('util');

const signinToken = id =>{ 
    return jwt.sign({id},process.env.SECRET_STR,{
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

exports.signup = asyncErrorHandler(async (req, res ,next) => {
    const newUser = await User.create(req.body);

    const token = signinToken(newUser._id);

    res.status(201).json({
        status : 'success',
        token,
        data: {
            user: newUser
        }
    })
});

exports.login = asyncErrorHandler(async (req, res, next) => {
    const {email , password} = req.body;

    //checking email and password are not received
    if(!email || !password){
        const error = new CustomError('Email and Password is required for login', 400);
        return next(error);
    }

    //checking if user is exists
    const user = await User.findOne({email}).select('+password'); //using select() bcoz we used select: false in User model

    //checking if user then password exists or same!
    if(!user || !(await user.comparePassinDB(password, user.password))){
        const error = new CustomError('Incorrect Email or Password', 400);
        return next(error);
    }

    const token = signinToken(user._id);

    //if(!user || )
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.protect = asyncErrorHandler(async (req, res, next) => {
    //1. Checking if token is still exist
    const testToken = req.headers.authorization;
    let token;

    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1]
    }
    if(!token) next(new CustomError('You are not looged in', 401))
    

    //2. Validate the token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR)
    //console.log(decodedToken); return id(payload) iat exp 


    //3. checking if the user exist
    const user = await User.findById(decodedToken.id);
    if(!user) next(new CustomError('The user with the given token does not exist', 401));


    //checking if the user changed the password after the token issued
    const isPassChanged = await user.isPasswordChanged(decodedToken.iat)
    if(isPassChanged) next(new CustomError('The Password changed recently please login again.', 401))

    //Allow user to access route
    req.user = user;
    next();
})


//single role
/* exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role) next(new CustomError('You do not have permission to perform this action', 403));
        next();
    }
} */
//Mutliple roles
exports.restrict = (...role) => {
    return (req, res, next) => {
        if(!role.includes(req.user.role)) next(new CustomError('You do not have permission to perform this action', 403));
        next();
    }
}