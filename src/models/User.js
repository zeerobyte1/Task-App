import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    stats: {
        totalTasks: { type: Number, default: 0 },
        totalSubTasksCompleted: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        bestStreak: { type: Number, default: 0 },
        consistencyScore: { type: Number, default: 0 },
        loginStreak: { type: Number, default: 0 },
        lastLoginDate: { type: Date, default: null },
        hasThirtyDayStreak: { type: Boolean, default: false },
        achievements: { type: [String], default: [] }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;