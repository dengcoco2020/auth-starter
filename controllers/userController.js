const User = require('../models/User')
const jwt = require('jsonwebtoken')
const asyncErrorHandler = require('../utils/AsyncErrorHandler')
const CustomError = require('../utils/CustomError')
const Address = require('../models/Address')

// error handling
const handleErrors = (err) => {
    console.log(err.message, err.code)
    let errors = { firstname: '', lastname: '', usertype: '', mobileno: '', password: '', email: '', email_inc: '', pass_err: '' }
    if(err.code === 11000 ) {
        errors.mobileno = 'Mobile number is already registered'
        return errors
    }
    if(err.message.includes('user validation failed' || 'Incorrect password')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }
    return errors
}

const maxAge = 3 * 24 * 60 * 60
const createToken = (id) => {
    let secret = process.env.JWT_SECRET
    return jwt.sign({ id }, secret, {
        expiresIn: maxAge
    })
}


const validateMobileNumber = asyncErrorHandler(async(req, res, next) => {
    console.log(req.params.mobileno);
    const validateMobile = await User.findOne({ mobileno: req.params.mobileno })
    if(validateMobile) {
        const new_otp = Math.floor(100000 + Math.random() * 900000)
        const generateOTP = await User.findByIdAndUpdate(validateMobile._id, { otp: new_otp }, { new: true })
        // send OTP via SMS here
        res.status(201).json(generateOTP)
    }
    else {
        const createUser = await User.create({
            mobileno: req.params.mobileno,
        })
        if(createUser) {
            // send OTP via SMS here
            res.status(201).json(createUser)
        }
    }
})

const getAllUsers = (req, res) => {
    User.find().sort({ createdAt: -1 })
        .then((users) => {
            res.status(201).json({ users })
        })
        .catch((err) => {
            console.log(err)
            res.status(201).json(result)
        }) 
}

const getUser = (req, res) => {
    const id = req.params.id
    User.findById(id)
        .then((user) => {
            res.status(201).json({ user })
        })
        .catch((err) => {
            console.log(err)
            res.status(201).json(result)
        }) 
}

const updateUser = (req, res) => {
    console.log(req.body.id)
    User.findByIdAndUpdate(req.body.id, req.body)
        .then((updated_user) => {
            res.status(201).json(req.body)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).json(err)
        })
}

const verifyOTP = async (req, res) => {
    const valid = await User.findOne({ mobileno: req.body.mobileno, otp: req.body.otp })
    let obj = {}

    if(valid) {
        // check if OTP hasn't timed out
        let newDate = new Date(valid.updatedAt).valueOf()
        let now = new Date().valueOf()
        let diff = now - newDate
        if(diff > process.env.OTP_TIMEOUT) {
            // OTP has timed out
            console.log('5 minutes has passed. Please generate a new OTP', diff)
            obj = {
                result: 0,
                message: 'OTP has expired. Please generate a new one'
            }
            res.status(401).json(obj)
        }
        else {
            // OTP has not timed out, proceed to verifying user's mobile number
            User.findByIdAndUpdate(valid._id, { status: 1 })
                .then(async(result) => {
                    const userInfo = await User.aggregate([
                        {
                            $match: {
                                _id: result._id
                            }
                        },
                        {
                            $lookup: {
                                from: 'addresses',
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'addresses'
                            }
                        },
                        {
                            $lookup: {
                                from: 'avatars',
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'userAvatar'
                            }
                        },
                        {
                            $unwind: {
                                path: '$userAvatar',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ])
                    const token = createToken(result._id)
                    res.status(201).json({
                        token,
                        userInfo
                    })
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }
    else {
        res.status(401).json({
            result: 0,
            message: 'Invalid OTP'
        })
    }
}

const regenerateOTP = async (req, res) => {
    const new_otp = Math.floor(100000 + Math.random() * 900000)
    const user = await User.findOne({ mobileno: req.body.mobileno })
    User.findByIdAndUpdate(user._id, { otp: new_otp })
        .then((result) => {
            res.status(201).json({
                result: 1,
                message: 'New OTP generated',
                mobileno: req.body.mobileno,
                otp: new_otp
            })
        })
        .catch((err) => {
            res.status(400).json({
                result: 0,
                message: 'New OTP generation failed',
                mobileno: req.body.mobileno
            })
        })
}

const updateFCMToken = asyncErrorHandler(async(req, res, next) => {
    const fcm = await User.findOne({
        _id: req.body._id,
        fcmToken: req.body.fcmToken
    })
    if(!fcm) {
        const updateToken = await User.findByIdAndUpdate( req.body._id, { fcmToken: req.body.fcmToken }, { new: true })
        if(updateToken) {
            res.status(201).json({
                    status: 201,
                    message: 'FCM token updated',
                    updateToken
                })
        }
        else {
            const err = new CustomError('Error updating FCM token')
            next(err)
        }
    }
    else {
        res.status(201).json({
            status: 201,
            message: 'FCM token is the same. Ignoring'
        })
    }
})

module.exports = {
    validateMobileNumber, getAllUsers, getUser, updateUser, verifyOTP, regenerateOTP, updateFCMToken
}