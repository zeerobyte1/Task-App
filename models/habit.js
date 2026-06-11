const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    habitName: {
        type: String,
        required: true
    },
    streak: {
        type: Number,
        default: 0
    },
    completedDates: [{
        type: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Habit', habitSchema);
