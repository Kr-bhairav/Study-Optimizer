const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const initScheduler = require('./scheduler');
const userRoutes = require('./routes/userRoutes');
const studySessionRoutes = require('./routes/studySessionRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS middleware - Allow frontend to connect
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Only log detailed errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  } else {
    console.error('Server error:', err.message);
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize scheduler for reminders
initScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`Frontend should connect to: http://localhost:${PORT}`);
  }
});
