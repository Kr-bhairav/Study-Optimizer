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

// Debug environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:');
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
}

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

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'SmartStudy Backend API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'SmartStudy API is working!',
    version: '1.0.0',
    endpoints: ['/api/users', '/api/study-sessions', '/api/ai']
  });
});

// Debug route to check environment variables (REMOVE AFTER FIXING)
app.get('/debug', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
    MONGODB_URI_LENGTH: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL
  });
});

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
