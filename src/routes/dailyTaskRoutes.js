import express from 'express';
import {
    getTasksByDate,
    getTodayTasks,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    getUserStats
} from '../controllers/dailyTaskController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get tasks by specific date
router.get('/date/:date', authMiddleware, getTasksByDate);

// Get today's tasks
router.get('/today', authMiddleware, getTodayTasks);

// Add a new task for today
router.post('/add', authMiddleware, addTask);

// Toggle task completion
router.put('/toggle/:taskIndex', authMiddleware, toggleTaskCompletion);

// Delete a task
router.delete('/:taskIndex', authMiddleware, deleteTask);

// Get user stats
router.get('/stats', authMiddleware, getUserStats);

export default router;
