const mongoose = require("mongoose");

// Cache connection for serverless functions
let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse the connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  // Check if connection is in progress
  if (mongoose.connection.readyState === 2) {
    console.log('MongoDB connection in progress, waiting...');
    // Wait for connection to complete
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => {
        cachedConnection = mongoose.connection;
        resolve(mongoose.connection);
      });
      mongoose.connection.once('error', reject);
    });
  }

  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    const error = new Error('MONGO_URI environment variable is not set');
    console.error(error.message);
    throw error;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      // Serverless-friendly options
      serverSelectionTimeoutMS: 10000, // Increased from 5000ms
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 1, // Important for serverless - limit connections
      minPoolSize: 0,
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In serverless, don't exit process - just throw error
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
