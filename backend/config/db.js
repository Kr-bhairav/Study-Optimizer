const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Temporary hardcoded connection for Railway deployment
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://abhi993575:Diksha1234@smart-study.vufkrhs.mongodb.net/smart-study';

    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI exists:', !!mongoURI);
    console.log('MongoDB URI length:', mongoURI.length);

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
