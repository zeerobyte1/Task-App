import express from 'express';
import { register, login, validateToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();

// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

// Route for token validation
router.get('/validate', authenticateToken, validateToken);

export default router;