const env = require('dotenv');
env.config({path : './config.env'});
const mongoose = require('mongoose');

process.on('uncaughtException',(err)=>{
    console.log(err.name , err.message);
    console.log('Uncaught Exception occured! Shutting Down...');
    process.exit(1);
})

const app = require('./app');

//DB connection
mongoose.connect(process.env.CONN_STR).then((conn)=>{
    console.log('Connection Sucessfull');
})

//creating a server
const port = process.env.PORT || 8000;
const server = app.listen(port, ()=>{
    console.log(`Server Listening on port ${port}... Under ${process.env.NODE_ENV} mode`);
    console.log(`http://127.0.0.1:${port}/`);
})

process.on('unhandledRejection',(err)=>{
    console.log(err.name , err.message);
    console.log('Unhandled rejection occured! Shutting Down...');

    server.close(()=>{
        process.exit(1);
    });
})
