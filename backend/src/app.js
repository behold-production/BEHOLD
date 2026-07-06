const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const { connectDB } = require('./config/db');
const { ipBlockMiddleware } = require('./middleware/ipBlockMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const counsellorRoutes = require('./routes/counsellorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const publicRoutes = require('./routes/publicRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const cronRoutes = require('./routes/cronRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// ─── Compress Responses ──────────────────────────────────────────────────────
app.use(compression());

// ─── Trust Proxy for Rate Limiting ──────────────────────────────────────────
app.set('trust proxy', 1); // Essential for rate limiters behind a reverse proxy/load balancer (e.g., Vercel, AWS, Render)

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } // allow images/uploads from other origins
  })
);

// ─── Database Connection Middleware for Serverless / Cold Starts ───────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// ─── IP Blocklist ─────────────────────────────────────────────────────────
app.use(ipBlockMiddleware);

// ─── CORS ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://www.behold.co.in/',
  /^http:\/\/192\.168\.29\.45:\d+$/, // Allow specific LAN IP for development
  /^https:\/\/.*\.vercel\.app$/, // All Vercel preview deployments
  process.env.FRONTEND_URL // Set this in Vercel env vars to your production URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) =>
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
      );
      if (isAllowed) return callback(null, true);
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// ─── Rate Limiters ────────────────────────────────────────────────────────
// General API limiter: 200 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict auth limiter: 20 requests per 15 minutes per IP (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter); // Applied in addition to general; auth gets stricter limit

// ─── Body Parsers ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── MongoDB Injection Sanitization ──────────────────────────────────────
// Strips keys starting with '$' or containing '.' from request body/query/params
app.use(
  mongoSanitize({
    onSanitize: ({ req, key }) => {
      console.warn(`[Security] Sanitized key "${key}" from ${req.ip}`);
    }
  })
);

// ─── Static File Serving ──────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Behold Aspire Backend API is running and healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/google', googleAuthRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api', publicRoutes);

// ─── 404 Catch ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`
  });
});

// ─── Centralised Error Handler ────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
