const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { isEmail } = require('validator')

const userSchema = mongoose.Schema({
    usertype: {
        type: String,
        default: 'customer'
    },
    fullaname: {
        type: String,
    },
    email: {
        type: String,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    mobileno: {
        type: String,
        unique: [true, 'Mobile number is already registered'],
        required: [true, 'Provide a mobile number'],
        minlength: [10, 'Mobile number must be at least 11 characters']
    },
    otp: {
        type: String,
    },
    fcmToken: {
        type: String
    },
    status: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const getOTP = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

userSchema.pre('save', async function(next) {
    this.otp = getOTP()
    next()
})

const User = mongoose.model('user', userSchema)
module.exports = User
