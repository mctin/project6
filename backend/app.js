//mongodb+srv://mctin:<password>@cluster0.9odlabl.mongodb.net/?retryWrites=true&w=majority//
const express = require('express');
//const bobyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');dotenv.config();
const path = require('path');
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const app = express();

app.use(express.json());

mongoose.connect('mongodb+srv://mctin:Rose2222@cluster0.9odlabl.mongodb.net/?retryWrites=true&w=majority',
{ useNewUrlParser: true,
    useUnifiedTopology: true })
.then(() => console.log('sucessfully connected to mongodb atlas'))
.catch ((error) =>
    console.log('unable to connect to mongo'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//app.use(bobyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces',sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;