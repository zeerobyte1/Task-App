import DailyTask from '../models/DailyTask.js';

// Helper function to get date in YYYY-MM-DD format for Asia/Kolkata timezone
const getDateInTimezone = (date = new Date()) => {
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    return new Intl.DateTimeFormat('en-CA', options).format(date); // en-CA gives YYYY-MM-DD
};

// Get tasks by specific date
export const getTasksByDate = async (req, res) => {
    const userId = req.user.id;
    const { date } = req.params; // Expected format: YYYY-MM-DD

    try {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_DATE',
                message: 'Date must be in YYYY-MM-DD format'
            });
        }

        const dailyTask = await DailyTask.findOne({ userId, date });
        
        if (!dailyTask) {
            return res.status(404).json({
                success: false,
                error: 'TASKS_NOT_FOUND',
                message: 'No tasks found for this date'
            });
        }

        res.status(200).json({
            success: true,
            dailyTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'FETCH_FAILED',
            message: error.message
        });
    }
};

// Get or create today's tasks
export const getTodayTasks = async (req, res) => {
    const userId = req.user.id;
    const today = getDateInTimezone();

    try {
        let dailyTask = await DailyTask.findOne({ userId, date: today });
        
        if (!dailyTask) {
            // Create empty task list for today
            dailyTask = await DailyTask.create({
                userId,
                date: today,
                tasks: [],
                totalTasks: 0,
                completedTasks: 0,
                isDayCompleted: false
            });
        }

        res.status(200).json({
            success: true,
            dailyTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'FETCH_FAILED',
            message: error.message
        });
    }
};

// Add a new task for today
export const addTask = async (req, res) => {
    const userId = req.user.id;
    const { text } = req.body;
    const today = getDateInTimezone();

    try {
        let dailyTask = await DailyTask.findOne({ userId, date: today });
        
        if (!dailyTask) {
            dailyTask = await DailyTask.create({
                userId,
                date: today,
                tasks: [{ text, isCompleted: false }],
                totalTasks: 1,
                completedTasks: 0,
                isDayCompleted: false
            });
        } else {
            dailyTask.tasks.push({ text, isCompleted: false });
            dailyTask.totalTasks = dailyTask.tasks.length;
            await dailyTask.save();
        }

        res.status(201).json({
            success: true,
            dailyTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'ADD_FAILED',
            message: error.message
        });
    }
};

// Toggle task completion
export const toggleTaskCompletion = async (req, res) => {
    const userId = req.user.id;
    const { taskIndex } = req.params;
    const today = getDateInTimezone();

    try {
        const dailyTask = await DailyTask.findOne({ userId, date: today });
        
        if (!dailyTask || !dailyTask.tasks[taskIndex]) {
            return res.status(404).json({
                success: false,
                error: 'TASK_NOT_FOUND',
                message: 'Task not found'
            });
        }

        // Toggle completion status
        dailyTask.tasks[taskIndex].isCompleted = !dailyTask.tasks[taskIndex].isCompleted;
        
        // Update completion count
        dailyTask.completedTasks = dailyTask.tasks.filter(t => t.isCompleted).length;
        dailyTask.isDayCompleted = dailyTask.completedTasks === dailyTask.totalTasks && dailyTask.totalTasks > 0;
        
        await dailyTask.save();

        res.status(200).json({
            success: true,
            dailyTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'UPDATE_FAILED',
            message: error.message
        });
    }
};

// Delete a task
export const deleteTask = async (req, res) => {
    const userId = req.user.id;
    const { taskIndex } = req.params;
    const today = getDateInTimezone();

    try {
        const dailyTask = await DailyTask.findOne({ userId, date: today });
        
        if (!dailyTask || !dailyTask.tasks[taskIndex]) {
            return res.status(404).json({
                success: false,
                error: 'TASK_NOT_FOUND',
                message: 'Task not found'
            });
        }

        // Remove task
        dailyTask.tasks.splice(taskIndex, 1);
        dailyTask.totalTasks = dailyTask.tasks.length;
        dailyTask.completedTasks = dailyTask.tasks.filter(t => t.isCompleted).length;
        dailyTask.isDayCompleted = dailyTask.completedTasks === dailyTask.totalTasks && dailyTask.totalTasks > 0;
        
        await dailyTask.save();

        res.status(200).json({
            success: true,
            dailyTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DELETE_FAILED',
            message: error.message
        });
    }
};

// Get all daily stats for user
export const getUserStats = async (req, res) => {
    const userId = req.user.id;

    try {
        const allTasks = await DailyTask.find({ userId }).sort({ date: -1 });
        
        // Calculate current streak
        let currentStreak = 0;
        const today = getDateInTimezone();
        let checkDate = new Date(today);
        
        for (let i = 0; i < allTasks.length; i++) {
            const taskDate = allTasks[i].date;
            const checkDateString = getDateInTimezone(checkDate);
            
            if (taskDate === checkDateString && allTasks[i].isDayCompleted) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (taskDate === checkDateString && !allTasks[i].isDayCompleted) {
                break; // Streak broken
            } else if (taskDate !== checkDateString) {
                break; // Missing day, streak broken
            }
        }
        
        const stats = {
            totalDays: allTasks.length,
            completedDays: allTasks.filter(d => d.isDayCompleted).length,
            totalTasksCreated: allTasks.reduce((sum, d) => sum + d.totalTasks, 0),
            totalTasksCompleted: allTasks.reduce((sum, d) => sum + d.completedTasks, 0),
            currentStreak: currentStreak,
            dailyHistory: allTasks.map(d => ({
                date: d.date,
                totalTasks: d.totalTasks,
                completedTasks: d.completedTasks,
                isCompleted: d.isDayCompleted
            }))
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'STATS_FAILED',
            message: error.message
        });
    }
};
