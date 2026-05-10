import express from 'express';
import {createTask, getMyTasks, deleteTask, getTaskDays, addSubTasks, updateSubTask, deleteSubTask, } from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new task and auto-generate TaskDay entries
router.post('/', authMiddleware, createTask);

// Get all tasks for the authenticated user with progress
router.get('/my', authMiddleware, getMyTasks);

// Delete a task and its associated TaskDay entries
router.delete('/:taskId', authMiddleware, deleteTask);

// Get all days for a specific task
router.get('/:taskId/days', authMiddleware, getTaskDays);

// Add subtasks for a specific day (12 AM - 8 AM allowed)
router.post('/days/:dayId/subtasks', authMiddleware, addSubTasks);

// Update a specific subtask (8 AM - next day 1 AM allowed)
router.put('/days/:dayId/subtasks/:subtaskIndex', authMiddleware, updateSubTask);

// Delete a specific subtask (12 AM - 8 AM allowed)
router.delete('/days/:dayId/subtasks/:subtaskIndex', authMiddleware, deleteSubTask);

export default router;