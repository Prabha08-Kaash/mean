const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  receiverEmail: String,
  requestId: String,
  actionType: String,
  otp: String,
  expiresAt: Date,
  photo:String
}, { timestamps: true });



const OTP = mongoose.model("OTP", otpSchema)
module.exports = OTP