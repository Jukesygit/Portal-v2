import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import projectRoutes from './routes/project.routes.js';
import workOrderRoutes from './routes/work-order.routes.js';
import clientRoutes from './routes/client.routes.js';
import { errorHandler } from './middleware/error-handler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4000';

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'project-service',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/projects', projectRoutes);
app.use('/work-orders', workOrderRoutes);
app.use('/clients', clientRoutes);

// 404 handler
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
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[Project Service] Listening on port ${PORT}`);
  console.log(`[Project Service] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Project Service] CORS origin: ${CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Project Service] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Project Service] SIGINT received, shutting down gracefully');
  process.exit(0);
});
