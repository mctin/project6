//mongodb+srv://mctin:<password>@cluster0.9odlabl.mongodb.net/?retryWrites=true&w=majority//
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')
//const bobyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const app = express();


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json());
app.use(helmet());

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`,
{ useNewUrlParser: true,
    useUnifiedTopology: true })
.then(() => console.log('sucessfully connected to mongodb atlas'))
.catch ((error) =>
    console.log('unable to connect to mongo'))


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
    // res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  });

//app.use(bobyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces',sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;