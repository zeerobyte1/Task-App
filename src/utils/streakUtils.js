const calculateStreak = (subTasks) => {
    const allChecked = subTasks.every(subTask => subTask.isChecked);
    return allChecked ? 1 : 0;
};

const calculateConsistencyScore = (completionData) => {
    const lastSevenDays = completionData.slice(-7);
    const completedDays = lastSevenDays.filter(day => day.completionPercentage === 100).length;
    return (completedDays / 7) * 100; // Score as a percentage
};

const updateStreakAndScore = (taskDays) => {
    let streak = 0;
    let consistencyScore = 0;
    let previousDayCompleted = true;

    taskDays.forEach((day, index) => {
        const dailyStreak = calculateStreak(day.subTasks);
        streak += dailyStreak;

        if (dailyStreak === 0) {
            previousDayCompleted = false;
            streak = 0; // Reset streak if any day is not fully completed
        } else if (previousDayCompleted) {
            consistencyScore += 1; // Increment consistency score for consecutive completed days
        }
    });

    return { streak, consistencyScore: calculateConsistencyScore(taskDays) };
};

export default {
    calculateStreak,
    calculateConsistencyScore,
    updateStreakAndScore,
};