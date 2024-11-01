const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/userRoutes')

// middleware
app.use(express.static('public'));
app.use(express.json())
app.use(cookieParser())

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

require('dotenv').config();
// database connection
mongoose.connect(process.env.DBURI)
    .then((result) => {
        app.listen(process.env.PORT)
        console.log('')
        console.log('*************************** ********************* ***************************')
        console.log('*                                                                           *')
        console.log('*                           ' + process.env.APP_NAME + ' BACKEND STARTED                        *')
        console.log('*                                                                           *')
        console.log('*************************** ********************* ***************************')
        console.log('')
    })
    .catch((err) => {
        console.log(err)
    })

app.get('/', (req, res) => {
    res.send('Restricted access')
})

app.use('/users', userRoutes)

