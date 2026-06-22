const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({

    emailId: {

        type: String,
        required: true
    },

    otp: {

        type: String,
        required: true
    },

    expiresAt: {

        type: Date,
        required: true
    }
});

const OTP = mongoose.model('otp', otpSchema);

module.exports = OTP;