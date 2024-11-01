const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    addressLabel: {
        type: String,
    },
    address: {
        type: String,
    },
    status: {
        type: Number,
        default: 0,
    },
    coords: {
        type: {
            type: String,
            enum: ['Point'],
            require: true
        },
        coordinates: {
            type: mongoose.SchemaTypes.Mixed,
            require: true
        }
    }
}, { timestamps: true })

const Address = mongoose.model('address', addressSchema)
module.exports = Address
