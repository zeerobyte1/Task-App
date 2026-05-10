import express from 'express';
import { getDailyReport, getStats, getTaskProgress, getUpcomingDeadlines, calculateCurrentStreak, calculateConsistencyScore } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get today's statistics and streak
router.get('/stats', authMiddleware, getStats);

// Get task progress for a specific task
router.get('/task-progress/:taskId', authMiddleware, getTaskProgress);

// Get a daily report for the last 30 days
router.get('/daily-report', authMiddleware, getDailyReport);

// Get upcoming deadlines for tasks ending in 3 days or less
router.get('/upcoming-deadlines', authMiddleware, getUpcomingDeadlines);

// Get current streak for the user
router.get('/current-streak', authMiddleware, calculateCurrentStreak);

// Get consistency score for the user
router.get('/consistency-score', authMiddleware, calculateConsistencyScore);


export default router;