const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

//Load env vars
dotenv.config({path:'./config/config.env'});

//connect to database
connectDB();

//Route files
const shops = require('./routes/shops');
const auth = require('./routes/auth');
const reservations = require('./routes/reservations');

const app=express();

app.set('query parser', 'extended');

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Mount routers
app.use('/api/v1/shops', shops);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);

const PORT=process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server and exit process
    server.close(()=>process.exit(1));
});