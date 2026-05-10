import TaskDay from '../models/TaskDay.js';

// Function to lock editing of TaskDay entries at 8 AM IST
const lockEditing = async () => {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];

    try {
        await TaskDay.updateMany(
            { date: { $eq: currentDateString }, isEditLocked: false },
            { $set: { isEditLocked: true } }
        );
        console.log(`Editing locked for TaskDays on ${currentDateString}`);
    } catch (error) {
        console.error('Error locking editing:', error);
    }
};

// Function to lock checkboxes of TaskDay entries at 1 AM IST
const lockCheckboxes = async () => {
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 1);
    const previousDateString = previousDate.toISOString().split('T')[0];

    try {
        await TaskDay.updateMany(
            { date: { $eq: previousDateString }, isCheckboxLocked: false },
            { $set: { isCheckboxLocked: true } }
        );
        console.log(`Checkboxes locked for TaskDays on ${previousDateString}`);
    } catch (error) {
        console.error('Error locking checkboxes:', error);
    }
};

// Simple interval-based scheduler (lighter than node-cron)
let lockEditingInterval;
let lockCheckboxesInterval;

const startCronJobs = () => {
    // Run lockEditing every hour (will actually lock at 8 AM when checked)
    lockEditingInterval = setInterval(() => {
        const now = new Date();
        const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        if (istTime.getHours() === 8 && istTime.getMinutes() === 0) {
            lockEditing();
        }
    }, 60 * 1000); // Check every minute

    // Run lockCheckboxes every hour (will actually lock at 1 AM when checked)
    lockCheckboxesInterval = setInterval(() => {
        const now = new Date();
        const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        if (istTime.getHours() === 1 && istTime.getMinutes() === 0) {
            lockCheckboxes();
        }
    }, 60 * 1000); // Check every minute

    console.log('Cron jobs started (using intervals)');
};

const stopCronJobs = () => {
    if (lockEditingInterval) clearInterval(lockEditingInterval);
    if (lockCheckboxesInterval) clearInterval(lockCheckboxesInterval);
    console.log('Cron jobs stopped');
};

export default {
    lockEditing,
    lockCheckboxes,
    startCronJobs,
    stopCronJobs,
};