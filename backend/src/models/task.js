const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String }, // Add this if you're using a time field
  description: { type: String },
  completed: { type: Boolean, default: false },
  doneDate: { type: Date, default: null },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Task', taskSchema);
