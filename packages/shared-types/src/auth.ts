import { z } from 'zod';
import type { UserRole } from './user';

// JWT Payload
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  organizationId: string;
  role: UserRole;
  permissions: string[];
  iat: number; // Issued at
  exp: number; // Expiration
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

// Login credentials
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Register data
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationName: z.string().min(1),
});

export type RegisterData = z.infer<typeof registerSchema>;

// Password reset
export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

export const confirmPasswordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export type ConfirmPasswordReset = z.infer<typeof confirmPasswordResetSchema>;

// Refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
