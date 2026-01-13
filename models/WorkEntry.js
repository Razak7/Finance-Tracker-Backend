const mongoose = require('mongoose');

const workEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WorkEntry', workEntrySchema);