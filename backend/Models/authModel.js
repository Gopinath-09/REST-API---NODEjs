const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email : {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minlength: 8
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confrim yout password'],
        validate: {
            //this will only work for sace() and create()
            validator: function(val){
                return val === this.password
            },
            message: 'Password and Conform Password does not match'
        }
    }
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    //encrypt the password before save document
    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
})

userSchema.methods.comparePassinDB = async function(pass, passDB){
    return await bcrypt.compare(pass, passDB);
}

const User = mongoose.model('User', userSchema);

module.exports = User;