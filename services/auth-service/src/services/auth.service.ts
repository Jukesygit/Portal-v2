import { PrismaClient } from '@prisma/client';
import type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  UserWithProfile,
} from '@ndt-suite/shared-types';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiresIn,
} from '../utils/jwt.js';
import { getPermissionsForRole } from '../utils/permissions.js';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Register a new user and organization
   */
  async register(data: RegisterData): Promise<AuthTokens> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          subscriptionTier: 'free',
        },
      });

      // Create user (first user is admin)
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: 'admin', // First user is always admin
          status: 'active',
          organizationId: organization.id,
        },
      });

      // Create user profile
      await tx.userProfile.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      return { user, organization };
    });

    // Generate tokens
    const permissions = getPermissionsForRole(result.user.role as 'admin');

    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.user.organizationId,
      role: result.user.role,
      permissions,
    });

    const refreshToken = generateRefreshToken(result.user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: getTokenExpiresIn(),
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Check if user is deleted
    if (user.deletedAt) {
      throw new Error('Account not found');
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      credentials.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const permissions = getPermissionsForRole(user.role as any);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
      permissions,
    });

    const refreshToken = generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: getTokenExpiresIn(),
    };
  }

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Check if user is deleted
    if (user.deletedAt) {
      throw new Error('Account not found');
    }

    // Generate new tokens
    const permissions = getPermissionsForRole(user.role as any);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
      permissions,
    });

    const newRefreshToken = generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: getTokenExpiresIn(),
    };
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<UserWithProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.deletedAt) {
      throw new Error('User not found');
    }

    return user as any;
  }

  /**
   * Logout (invalidate refresh token)
   * In a production system, you would store invalidated tokens in Redis
   */
  async logout(refreshToken: string): Promise<void> {
    // Verify token exists
    verifyRefreshToken(refreshToken);

    // In production: Add to Redis blacklist
    // await redis.set(`blacklist:${refreshToken}`, '1', 'EX', 7 * 24 * 60 * 60);
  }
}
