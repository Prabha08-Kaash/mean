const mongoose = require("mongoose");
const ItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,

        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        price: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            enum: ['hour', 'day'],
            required: true,
        },
        photo: {
            type: String, // cloudinary
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        itemCondition: {
            type: String, // cloudinary

        },
        additionalDetails: {
            type: String, // cloudinary

        },

        // ✅ New fields for 1-month active duration
        createdAt: {
            type: Date,
            default: Date.now,
        },
        expireAt: {
            type: Date,
            default: function () {
                // 30 days from creation
                return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            },
            index: { expires: '0s' }, // TTL index - auto delete when expires
        },

    });
const Item = mongoose.model("Item", ItemSchema)
module.exports = Item;