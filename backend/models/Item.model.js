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
     

    });
const Item = mongoose.model("Item", ItemSchema)
module.exports = Item;