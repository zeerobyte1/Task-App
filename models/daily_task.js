const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true
    },
    ifLectureTimeInMinutes: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DailyTask', dailyTaskSchema);