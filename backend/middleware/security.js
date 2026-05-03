const rateLimit = require('express-rate-limit');
const helmet    = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss       = require('xss-clean');

// ── Rate limiters ──────────────────────────────────────

// General API: 200 req / 15 min
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again after 15 minutes.' },
});

// Auth endpoints: 20 req / 15 min (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});

// Upload: 10 req / 1 hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Upload limit reached, please try again in an hour.' },
});

// ── Security headers ───────────────────────────────────
const securityHeaders = helmet({
  crossOriginEmbedderPolicy: false,   // needed for some image hosts
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc:    ["'self'", 'fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:', 'res.cloudinary.com', '*.cloudinary.com'],
      scriptSrc:  ["'self'"],
      connectSrc: ["'self'", 'api.stripe.com'],
      frameSrc:   ["'none'"],
    },
  },
});

// ── Input sanitization ─────────────────────────────────
// Prevent NoSQL injection ($where, $gt, etc. stripped from req.body/params/query)
const sanitizeMongo = mongoSanitize({ replaceWith: '_' });

// Prevent XSS (strips HTML tags from inputs)
const sanitizeXss = xss();

// ── Request logger (development) ───────────────────────
const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const color = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`${color}${req.method}\x1b[0m ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
  }
  next();
};

// ── 404 handler ────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
};

// ── Global error handler ───────────────────────────────
const errorHandler = (err, req, res, next) => {
  let status  = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    status  = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status  = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    status  = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Token expired'; }

  console.error(`[${new Date().toISOString()}] ${status} ${message}`);

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  securityHeaders,
  sanitizeMongo,
  sanitizeXss,
  requestLogger,
  notFound,
  errorHandler,
};