import type { Request, Response, NextFunction } from 'express';
import type { Permission } from '../utils/permissions.js';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../utils/permissions.js';

/**
 * Authorization middleware - requires specific permission
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Insufficient permissions',
          details: [
            {
              field: 'permission',
              message: `Required permission: ${permission}`,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
}

/**
 * Authorization middleware - requires all specified permissions
 */
export function requireAllPermissions(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (!hasAllPermissions(user.role, permissions)) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Insufficient permissions',
          details: permissions.map((p) => ({
            field: 'permission',
            message: `Required permission: ${p}`,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
}

/**
 * Authorization middleware - requires any of the specified permissions
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (!hasAnyPermission(user.role, permissions)) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Insufficient permissions',
          details: [
            {
              field: 'permissions',
              message: `Required one of: ${permissions.join(', ')}`,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
}

/**
 * Authorization middleware - requires specific role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Insufficient permissions',
          details: [
            {
              field: 'role',
              message: `Required role: ${roles.join(' or ')}`,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
}
