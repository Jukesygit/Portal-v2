import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '@ndt-suite/shared-types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'No authorization header provided',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid authorization header format. Expected: Bearer <token>',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const token = parts[1];

    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = payload;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Access token has expired',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid access token',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];

      try {
        const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.user = payload;
      } catch {
        // Ignore errors for optional authentication
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional authentication
    next();
  }
}
