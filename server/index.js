const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database (with caching for serverless)
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
// In production on Vercel, frontend and backend are on same domain
const corsOptions = {
  origin: process.env.CLIENT_URL || true, // Allow same origin in production
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Static files for docs (PDFs)
app.use("/docs", express.static(path.join(__dirname, "docs")));

// Routes - No /api prefix needed, Vercel handles it
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/modules", require("./routes/moduleRoutes"));
app.use("/lessons", require("./routes/lessonRoutes"));
app.use("/quiz", require("./routes/quizRoutes"));
app.use("/prospects", require("./routes/prospectRoutes"));
app.use("/progress", require("./routes/progressRoutes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
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
