// backend/models/RentRequest.js
const mongoose = require('mongoose');

const rentRequestSchema = new mongoose.Schema({

    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item', required: true
    },
    renterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    duration: {
        type: Number, required: true
    },
    totalPrice: {
        type: Number, required: true
    },
    status: {
        type: String, enum: ['Pending', 'Active', 'Rejected'],
        default: 'Pending'
    },
    requestedAt: {
        type: Date, default: Date.now
    },
    activeAt: {
        type: Date
    }
});

module.exports = mongoose.model('RentRequest', rentRequestSchema);
