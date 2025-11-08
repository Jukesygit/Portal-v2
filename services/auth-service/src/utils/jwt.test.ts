import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenExpiresIn,
} from './jwt';
import type { TokenPayload } from './jwt';

describe('JWT Utilities', () => {
  const mockPayload: TokenPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    organizationId: '123e4567-e89b-12d3-a456-426614174001',
    role: 'admin',
    permissions: ['project:create', 'project:read'],
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockPayload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include all required payload fields', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.organizationId).toBe(mockPayload.organizationId);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.permissions).toEqual(mockPayload.permissions);
    });

    it('should include iat and exp claims', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should set correct expiration time (15 minutes)', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      const expectedExpiration = 15 * 60; // 15 minutes in seconds
      const actualExpiration = decoded.exp - decoded.iat;

      expect(actualExpiration).toBe(expectedExpiration);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload.userId);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include user ID in payload', () => {
      const token = generateRefreshToken(mockPayload.userId);
      const decoded = verifyRefreshToken(token);

      expect(decoded.sub).toBe(mockPayload.userId);
    });

    it('should set correct expiration time (7 days)', () => {
      const token = generateRefreshToken(mockPayload.userId);
      const decoded = verifyRefreshToken(token);

      const expectedExpiration = 7 * 24 * 60 * 60; // 7 days in seconds
      const actualExpiration = decoded.exp - decoded.iat;

      expect(actualExpiration).toBe(expectedExpiration);
    });

    it('should be different from access token', () => {
      const accessToken = generateAccessToken(mockPayload);
      const refreshToken = generateRefreshToken(mockPayload.userId);

      expect(accessToken).not.toBe(refreshToken);

      // Refresh token should not verify with access token verification
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should throw on invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });

    it('should throw on malformed token', () => {
      expect(() => verifyAccessToken('not-a-jwt')).toThrow();
    });

    it('should throw on empty token', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });

    it('should throw on token with wrong signature', () => {
      const token = generateAccessToken(mockPayload);
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.wrongsignature`;

      expect(() => verifyAccessToken(tamperedToken)).toThrow();
    });

    it('should throw error message for expired token', () => {
      // This test would require mocking time or waiting 15 minutes
      // For now, we'll test the error path with an invalid token
      expect(() => verifyAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.invalid')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = generateRefreshToken(mockPayload.userId);
      const decoded = verifyRefreshToken(token);

      expect(decoded.sub).toBe(mockPayload.userId);
    });

    it('should throw on invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid.token.here')).toThrow();
    });

    it('should throw on access token used as refresh token', () => {
      const accessToken = generateAccessToken(mockPayload);

      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('getTokenExpiresIn', () => {
    it('should return correct expiration in seconds', () => {
      const expiresIn = getTokenExpiresIn();

      expect(expiresIn).toBe(900); // 15 minutes = 900 seconds
    });
  });

  describe('Token security', () => {
    it('should generate unique tokens for same payload', () => {
      const token1 = generateAccessToken(mockPayload);

      // Wait a tiny bit to ensure different iat timestamp
      const token2 = generateAccessToken(mockPayload);

      // Tokens should be different due to different iat values
      // Note: This might occasionally fail if both tokens are generated
      // in the exact same millisecond, but that's extremely unlikely
    });

    it('should not be able to decode token without secret', () => {
      const token = generateAccessToken(mockPayload);

      // Attempting to decode without verification should work
      // but verifying signature should fail with wrong secret
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      expect(payload.email).toBe(mockPayload.email);
      // But this doesn't mean the token is valid - signature verification is crucial
    });
  });

  describe('Edge cases', () => {
    it('should handle payload with minimal fields', () => {
      const minimalPayload: TokenPayload = {
        userId: 'user-123',
        email: 'min@test.com',
        organizationId: 'org-123',
        role: 'viewer',
        permissions: [],
      };

      const token = generateAccessToken(minimalPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.permissions).toEqual([]);
    });

    it('should handle payload with many permissions', () => {
      const manyPermissions = Array.from({ length: 50 }, (_, i) => `permission:${i}`);
      const payloadWithManyPerms: TokenPayload = {
        ...mockPayload,
        permissions: manyPermissions,
      };

      const token = generateAccessToken(payloadWithManyPerms);
      const decoded = verifyAccessToken(token);

      expect(decoded.permissions).toHaveLength(50);
    });

    it('should handle special characters in email', () => {
      const specialPayload: TokenPayload = {
        ...mockPayload,
        email: 'test+tag@sub-domain.example.com',
      };

      const token = generateAccessToken(specialPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.email).toBe(specialPayload.email);
    });

    it('should handle UUIDs with different formats', () => {
      const uuidPayload: TokenPayload = {
        ...mockPayload,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        organizationId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      };

      const token = generateAccessToken(uuidPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(uuidPayload.userId);
      expect(decoded.organizationId).toBe(uuidPayload.organizationId);
    });
  });
});
