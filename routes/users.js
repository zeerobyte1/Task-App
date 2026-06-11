var express = require('express');
var router = express.Router();
const DailyTask = require('../models/daily_task');

/* GET profile page */
router.get('/profile', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    const tasks = await DailyTask.find().sort({ date: -1 });
    
    // Group tasks by date
    const tasksByDate = {};
    tasks.forEach(task => {
      const date = new Date(task.date);
      const dateKey = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });
    
    res.render('profile', { user: req.user, tasksByDate });
  } catch (err) {
    console.error(err);
    res.render('profile', { user: req.user, tasksByDate: {} });
  }
});

module.exports = router;
