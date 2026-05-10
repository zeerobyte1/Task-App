import Habit from '../models/Habit.js';

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

// Create a new habit
export const createHabit = async (req, res) => {
    const userId = req.user.id;
    const { title } = req.body;

    try {
        // Check if habit with same title already exists
        const existingHabit = await Habit.findOne({ userId, title });
        if (existingHabit) {
            return res.status(400).json({
                success: false,
                error: 'HABIT_EXISTS',
                message: 'A habit with this title already exists'
            });
        }

        const newHabit = new Habit({
            userId,
            title,
            currentStreak: 0,
            bestStreak: 0,
            totalDays: 0
        });

        await newHabit.save();

        res.status(201).json({
            success: true,
            habit: newHabit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'CREATE_FAILED',
            message: error.message
        });
    }
};

// Get all habits for user
export const getHabits = async (req, res) => {
    const userId = req.user.id;

    try {
        const habits = await Habit.find({ userId, isActive: true })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            habits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'FETCH_FAILED',
            message: error.message
        });
    }
};

// Mark habit as completed for today
export const completeHabit = async (req, res) => {
    const userId = req.user.id;
    const { habitId } = req.params;
    const today = getDateInTimezone();

    try {
        const habit = await Habit.findOne({ userId, _id: habitId, isActive: true });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                error: 'HABIT_NOT_FOUND',
                message: 'Habit not found'
            });
        }

        // Check if already completed today
        const todayProgress = habit.dailyProgress.find(p => p.date === today);
        if (todayProgress && todayProgress.completed) {
            return res.status(400).json({
                success: false,
                error: 'ALREADY_COMPLETED',
                message: 'Habit already completed today'
            });
        }

        // Update or add today's progress
        if (todayProgress) {
            todayProgress.completed = true;
            todayProgress.timestamp = new Date();
        } else {
            habit.dailyProgress.push({
                date: today,
                completed: true,
                timestamp: new Date()
            });
        }

        // Update streak logic - increment streak for all habits
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = getDateInTimezone(yesterdayDate);
        const yesterdayProgress = habit.dailyProgress.find(p => p.date === yesterday);
        
        if (habit.lastCompletedDate === yesterday || yesterdayProgress?.completed) {
            habit.currentStreak += 1;
        } else {
            habit.currentStreak = 1;
        }
        
        habit.lastCompletedDate = today;
        habit.totalDays += 1;
        
        if (habit.currentStreak > habit.bestStreak) {
            habit.bestStreak = habit.currentStreak;
        }

        await habit.save();

        res.status(200).json({
            success: true,
            habit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'COMPLETE_FAILED',
            message: error.message
        });
    }
};

// Mark habit as not completed for today
export const uncompleteHabit = async (req, res) => {
    const userId = req.user.id;
    const { habitId } = req.params;
    const today = getDateInTimezone();

    try {
        const habit = await Habit.findOne({ userId, _id: habitId, isActive: true });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                error: 'HABIT_NOT_FOUND',
                message: 'Habit not found'
            });
        }

        // Check if not completed today
        const todayProgress = habit.dailyProgress.find(p => p.date === today);
        if (!todayProgress || !todayProgress.completed) {
            return res.status(400).json({
                success: false,
                error: 'NOT_COMPLETED',
                message: 'Habit is not marked as completed today'
            });
        }

        // Update today's progress to not completed
        todayProgress.completed = false;
        todayProgress.timestamp = new Date();

        // Update streak logic - decrement streak for all habits
        if (habit.currentStreak > 0) {
            habit.currentStreak -= 1;
        }
        
        // Update last completed date to previous day
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = getDateInTimezone(yesterdayDate);
        
        // Find the last completed day before today
        let lastCompletedDate = null;
        for (let i = habit.dailyProgress.length - 1; i >= 0; i--) {
            const progress = habit.dailyProgress[i];
            if (progress.date !== today && progress.completed) {
                lastCompletedDate = progress.date;
                break;
            }
        }
        habit.lastCompletedDate = lastCompletedDate;
        
        if (habit.totalDays > 0) {
            habit.totalDays -= 1;
        }

        await habit.save();

        res.status(200).json({
            success: true,
            habit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'UNCOMPLETE_FAILED',
            message: error.message
        });
    }
};

// Reset habit streak (for bad habits)
export const resetHabit = async (req, res) => {
    const userId = req.user.id;
    const { habitId } = req.params;
    const today = getDateInTimezone();

    try {
        const habit = await Habit.findOne({ userId, _id: habitId, isActive: true });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                error: 'HABIT_NOT_FOUND',
                message: 'Habit not found'
            });
        }

        // Reset streak to 0
        habit.currentStreak = 0;
        habit.lastCompletedDate = null;

        // Mark today as failed for bad habit
        if (habit.type === 'bad') {
            const todayProgress = habit.dailyProgress.find(p => p.date === today);
            if (todayProgress) {
                todayProgress.completed = false;
                todayProgress.timestamp = new Date();
            } else {
                habit.dailyProgress.push({
                    date: today,
                    completed: false,
                    timestamp: new Date()
                });
            }
        }

        await habit.save();

        res.status(200).json({
            success: true,
            habit,
            message: 'Habit streak reset successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'RESET_FAILED',
            message: error.message
        });
    }
};

// Delete habit
export const deleteHabit = async (req, res) => {
    const userId = req.user.id;
    const { habitId } = req.params;

    try {
        const habit = await Habit.findOneAndUpdate(
            { userId, _id: habitId },
            { isActive: false },
            { new: true }
        );

        if (!habit) {
            return res.status(404).json({
                success: false,
                error: 'HABIT_NOT_FOUND',
                message: 'Habit not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Habit deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'DELETE_FAILED',
            message: error.message
        });
    }
};

// Get habit statistics
export const getHabitStats = async (req, res) => {
    const userId = req.user.id;

    try {
        const habits = await Habit.find({ userId, isActive: true });
        
        const stats = {
            totalHabits: habits.length,
            goodHabits: habits.filter(h => h.type === 'good').length,
            badHabits: habits.filter(h => h.type === 'bad').length,
            totalBestStreak: habits.reduce((sum, h) => sum + h.bestStreak, 0),
            currentTotalStreak: habits.reduce((sum, h) => sum + h.currentStreak, 0),
            habits: habits.map(h => ({
                id: h._id,
                title: h.title,
                type: h.type,
                currentStreak: h.currentStreak,
                bestStreak: h.bestStreak,
                totalDays: h.totalDays,
                lastCompletedDate: h.lastCompletedDate
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
