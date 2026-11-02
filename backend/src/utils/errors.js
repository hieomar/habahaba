export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details = null) {
    super(message, 400, 'VAL_INVALID_INPUT', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details = null) {
    super(message, 401, 'AUTH_UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions', details = null) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}
