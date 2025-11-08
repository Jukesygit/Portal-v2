import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import type { JWTPayload } from '@ndt-suite/shared-types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'No authorization header provided',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid authorization header format. Expected: Bearer <token>',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const token = parts[1];

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';

    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if missing
 */
export function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch {
    // Silently fail for optional auth
    next();
  }
}
