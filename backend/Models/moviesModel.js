const mongoose = require('mongoose');
const fs = require('fs');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
    name: {
        type : String,
        required : [true, 'Name is required field'],
        unique : true,
        minlength : [4 , "Movie name should be more than 3 characters."],
        maxlength : [100 , "Movie name should be more than 100 characters."],
        trim: true,
        //validate : [validator.isAlpha , "Name should be only in Alphabets."]
    },
    description: {
        type : String,
        required : [true, 'Description is required field'],
        trim: true
    },
    duration : {
        type : Number,
        required : [true, 'Duration is required field']
    },
    ratings : {
        type: Number,
        default : 1.0,
        //min : [1 , "ratings should be more than 1.0"], built-in validator
        //max : [10 , "ratings should be less than 10.0"] built-in validator
        validate : { // Custom validator
            validator : function(value){
                return value >= 1 && value <= 10;
            },
            message : "You entered rating as : ({VALUE}), and it should be more than 1.0 and less than 10.0"
        }
    },
    totalRating: {
        type: Number
    },
    releaseYear: {
        type: Number,
        required: [true, 'Release year is required field']
    },
    releaseDate: {
        type: Date
    },
    createdDate: {
        type: Date,
        default: Date.now(),
        select: false //false to remove this field
    },
    genres: {
        type: [String],
        required: [true, 'Genres year is required field'],
        //enum : {
        //    values : ['Action','romance','strategy','sci-fi'],
        //    message : "this genre not found!"
        //}
    },
    directors: {
        type: [String],
        required: [true, 'Directors year is required field']
    },
    coverImage: {
        type: String,
        required: [true, 'Cover image year is required field']
    },
    createdBy : String
},{
    toJSON: { virtuals : true },
    toObject: { virtuals : true }
});

//after this create virtuals in schema
movieSchema.virtual('durationInHours').get(function(){
    return  this.duration / 60;
})

//Mongoose Middleware
//only used when save or create on mongooose methods
//does not used when insertMany && findByIdAndUpdate and it will not work
/* movieSchema.pre('save',function(req,next){
    this.createdBy = req.user.name;
    next();
}) */
movieSchema.post('save',function(doc,next){
    console.log(doc);
    const content = `New movie "${doc.name}" is added by ${doc.createdBy}\n`;
    fs.writeFileSync('./logs/create-movies.txt', content, {flag : 'a'}, err => {
        console.log(err);
    })
    next();
})
//Mongoose Middleware in query
movieSchema.pre(/^find/,function(next){
    this.find({releaseDate: {$lte : Date.now()}});
    this.startTime = Date.now();
    next();
})
movieSchema.post(/^find/,function(docs, next){
    this.find({releaseDate: {$lte : Date.now()}});
    this.endTime = Date.now();
    const content = `Data sent in ${this.endTime - this.startTime} ms\n`;
    fs.writeFileSync('./logs/create-movies.txt', content, {flag : 'a'}, err => {
        console.log(err);
    })
    next();
})

//Mongoose Middleware in aggregation
movieSchema.pre('aggregate',function(next){
    this.pipeline().unshift({$match : {releaseDate : {$lte : new Date()}}});
    next();
})

const Movie = new mongoose.model('Movie', movieSchema);

module.exports = Movie;