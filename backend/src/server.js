const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// ==================== DATABASE ====================
connectDB();

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many auth attempts. Please try again in 15 minutes.' },
});
app.use('/api/v1/auth', authLimiter);

// ==================== BODY PARSING ====================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ==================== DATA SANITIZATION ====================
app.use(mongoSanitize()); // Prevent NoSQL injection
// app.use(xss());          // Prevent XSS (uncomment after installing xss-clean)

// ==================== PERFORMANCE ====================
app.use(compression());

// ==================== LOGGING ====================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==================== STATIC FILES ====================
app.use('/uploads', express.static('uploads'));

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ==================== API ROUTES ====================
const API = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/posts`, postRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found.`,
  });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
🚀 BlogPlatform API running
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 Environment : ${process.env.NODE_ENV || 'development'}
🔌 Port        : ${PORT}
📡 API Base    : ${API}
🏥 Health      : http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated.');
    process.exit(0);
  });
});

module.exports = server;
