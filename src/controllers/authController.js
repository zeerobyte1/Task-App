import User from '../models/User.js';
import jwt from '../utils/jwt.js';

// User Registration
export const register = async (req, res) => {
    const { email, name } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'USER_ALREADY_EXISTS', message: 'User with this email already exists.' });
        }

        // Create new user with name
        const newUser = new User({ 
            email, 
            name: name || 'User',
            createdAt: new Date(), 
            stats: { totalTasks: 0, totalSubTasksCompleted: 0, currentStreak: 0, bestStreak: 0, consistencyScore: 0 } 
        });
        await newUser.save();

        // Generate JWT token
        const token = jwt.generateToken(newUser._id);

        // Set cookie with token (30 days expiry)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        });

        return res.status(201).json({ userId: newUser._id, email: newUser.email, name: newUser.name, token });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ error: 'SERVER_ERROR', message: 'An error occurred while registering the user.' });
    }
};

// User Login
export const login = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found.' });
        }

        // Update login streak
        await updateLoginStreak(user);

        // Generate JWT token
        const token = jwt.generateToken(user._id);

        // Set cookie with token (30 days expiry)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        });

        return res.status(200).json({ 
            userId: user._id, 
            email: user.email, 
            name: user.name,
            stats: user.stats, 
            token 
        });
    } catch (error) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: 'An error occurred while logging in.' });
    }
};

// Helper function to update login streak
const updateLoginStreak = async (user) => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // Initialize login streak if not exists
    if (!user.stats.loginStreak) {
        user.stats.loginStreak = 0;
    }
    
    // Check if user logged in yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;
    
    if (user.stats.lastLoginDate) {
        const lastLoginDate = new Date(user.stats.lastLoginDate);
        const lastLoginString = `${lastLoginDate.getFullYear()}-${(lastLoginDate.getMonth() + 1).toString().padStart(2, '0')}-${lastLoginDate.getDate().toString().padStart(2, '0')}`;
        
        if (lastLoginString === yesterdayString) {
            // Consecutive day - increment streak
            user.stats.loginStreak += 1;
        } else if (lastLoginString !== todayString) {
            // Streak broken - reset to 1
            user.stats.loginStreak = 1;
        }
        // If same day, don't update streak
    } else {
        // First time login
        user.stats.loginStreak = 1;
    }
    
    // Update last login date
    user.stats.lastLoginDate = today;
    
    // Check for 30-day achievement
    const hasThirtyDayStreak = user.stats.loginStreak >= 30;
    if (hasThirtyDayStreak && !user.stats.hasThirtyDayStreak) {
        user.stats.hasThirtyDayStreak = true;
        
        // Add 30-day achievement
        if (!user.stats.achievements.includes('30-Day Karo Master')) {
            user.stats.achievements.push('30-Day Karo Master');
        }
        if (!user.stats.achievements.includes('Karo Legend')) {
            user.stats.achievements.push('Karo Legend');
        }
    }
    
    // Add other milestone achievements
    if (user.stats.loginStreak >= 7 && !user.stats.achievements.includes('7-Day Warrior')) {
        user.stats.achievements.push('7-Day Warrior');
    }
    if (user.stats.loginStreak >= 14 && !user.stats.achievements.includes('14-Day Champion')) {
        user.stats.achievements.push('14-Day Champion');
    }
    if (user.stats.loginStreak >= 21 && !user.stats.achievements.includes('21-Day Hero')) {
        user.stats.achievements.push('21-Day Hero');
    }
    
    // Save updated user
    await user.save();
};

// Validate Token
export const validateToken = async (req, res) => {
    try {
        // The user should be attached by auth middleware
        if (!req.user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token' });
        }

        // Find the user and update login streak if needed
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
        }

        // Update login streak if this is a new day login
        await updateLoginStreak(user);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                stats: user.stats
            }
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error during token validation' });
    }
};