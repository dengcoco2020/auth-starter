const mongoose = require('mongoose')

const avatarSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    avatarData: {
        type: Buffer,
    }
}, { timestamps: true })

const Avatar = mongoose.model('avatar', avatarSchema)
module.exports = Avatar
