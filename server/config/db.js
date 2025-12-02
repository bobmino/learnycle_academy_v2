const mongoose = require("mongoose");

// Cache connection for serverless functions
let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse the connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/learncycle",
      {
        // Serverless-friendly options
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // In serverless, don't exit process - just throw error
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
