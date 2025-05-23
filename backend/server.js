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

// Always log basic info for debugging
console.log('=== SERVER STARTING ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Connect to database
connectDB();

const app = express();

// CORS middleware - Allow all origins with proper headers
console.log('Setting up CORS...');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

console.log('CORS configured successfully');

// Body parser
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

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
console.log('Setting up routes...');
app.use('/api/users', userRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/ai', aiRoutes);
console.log('Routes configured successfully');

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

console.log('=== STARTING SERVER ===');
console.log('Attempting to start server on port:', PORT);

app.listen(PORT, () => {
  console.log('=== SERVER STARTED SUCCESSFULLY ===');
  console.log(`Server running on port ${PORT}`);
  console.log('Server is ready to accept connections');
}).on('error', (err) => {
  console.error('=== SERVER START ERROR ===');
  console.error('Failed to start server:', err);
});
