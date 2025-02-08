const env = require('dotenv');
env.config({path : './config.env'});

const mongoose = require('mongoose');
const fs = require('fs');
const Model = require('./../Models/moviesModel')

//DB Connection
mongoose.connect(process.env.CONN_STR).then(conn=> console.log("DB Connected")).catch(err=> console.log(err));

//Read movies data
const movies = JSON.parse(fs.readFileSync('./data/moviesData.json', 'utf-8'));

const importData = async () =>{
    try {
        await Model.create(movies);
        console.log("Movies imported in DB");
    } catch (err) {
        console.log(err);
    }
    process.exit();
}
const deleteData = async () =>{
    try {
        await Model.deleteMany();
        console.log("Movies Deleted in DB");
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === "--import"){
    importData();
}
if(process.argv[2] === "--delete"){
    deleteData();
}