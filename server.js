const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/task'); // Adjust the path if needed
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIX: Allow Authorization header in CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));  // ✅ Apply CORS with headers
app.use(express.json());
app.use(express.static('public'));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// ✅ Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ✅ Task routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);
