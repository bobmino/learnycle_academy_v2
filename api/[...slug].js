// Import the Express app from server
let app;

try {
  app = require('../server/index');
} catch (error) {
  console.error('Error loading server/index:', error);
  // Fallback handler
  app = (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed', 
      message: error.message 
    });
  };
}

// Export for Vercel serverless functions
// The app is already configured with /api routes, so we just pass through
module.exports = app;
