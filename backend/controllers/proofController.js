const nodemailer = require('nodemailer');
const RentRequestModel = require('../models/RentRequest.model.js')
const OtpModal = require('../models/Otp.modal.js')
const fs = require("fs")
const { uploadToCloudinary } = require("../utils/cloudinary.js")


// generate OTP
exports.generateOtp = async (req, res) => {
  try {
    const { receiverEmail, requestId, actionType } = req.body;

    if (!receiverEmail || !requestId || !actionType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to DB
    await OtpModal.create({ receiverEmail, requestId, actionType, otp, expiresAt });

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: receiverEmail,
      subject: `${actionType === 'delivery' ? 'Delivery' : 'Return'} OTP`,
      text: `Your OTP for ${actionType} confirmation is ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: { receiverEmail, requestId, actionType },
    });
  } catch (error) {
    console.error("❌ OTP send failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};


// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { otp, requestId, actionType } = req.body;

    if (!otp || !requestId || !actionType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Get latest OTP record
    const record = await OtpModal.findOne({ requestId, actionType }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(404).json({ success: false, message: "No OTP record found" });
    }

    // 2️⃣ Validate OTP
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await OtpModal.deleteOne({ _id: record._id }); // cleanup expired
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    //  Photo must exist
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo is required for verification.' });
    }

    // 3️⃣ Upload photo to Cloudinary
    const result = await uploadToCloudinary(req.file.path, "photo");
    const photoUrl = result.secure_url;
    fs.unlinkSync(req.file.path); // remove local temp file

    let newStatus;
    if (actionType === 'delivery') newStatus = 'delivered';
    else if (actionType === 'return') newStatus = 'returned';

    await RentRequestModel.findByIdAndUpdate(requestId, { status: newStatus, photo: photoUrl });

    //  Optionally delete OTP
    await OtpModal.deleteOne({ _id: record._id });

    res.status(200).json({
      success: true,
      message: `${actionType} verified successfully`,
      data: { status: newStatus, photo: result.secure_url },
    });

  } catch (err) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

