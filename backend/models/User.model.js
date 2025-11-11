const mongoose = require("mongoose")
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
        },
        state: {
            type: String, // cloudinary

        },
        city: {
            type: String, // cloudinary

        },
        pincode: {
            type: String, // cloudinary

        },
        location: {
            type: String,

        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        photo: {
            type: String, // cloudinary
        },
        bio: {
            type: String, // cloudinary

        },
        profileCompleted: {
            type: Boolean,
            default: false,
        },

    },
    { timestamps: true }
);
const User = mongoose.model("User", UserSchema)
module.exports = User