import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const authController = new AuthController();

/**
 * POST /auth/register
 * Register a new user and organization
 */
router.post('/register', authController.register.bind(authController));

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', authController.login.bind(authController));

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', authController.refresh.bind(authController));

/**
 * POST /auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/logout', authController.logout.bind(authController));

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
