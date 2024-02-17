const mongoose = require('mongoose');
const Schema = mongoose.Schema
const otpSchema = new Schema({
    otp: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false 
    }

    },{
        timestamps: true 
    });

module.exports = mongoose.model('Otp', otpSchema);

