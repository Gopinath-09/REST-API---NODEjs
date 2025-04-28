const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');
const util = require('util');
const sendEmail = require('./../Utils/emailer');
const crypto = require('crypto');

const signinToken = id =>{ 
    return jwt.sign({id},process.env.SECRET_STR,{
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

const createSendResponseWithToken = (user, statusCode, res) => {
    //creating a token
    const token = signinToken(user._id);

    //using cookie for sending jwt secure+++
    const options = {
        maxAge: process.env.LOGIN_EXPIRES,
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }
    res.cookie('jwt',token,options) 

    user.password = undefined;
    res.status(statusCode).json({
        status : 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = asyncErrorHandler(async (req, res ,next) => {
    const newUser = await User.create(req.body);

    createSendResponseWithToken(newUser, 201, res);
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

    createSendResponseWithToken(user, 200, res);
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


exports.updatePassword = asyncErrorHandler(async (req, res, next)=>{
    //1 Get current user from previous middleware
    const user = await User.findById(req.user._id).select('+password');

    //2 check if the received pass is correct
    if(!(await user.comparePassinDB(req.body.currentPassword, user.password))){
        return next(new CustomError('The current password you provided is wrong', 401));
    }

    //3 if received is correct then update the password with the given new password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    //4 login the user
    createSendResponseWithToken(user, 200, res);
})


exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    //1 get user posted email
    const user = await User.findOne({email: req.body.email});

    if(!user) next(new CustomError('We could not find any user with the given email',404));

    //2 Generate a random reset token
    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave: false}); //removes validation for only setting resettoken and expires token

    //3 Send the token to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
    const message = `Hey, I have received a password reset request. Please use the below link to reset link to reset your password\n\n${resetURL}\n\nThis reset password link will be valid only for 10 minutes.`
    
    try {
        await sendEmail({
            email: user.email,
            subject: `Password change request received`,
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'password reset link sent to the user email.'
        });
    } catch (error) {
        user.passwordResetToken = undefined,
        user.passwordResetTokenExpires = undefined,
        user.save({validateBeforeSave: false});

        return next(new CustomError('There was an error sending password reset email. Please try again later.',500));
    }
});

exports.resetPassword = asyncErrorHandler(async(req, res, next) => {
    //1 Validating Token
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpires: {$gt: Date.now()}});
    console.log("reset password: " + user);
    
    if(!user) next(new CustomError('Token is invalid or has expired',400));

    //2 Resetting the User password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();
    console.log("reset password pre-save: " + user);

    await user.save();

    //3 Login the User
    createSendResponseWithToken(user, 200, res);
})