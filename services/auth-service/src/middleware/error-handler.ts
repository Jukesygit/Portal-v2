import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Known application errors
  const knownErrors: Record<string, number> = {
    'User with this email already exists': 409,
    'Invalid email or password': 401,
    'Account is not active': 403,
    'Account not found': 404,
    'User not found': 404,
    'Token expired': 401,
    'Invalid token': 401,
    'Refresh token expired': 401,
    'Invalid refresh token': 401,
  };

  const statusCode = knownErrors[error.message] || 500;

  if (statusCode !== 500) {
    return res.status(statusCode).json({
      error: {
        code: statusCode === 401 ? 'AUTHENTICATION_ERROR' : 'BUSINESS_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Internal server error
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
}
