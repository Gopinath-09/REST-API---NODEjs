const User = require('./../Models/authModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');

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