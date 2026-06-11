const express = require('express');
const router = express.Router();
const Habit = require('../models/habit');

/* GET habit page */
router.get('/', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.render('habit', { user: req.user, habits });
  } catch (err) {
    console.error(err);
    res.render('habit', { user: req.user, habits: [] });
  }
});

/* POST create habit */
router.post('/', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    const { habitName } = req.body;
    const habit = new Habit({
      habitName
    });
    await habit.save();
    res.redirect('/habit');
  } catch (err) {
    console.error(err);
    res.redirect('/habit');
  }
});

/* POST toggle habit completion for today */
router.post('/:id/toggle', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    const habit = await Habit.findById(req.params.id);
    if (habit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedToday = habit.completedDates.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      
      if (completedToday) {
        habit.completedDates = habit.completedDates.filter(date => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() !== today.getTime();
        });
        habit.streak = Math.max(0, habit.streak - 1);
      } else {
        habit.completedDates.push(today);
        habit.streak += 1;
      }
      
      habit.updatedAt = Date.now();
      await habit.save();
    }
    res.redirect('/habit');
  } catch (err) {
    console.error(err);
    res.redirect('/habit');
  }
});

/* POST delete habit */
router.post('/:id/delete', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.redirect('/habit');
  } catch (err) {
    console.error(err);
    res.redirect('/habit');
  }
});

module.exports = router;
