import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import cronJobs from './utils/cronJobs.js'; // Import cron jobs

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running...`);
        // Start cron jobs after server starts
        cronJobs.startCronJobs();
    });
}).catch(err => {
    console.error('Failed to start server:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    cronJobs.stopCronJobs();
    process.exit(0);
});