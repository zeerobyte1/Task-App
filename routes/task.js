const express = require('express');
const router = express.Router();
const DailyTask = require('../models/daily_task');

/* GET task page */
router.get('/', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    const tasks = await DailyTask.find().sort({ createdAt: -1 });
    res.render('task', { user: req.user, tasks });
  } catch (err) {
    console.error(err);
    res.render('task', { user: req.user, tasks: [] });
  }
});

/* POST create task */
router.post('/', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    const { taskName, ifLectureTimeInMinutes } = req.body;
    const task = new DailyTask({
      taskName,
      ifLectureTimeInMinutes: ifLectureTimeInMinutes || 0
    });
    await task.save();
    res.redirect('/task');
  } catch (err) {
    console.error(err);
    res.redirect('/task');
  }
});

/* POST toggle task completion */
router.post('/:id/toggle', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    const task = await DailyTask.findById(req.params.id);
    if (task) {
      task.completed = !task.completed;
      task.updatedAt = Date.now();
      await task.save();
    }
    res.redirect('/task');
  } catch (err) {
    console.error(err);
    res.redirect('/task');
  }
});

/* POST delete task */
router.post('/:id/delete', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  try {
    await DailyTask.findByIdAndDelete(req.params.id);
    res.redirect('/task');
  } catch (err) {
    console.error(err);
    res.redirect('/task');
  }
});

module.exports = router;
