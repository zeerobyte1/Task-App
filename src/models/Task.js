import mongoose from 'mongoose';


const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    durationDays: {
        type: Number,
        required: true,
        min: 1,
        max: 365
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;