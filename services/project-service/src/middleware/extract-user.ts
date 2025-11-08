import type { Request, Response, NextFunction } from 'express';

export interface UserContext {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
  permissions: string[];
}

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

/**
 * Extract user information from headers set by API Gateway
 * The gateway forwards authenticated user info via custom headers
 */
export function extractUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const userId = req.headers['x-user-id'] as string;
    const email = req.headers['x-user-email'] as string;
    const role = req.headers['x-user-role'] as string;
    const organizationId = req.headers['x-organization-id'] as string;
    const permissionsHeader = req.headers['x-user-permissions'] as string;

    if (!userId || !organizationId) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'User information missing from request',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    let permissions: string[] = [];
    if (permissionsHeader) {
      try {
        permissions = JSON.parse(permissionsHeader);
      } catch {
        console.warn('Failed to parse permissions header');
      }
    }

    req.user = {
      userId,
      email: email || '',
      role: role || 'viewer',
      organizationId,
      permissions,
    };

    next();
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to extract user information',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * Check if user has required permission
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({
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
      return;
    }

    next();
  };
}
