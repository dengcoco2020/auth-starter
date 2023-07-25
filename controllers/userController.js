const User = require('../models/User')
const jwt = require('jsonwebtoken')

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

const user_create = async (req, res) => {
    const { firstname, lastname, usertype, mobileno, password, email, otp } = req.body
    try {
        const user = await User.create({ firstname, lastname, usertype, mobileno, password, email, otp })
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user: user._id })
    } catch(err) {
        const errors = handleErrors(err)
        res.status(400).json({errors})
    }
}

const user_get_all = (req, res) => {
    User.find().sort({ createdAt: -1 })
        .then((users) => {
            res.status(201).json({ users })
        })
        .catch((err) => {
            console.log(err)
            res.status(201).json(result)
        }) 
}

const user_get_one = (req, res) => {
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

const user_update = (req, res) => {
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

const user_delete = (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.status(201).json(result)
        })
        .catch((err) => {
            res.status(400).json(err)
        })
}

const user_validate = async (req, res) => {
    try {
        const user = await User.login(req.body.mobileno, req.body.password)
        if(user.ustat !== 0) {
            if(user._id) {
                const token = createToken(user._id)
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
                res.status(200).json({ user })
            }
            else {
                res.status(400).json({ user })
            }
        }
        else {
            res.status(401).json({
                result: 0,
                message: 'Unverified mobileno'
            })
        }
    }
    catch(err) {
        console.log(err)
        res.status(400).json({ err })
    }
}

const otp_verify = async (req, res) => {
    const valid = await User.findOne({ mobileno: req.body.mobileno, otp: req.body.otp })
    let obj = {}

    if(valid) {
        // check if OTP hasn't timed out
        let newDate = new Date(valid.createdAt).valueOf()
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
            // OTP has ot timed out, proceed to verifying user's mobile number
            User.findByIdAndUpdate(valid._id, { ustat: 1 })
                .then((result) => {
                    obj = {
                        result: 1,
                        message: 'OTP validated'
                    }
                    res.status(201).json(obj)
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

const otp_generate = async (req, res) => {
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

module.exports = {
    user_create, user_get_all, user_get_one, user_update, user_delete,
    user_validate, otp_verify, otp_generate
}