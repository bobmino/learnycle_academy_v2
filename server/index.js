const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database (with caching for serverless)
// On Vercel, connection is lazy and cached via middleware
// We don't connect here in production/Vercel to avoid cold start issues
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
  // In development (non-Vercel), connect immediately
  connectDB().catch(err => {
    console.error('Database connection error:', err);
  });
}

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
// In production on Vercel, frontend and backend are on same domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow same origin in production (Vercel)
    : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Static files for docs (PDFs)
app.use("/docs", express.static(path.join(__dirname, "docs")));

// Ensure database connection for serverless (lazy connection)
app.use(async (req, res, next) => {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      try {
        await connectDB();
        console.log('MongoDB connection established');
      } catch (dbError) {
        console.error('❌ Failed to connect to MongoDB:', dbError.message);
        console.error('Error details:', {
          name: dbError.name,
          message: dbError.message,
          hasMONGO_URI: !!process.env.MONGO_URI
        });
        
        // For API routes, return error response with helpful message
        if (req.path.startsWith('/api')) {
          const errorMessage = dbError.message || 'Database connection failed';
          const isDev = process.env.NODE_ENV === 'development';
          
          return res.status(503).json({ 
            message: 'Database connection failed. Please check your MongoDB configuration.',
            error: isDev ? errorMessage : undefined,
            hint: isDev ? 'Check MONGO_URI and MongoDB Atlas Network Access' : undefined
          });
        }
        // For other routes, continue (frontend will handle)
      }
    }
  } catch (err) {
    console.error('Database connection error in middleware:', err.message);
    if (req.path.startsWith('/api')) {
      return res.status(503).json({ 
        message: 'Database unavailable',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
  next();
});

// Routes - With /api prefix for consistency
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/prospects", require("./routes/prospectRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));

// Health check endpoint (accessible at /api/health)
app.get("/api/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: "ok", 
      message: "Server is running", 
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Export for Vercel Serverless
module.exports = app;
