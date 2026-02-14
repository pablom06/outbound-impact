// Outbound Impact Backend API
// Main server entry point

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const itemsRoutes = require('./routes/items');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const chatRoutes = require('./routes/chat');

// Mount routes
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/items', itemsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/chat', chatRoutes);

// Admin routes (if admin middleware exists)
try {
  const adminRoutes = require('../routes/admin');
  app.use('/api/admin', adminRoutes);
} catch (e) {
  console.log('Admin routes not loaded:', e.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server (for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel serverless
module.exports = app;
