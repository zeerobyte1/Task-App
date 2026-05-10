import TaskDay from '../models/TaskDay.js';
import User from '../models/User.js';

// Helper function to get IST time
const getISTTime = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    return new Date(now.getTime() + istOffset);
};


// Get today's statistics and streaks for the user
export const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const taskDays = await TaskDay.find({
            userId: userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalTasks = taskDays.length;
        const completedTasks = taskDays.filter(day => day.completionPercentage === 100).length;
        const currentStreak = await calculateCurrentStreak(userId);
        const consistencyScore = await calculateConsistencyScore(userId);

        res.status(200).json({
            totalTasks,
            completedTasks,
            currentStreak,
            consistencyScore
        });
    } catch (error) {
        res.status(500).json({
            error: "SERVER_ERROR",
            message: "An error occurred while fetching statistics.",
            details: error.message
        });
    }
};

// Get task progress for a specific task
export const getTaskProgress = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const taskDays = await TaskDay.find({ taskId: taskId });

        res.status(200).json(taskDays);
    } catch (error) {
        res.status(500).json({
            error: "SERVER_ERROR",
            message: "An error occurred while fetching task progress.",
            details: error.message
        });
    }
};

// Get a daily report for the last 30 days
export const getDailyReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const taskDays = await TaskDay.find({
            userId: userId,
            date: { $gte: startDate, $lte: endDate }
        });

        const report = taskDays.map(day => ({
            date: day.date,
            completionPercentage: day.completionPercentage
        }));

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({
            error: "SERVER_ERROR",
            message: "An error occurred while fetching the daily report.",
            details: error.message
        });
    }
};

// Get upcoming deadlines for tasks ending in 3 days or less
export const getUpcomingDeadlines = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const deadlineDate = new Date();
        deadlineDate.setDate(today.getDate() + 3);

        const tasks = await TaskDay.find({
            userId: userId,
            date: { $lte: deadlineDate }
        });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({
            error: "SERVER_ERROR",
            message: "An error occurred while fetching upcoming deadlines.",
            details: error.message
        });
    }
};

// Helper function to calculate current streak
export const calculateCurrentStreak = async (userId) => {
    const istNow = getISTTime();
    const today = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
    let streak = 0;

    for (let i = 0; i < 100; i++) { // Check up to 100 days back
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const taskDays = await TaskDay.find({ userId, date: { $eq: date } });
        if (taskDays.length === 0) break;
        const allComplete = taskDays.every(day => day.completionPercentage === 100);
        if (allComplete) streak++;
        else break;
    }
    return streak;
};

// Helper function to calculate consistency score
export const calculateConsistencyScore = async (userId) => {
    const istNow = getISTTime();
    const today = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
    let completed = 0;
    let total = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const taskDays = await TaskDay.find({ userId, date: { $eq: date } });
        if (taskDays.length === 0) continue;
        total++;
        const allComplete = taskDays.every(day => day.completionPercentage === 100);
        if (allComplete) completed++;
    }
    return total === 0 ? 0 : Math.round((completed / total) * 100);
};