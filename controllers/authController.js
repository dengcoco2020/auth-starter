const CustomError = require("../utils/CustomError");
const util = require('util')
const asyncErrorHandler = require('../utils/AsyncErrorHandler')
const jwt = require('jsonwebtoken');
const User = require("../models/User");

const protect = asyncErrorHandler(async(req, res, next) => {

    const testToken = req.get('authorization')
    let token;

    if(testToken && testToken.startsWith('bearer')) {
        token = testToken.split(' ')[1]
    }
    if(!token) {
        const err = new CustomError('User is not logged in', 401)
        next(err)
    }

    const decodedToken = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET)

    const user = await User.findById(decodedToken.id)
    if(!user) { 
        const err = new CustomError('the user of the submitted token does not exist', 401)
        next(err)
    }

    // allow user to access route
    next()

})

module.exports = { 
    protect
}