import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Project Service] Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      res.status(409).json({
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'A record with this value already exists',
          details: err.meta?.target
            ? [
                {
                  field: (err.meta.target as string[])[0],
                  message: 'This value is already in use',
                },
              ]
            : [],
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Record not found
    if (err.code === 'P2025') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Foreign key constraint violation
    if (err.code === 'P2003') {
      res.status(400).json({
        error: {
          code: 'INVALID_REFERENCE',
          message: 'Referenced record does not exist',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
  }

  // Default error response
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    error: {
      code: (err as any).code || 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
      timestamp: new Date().toISOString(),
    },
  });
}
