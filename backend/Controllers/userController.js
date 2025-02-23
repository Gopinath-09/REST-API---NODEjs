const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');
const util = require('util');
const sendEmail = require('./../Utils/emailer');
const crypto = require('crypto');


const filterReqObj = (obj, ...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(prop=>{
        if(allowedFields.includes(prop)){
            newObj[prop] = obj[prop];
        }
    })
    return newObj;
}


exports.getAllUsers= asyncErrorHandler(async(req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        result: users.length,
        data: {
            users
        }
    })
})


exports.updateMe = asyncErrorHandler(async (req, res, next)=>{
    //1 check if request data conatin pass or confrim pass
    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError('You cannot update your password using this endpoint', 400));
    }

    //2 update user details
    const filterObj = filterReqObj(req.body, 'name', 'email');
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterObj, {runValidators: true});

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    })
})

exports.deleteMe = asyncErrorHandler(async(req, res, next)=>{
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
})