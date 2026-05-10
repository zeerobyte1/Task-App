import mongoose from 'mongoose';

const dailyTaskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    tasks: [{
        text: {
            type: String,
            required: true
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalTasks: {
        type: Number,
        default: 0
    },
    completedTasks: {
        type: Number,
        default: 0
    },
    isDayCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for faster queries
dailyTaskSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyTask = mongoose.model('DailyTask', dailyTaskSchema);

export default DailyTask;
