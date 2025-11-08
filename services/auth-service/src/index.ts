import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middleware/error-handler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/auth', authRoutes);

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Auth service listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});

export default app;
