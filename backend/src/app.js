import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { sendSuccess } from './utils/response.js';
import { NotFoundError } from './utils/errors.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';
import apiRouter from './routes/index.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Compression & Body Parsers
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
app.use(globalRateLimiter);

// HTTP Logging
const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }, 'GTMS Backend API is operational');
});

// API Routes
app.use('/api/v1', apiRouter);

// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
