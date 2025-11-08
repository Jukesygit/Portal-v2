import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { SERVICES } from './config/services.js';
import { authenticate, optionalAuthenticate } from './middleware/authenticate.js';
import { createServiceProxy, serviceRouter } from './middleware/proxy.js';
import {
  standardLimiter,
  authLimiter,
  readLimiter,
} from './middleware/rate-limiter.js';
import {
  validateRequestSize,
  validateContentType,
  validateHeaders,
  sanitizeQuery,
  requestLogger,
} from './middleware/request-validator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request processing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request validation and logging
app.use(requestLogger);
app.use(validateRequestSize);
app.use(validateContentType);
app.use(validateHeaders);
app.use(sanitizeQuery);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: SERVICES.map((s) => ({
      name: s.name,
      path: s.path,
      url: s.url,
    })),
  });
});

// Service status endpoint
app.get('/api/status', optionalAuthenticate, (req, res) => {
  res.status(200).json({
    gateway: 'operational',
    services: SERVICES.map((s) => ({
      name: s.name,
      status: 'unknown', // In production, this would check service health
      path: s.path,
    })),
    timestamp: new Date().toISOString(),
  });
});

// Apply different rate limiters based on path
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/refresh', authLimiter);

// Standard rate limiting for other endpoints
app.use(standardLimiter);

// Service routing and proxying
for (const service of SERVICES) {
  const proxy = createServiceProxy(service);

  if (service.requireAuth) {
    // Protected routes require authentication
    app.use(service.path, authenticate, proxy);
  } else {
    // Public routes (e.g., auth endpoints)
    app.use(service.path, proxy);
  }

  console.log(
    `[Gateway] Registered service: ${service.name} at ${service.path} -> ${service.url}`
  );
}

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('[Gateway] Error:', err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`[Gateway] API Gateway listening on port ${PORT}`);
  console.log(`[Gateway] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Gateway] CORS origin: ${CORS_ORIGIN}`);
  console.log(`[Gateway] Registered ${SERVICES.length} services`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Gateway] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Gateway] SIGINT received, shutting down gracefully');
  process.exit(0);
});
