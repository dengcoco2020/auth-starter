const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { isEmail } = require('validator')

const userSchema = mongoose.Schema({
    usertype: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: [true, 'Enter a first name']
    },
    lastname: {
        type: String,
        required: [true, 'Enter a last name']
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
        minlength: [11, 'Mobile number must be at least 11 characters']
    },
    password: {
        type: String,
        required: [true, 'Enter a password'],
        minlength: [6, 'Passwords must be at least 6 characters'],
        select: true
    },
    otp: {
        type: String,
    },
    ustat: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

// login method
userSchema.statics.login = async function(mobileno, password) {
    const user = await this.findOne({ mobileno })
    // console.log(user.password, ' => ', password)
    let invalid_login = {};
    if(user) {
        const auth = await bcrypt.compare(password, user.password)
        if(auth) {
            let user_valid = {
                _id: user.id,
                usertype: user.usertype,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                mobileno: user.mobileno,
                otp: user.otp,
                ustat: user.ustat,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                __v: user.__v
            }
            return user_valid
        }
        invalid_login = {
            result: 0,
            message: 'Incorrent password'
        }
        return invalid_login
    } 
    else {
        console.log('invalid mobileno')
        invalid_login = {
            result: 0,
            message: 'Incorrent mobileno'
        }
        return invalid_login
    }
}

// OTP generator
const getOTP = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

userSchema.pre('save', async function(next) {
    // create password hash
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)

    // set OTP value
    this.otp = getOTP()
    next()
})

const User = mongoose.model('user', userSchema)
module.exports = User
