import express from 'express';
import {
    createHabit,
    getHabits,
    completeHabit,
    uncompleteHabit,
    resetHabit,
    deleteHabit,
    getHabitStats
} from '../controllers/habitController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new habit
router.post('/', authMiddleware, createHabit);

// Get all habits for user
router.get('/', authMiddleware, getHabits);

// Mark habit as completed
router.post('/:habitId/complete', authMiddleware, completeHabit);

// Mark habit as not completed
router.post('/:habitId/uncomplete', authMiddleware, uncompleteHabit);

// Reset habit streak (for bad habits)
router.post('/:habitId/reset', authMiddleware, resetHabit);

// Delete habit
router.delete('/:habitId', authMiddleware, deleteHabit);

// Get habit statistics
router.get('/stats', authMiddleware, getHabitStats);

export default router;
