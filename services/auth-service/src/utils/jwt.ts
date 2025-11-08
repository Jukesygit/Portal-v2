import jwt from 'jsonwebtoken';
import type { JWTPayload } from '@ndt-suite/shared-types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
  permissions: string[];
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: TokenPayload): string {
  const jwtPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
    sub: payload.userId,
    email: payload.email,
    organizationId: payload.organizationId,
    role: payload.role as JWTPayload['role'],
    permissions: payload.permissions,
  };

  return jwt.sign(jwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { sub: string } {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiresIn(): number {
  const expiresIn = JWT_EXPIRES_IN;

  // Parse duration string (e.g., "15m", "1h", "7d")
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case 's':
      return num;
    case 'm':
      return num * 60;
    case 'h':
      return num * 3600;
    case 'd':
      return num * 86400;
    default:
      return 900;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
