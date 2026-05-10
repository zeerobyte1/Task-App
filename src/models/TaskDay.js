import mongoose from 'mongoose';

const subTaskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isChecked: { type: Boolean, default: false },
    checkedAt: { type: Date }
}, { _id: false });

const taskDaySchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dayNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    subTasks: [subTaskSchema],
    completionPercentage: { type: Number, default: 0 },
    isEditLocked: { type: Boolean, default: false },
    isCheckboxLocked: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('TaskDay', taskDaySchema);