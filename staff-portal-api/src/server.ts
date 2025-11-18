import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { AppError, createErrorResponse } from './utils/errors.js';
import { generalRateLimiter } from './middleware/rateLimit.middleware.js';
import { requestLogger, errorLogger } from './middleware/logger.middleware.js';
import authRoutes from './routes/auth.routes.js';
import staffRoutes from './routes/staff.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import appointmentsSSE from './routes/appointments.sse.js';
import donorsRoutes from './routes/donors.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5175',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(generalRateLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/staff', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/staff', appointmentsRoutes);
app.use('/api/staff', appointmentsSSE);
app.use('/api/staff', donorsRoutes);
app.use('/api/staff', analyticsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      statusCode: 404,
    },
  });
});

// Error handling middleware
app.use(errorLogger);
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  const errorResponse = createErrorResponse(err);
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json(errorResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;

