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
// In production on Vercel, allow the specific domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CLIENT_URL || 'https://learnycle-academy.vercel.app')
    : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Static files for docs (PDFs)
app.use("/docs", express.static(path.join(__dirname, "docs")));

// Function to ensure admin user exists
const ensureAdminExists = async () => {
  try {
    const User = require('./models/User');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('⚠️  No admin user found. Creating default admin...');
      await User.create({
        name: 'Admin User',
        email: 'admin@learncycle.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@learncycle.com / admin123');
      console.log('⚠️  Please change the password after first login!');
    }
  } catch (error) {
    console.error('Error ensuring admin exists:', error.message);
  }
};

// Ensure database connection for serverless (lazy connection)
app.use(async (req, res, next) => {
  // Allow diagnostic endpoint to pass through even without DB connection
  if (req.path === '/api/diagnostic' || req.path === '/api/health') {
    return next();
  }
  
  // Ensure admin exists on first API call (after DB connection)
  if (mongoose.connection.readyState === 1 && !global.adminChecked) {
    global.adminChecked = true;
    await ensureAdminExists();
  }

  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      try {
        await connectDB();
        console.log('MongoDB connection established');
        // Ensure admin exists after connection
        if (!global.adminChecked) {
          global.adminChecked = true;
          await ensureAdminExists();
        }
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
    if (req.path.startsWith('/api') && req.path !== '/api/diagnostic' && req.path !== '/api/health') {
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
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check endpoint (accessible at /api/health)
app.get("/api/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const hasMongoUri = !!process.env.MONGO_URI;
    const mongoUriPreview = hasMongoUri 
      ? process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@').split('@')[1] || 'configured'
      : 'not set';
    
    res.json({ 
      status: "ok", 
      message: "Server is running", 
      timestamp: new Date().toISOString(),
      database: dbStatus,
      mongoUri: mongoUriPreview,
      nodeEnv: process.env.NODE_ENV || 'not set'
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});

// Diagnostic endpoint for MongoDB connection
app.get("/api/diagnostic", async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const hasMongoUri = !!process.env.MONGO_URI;
    const mongoUriPreview = hasMongoUri 
      ? process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')
      : 'NOT SET';
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        vercel: process.env.VERCEL === '1' ? 'yes' : 'no',
        cwd: process.cwd()
      },
      mongodb: {
        hasUri: hasMongoUri,
        uriPreview: mongoUriPreview,
        connectionState: mongoose.connection.readyState,
        connectionStateText: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        }[mongoose.connection.readyState] || 'unknown',
        host: mongoose.connection.host || 'not connected',
        name: mongoose.connection.name || 'not connected'
      },
      envVars: {
        hasJwtAccess: !!process.env.JWT_ACCESS_SECRET,
        hasJwtRefresh: !!process.env.JWT_REFRESH_SECRET,
        clientUrl: process.env.CLIENT_URL || 'not set'
      }
    };

    // Try to connect if not connected
    if (mongoose.connection.readyState !== 1 && hasMongoUri) {
      try {
        await connectDB();
        diagnostic.mongodb.connectionState = mongoose.connection.readyState;
        diagnostic.mongodb.connectionStateText = 'connected';
        diagnostic.mongodb.host = mongoose.connection.host;
        diagnostic.mongodb.name = mongoose.connection.name;
      } catch (error) {
        diagnostic.mongodb.connectionError = error.message;
        diagnostic.mongodb.errorName = error.name;
      }
    }

    res.json(diagnostic);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
