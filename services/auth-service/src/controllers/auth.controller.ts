import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from '@ndt-suite/shared-types';

const authService = new AuthService();

export class AuthController {
  /**
   * POST /auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const data = registerSchema.parse(req.body);

      // Register user
      const tokens = await authService.register(data);

      // Return tokens
      res.status(201).json({
        data: tokens,
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const credentials = loginSchema.parse(req.body);

      // Login user
      const tokens = await authService.login(credentials);

      // Return tokens
      res.status(200).json({
        data: tokens,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      // Refresh tokens
      const tokens = await authService.refresh(refreshToken);

      // Return new tokens
      res.status(200).json({
        data: tokens,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      // Logout user
      await authService.logout(refreshToken);

      // Return success
      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Get current user (requires authentication)
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          },
        });
      }

      // Get current user
      const user = await authService.getCurrentUser(userId);

      // Return user
      res.status(200).json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
