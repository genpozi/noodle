/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized access error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden access error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string>,
  ) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit exceeded error (429)
 */
export class RateLimitError extends AppError {
  constructor(
    message = 'Too many requests',
    public retryAfter?: number,
  ) {
    super('RATE_LIMIT_EXCEEDED', message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Internal server error (500)
 */
export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500);
    this.name = 'InternalError';
  }
}
