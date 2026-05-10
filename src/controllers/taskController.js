import Task from '../models/Task.js';
import TaskDay from '../models/TaskDay.js';

// Helper function to get IST time
const getISTTime = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    return new Date(now.getTime() + istOffset);
};

// Create a new task and auto-generate TaskDay entries
export const createTask = async (req, res) => {
    const { topic, durationDays } = req.body;
    const userId = req.user.id; // Assuming user ID is available in req.user

    try {
        const istNow = getISTTime();
        const startOfDay = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
        
        const newTask = await Task.create({
            userId,
            topic,
            durationDays,
            startDate: startOfDay,
            status: 'active'
        });

        // Generate TaskDay entries
        for (let i = 0; i < durationDays; i++) {
            const taskDayDate = new Date(startOfDay);
            taskDayDate.setDate(startOfDay.getDate() + i);
            
            await TaskDay.create({
                taskId: newTask._id,
                userId,
                dayNumber: i + 1,
                date: taskDayDate,
                subTasks: [],
                completionPercentage: 0,
                isEditLocked: false,
                isCheckboxLocked: false
            });
        }

        res.status(201).json({ 
            success: true,
            task: {
                _id: newTask._id,
                userId: newTask.userId,
                topic: newTask.topic,
                durationDays: newTask.durationDays,
                startDate: newTask.startDate,
                status: newTask.status,
                createdAt: newTask.createdAt,
                updatedAt: newTask.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'TASK_CREATION_FAILED', message: error.message });
    }
};

// Get all tasks for the user with progress
export const getMyTasks = async (req, res) => {
    const userId = req.user.id;

    try {
        const tasks = await Task.find({ userId });
        res.status(200).json({
            success: true,
            tasks: tasks
        });
    } catch (error) {
        res.status(500).json({ error: 'FETCH_TASKS_FAILED', message: error.message });
    }
};

// Delete a task and its associated TaskDay entries
export const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        await TaskDay.deleteMany({ taskId });
        await Task.findByIdAndDelete(taskId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'DELETE_TASK_FAILED', message: error.message });
    }
};

// Get all days for a specific task
export const getTaskDays = async (req, res) => {
    const { taskId } = req.params;

    try {
        const taskDays = await TaskDay.find({ taskId });
        res.status(200).json(taskDays);
    } catch (error) {
        res.status(500).json({ error: 'FETCH_TASK_DAYS_FAILED', message: error.message });
    }
};

// Add subtasks for a specific day
export const addSubTasks = async (req, res) => {
    const { dayId } = req.params;
    const { subTasks } = req.body;

    try {
        const taskDay = await TaskDay.findById(dayId);
        if (!taskDay) {
            return res.status(404).json({ error: 'TASKDAY_NOT_FOUND', message: 'TaskDay not found' });
        }
        taskDay.subTasks = subTasks;
        await taskDay.save();
        res.status(200).json(taskDay);
    } catch (error) {
        res.status(500).json({ error: 'ADD_SUBTASKS_FAILED', message: error.message });
    }
};

// Update a subtask's checked status
export const updateSubTask = async (req, res) => {
    const { dayId, subtaskIndex } = req.params;
    const { isChecked } = req.body;

    try {
        const taskDay = await TaskDay.findById(dayId);
        if (!taskDay || !taskDay.subTasks[subtaskIndex]) {
            return res.status(404).json({ error: 'SUBTASK_NOT_FOUND', message: 'Subtask not found' });
        }
        taskDay.subTasks[subtaskIndex].isChecked = isChecked;
        taskDay.subTasks[subtaskIndex].checkedAt = isChecked ? new Date() : null;
        await taskDay.save();
        res.status(200).json(taskDay);
    } catch (error) {
        res.status(500).json({ error: 'UPDATE_SUBTASK_FAILED', message: error.message });
    }
};

// Delete a subtask
export const deleteSubTask = async (req, res) => {
    const { dayId, subtaskIndex } = req.params;

    try {
        const taskDay = await TaskDay.findById(dayId);
        if (!taskDay || !taskDay.subTasks[subtaskIndex]) {
            return res.status(404).json({ error: 'SUBTASK_NOT_FOUND', message: 'Subtask not found' });
        }
        taskDay.subTasks.splice(subtaskIndex, 1);
        await taskDay.save();
        res.status(200).json(taskDay);
    } catch (error) {
        res.status(500).json({ error: 'DELETE_SUBTASK_FAILED', message: error.message });
    }
};