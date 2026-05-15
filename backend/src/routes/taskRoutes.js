const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ Import auth
const jwt = require('jsonwebtoken');

// ✅ POST /api/tasks - Add new task for the logged-in user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, date, time } = req.body;

    const task = new Task({
      title,
      date,
      time,
      user: req.user.id // This is set from token in authMiddleware
    });

    await task.save();
    res.status(201).json({ message: 'Task saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/tasks - Fetch all tasks for the logged-in user



// ✅ GET /api/tasks/:date - Get tasks for a specific date (only for logged-in user)
router.get('/:date', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      date: req.params.date,
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// ✅ PUT /api/tasks/:id - Update a task
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, completed } = req.body;

  const updateData = {
    title,
    description,
    completed,
    doneDate: completed ? new Date() : null
  };

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },  // Ensure task belongs to user
    updateData,
    { new: true }
  );

  res.json(task);
});

// ✅ DELETE /api/tasks/:id - Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ✅ GET /api/tasks - Get all tasks for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});


// ✅ Export once at the end
module.exports = router;

