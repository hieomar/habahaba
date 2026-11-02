import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(message, statusCode, 'INTERNAL_SERVER_ERROR', err.stack);
  }

  logger.error(`[${req.method}] ${req.originalUrl} - ${error.message}`, {
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    stack: error.stack,
  });

  return sendError(
    res,
    error.message,
    error.statusCode,
    error.errorCode,
    env.NODE_ENV === 'development' ? error.details || error.stack : error.details
  );
};
