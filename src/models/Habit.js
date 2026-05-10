import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    totalDays: { type: Number, default: 0 },
    lastCompletedDate: { type: String }, // YYYY-MM-DD format
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    dailyProgress: [{
        date: { type: String, required: true }, // YYYY-MM-DD
        completed: { type: Boolean, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

habitSchema.index({ userId: 1, title: 1 }, { unique: true });
habitSchema.index({ userId: 1, isActive: 1 });

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
