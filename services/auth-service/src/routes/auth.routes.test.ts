import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from './auth.routes';
import { errorHandler } from '../middleware/error-handler';
import { PrismaClient } from '@prisma/client';

// Test app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use(errorHandler);

const prisma = new PrismaClient();

describe('Auth Routes Integration Tests', () => {
  // Test data
  const testUser = {
    email: 'test@example.com',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
    organizationName: 'Test Organization',
  };

  let accessToken: string;
  let refreshToken: string;
  let userId: string;
  let organizationId: string;

  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prisma.userProfile.deleteMany({
        where: {
          user: {
            email: {
              contains: 'test',
            },
          },
        },
      });

      await prisma.user.deleteMany({
        where: {
          email: {
            contains: 'test',
          },
        },
      });

      await prisma.organization.deleteMany({
        where: {
          name: {
            contains: 'Test',
          },
        },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    try {
      await prisma.userProfile.deleteMany({
        where: {
          user: {
            email: testUser.email,
          },
        },
      });

      await prisma.user.deleteMany({
        where: {
          email: testUser.email,
        },
      });

      await prisma.organization.deleteMany({
        where: {
          name: testUser.organizationName,
        },
      });
    } catch (error) {
      // Ignore errors if records don't exist
    }
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');

      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('organizationId');

      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
      expect(response.body.tokens).toHaveProperty('expiresIn');
      expect(response.body.tokens.expiresIn).toBe(900); // 15 minutes

      // Store for later tests
      accessToken = response.body.tokens.accessToken;
      refreshToken = response.body.tokens.refreshToken;
      userId = response.body.user.id;
      organizationId = response.body.user.organizationId;
    });

    it('should return user profile in response', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.user.profile).toBeDefined();
      expect(response.body.user.profile.firstName).toBe(testUser.firstName);
      expect(response.body.user.profile.lastName).toBe(testUser.lastName);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app).post('/auth/register').send(testUser).expect(201);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('already exists');
    });

    it('should reject weak password', async () => {
      const weakPasswordUser = {
        ...testUser,
        password: 'weak',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // Missing other required fields
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid email format', async () => {
      const invalidEmailUser = {
        ...testUser,
        email: 'not-an-email',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidEmailUser)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create organization and link to user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const orgId = response.body.user.organizationId;
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
      });

      expect(org).toBeDefined();
      expect(org?.name).toBe(testUser.organizationName);
    });

    it('should hash password (not store plain text)', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { id: response.body.user.id },
      });

      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe(testUser.password);
      expect(user?.passwordHash.startsWith('$2')).toBe(true); // bcrypt hash
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create user for login tests
      await request(app).post('/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.tokens.accessToken).toBeTruthy();
      expect(response.body.tokens.refreshToken).toBeTruthy();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toContain('Invalid email or password');
    });

    it('should reject non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.error.message).toContain('Invalid email or password');
    });

    it('should reject inactive account', async () => {
      // Get user and mark as inactive
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      await prisma.user.update({
        where: { id: user!.id },
        data: { status: 'inactive' },
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(403);

      expect(response.body.error.message).toContain('not active');
    });

    it('should return user profile in response', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.user.profile).toBeDefined();
      expect(response.body.user.profile.firstName).toBe(testUser.firstName);
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should be case sensitive for password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password.toLowerCase(),
        })
        .expect(401);

      expect(response.body.error.message).toContain('Invalid email or password');
    });
  });

  describe('POST /auth/refresh', () => {
    beforeEach(async () => {
      // Create user and get tokens
      const response = await request(app).post('/auth/register').send(testUser);
      accessToken = response.body.tokens.accessToken;
      refreshToken = response.body.tokens.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');

      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
      expect(response.body.accessToken).not.toBe(accessToken); // New token
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject access token used as refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: accessToken })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should rotate refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const newRefreshToken = response.body.refreshToken;
      expect(newRefreshToken).not.toBe(refreshToken);

      // Old refresh token should still work (unless invalidated by logout)
      // This depends on implementation - some systems invalidate old tokens
    });
  });

  describe('POST /auth/logout', () => {
    beforeEach(async () => {
      const response = await request(app).post('/auth/register').send(testUser);
      refreshToken = response.body.tokens.refreshToken;
    });

    it('should logout successfully with valid refresh token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    it('should invalidate refresh token after logout', async () => {
      // Logout
      await request(app).post('/auth/logout').send({ refreshToken }).expect(200);

      // Try to use the token after logout
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /auth/me', () => {
    beforeEach(async () => {
      const response = await request(app).post('/auth/register').send(testUser);
      accessToken = response.body.tokens.accessToken;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.role).toBe('admin');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('organizationId');
      expect(response.body).toHaveProperty('permissions');
      expect(response.body.profile).toBeDefined();
    });

    it('should include permissions in response', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body.permissions)).toBe(true);
      expect(response.body.permissions.length).toBeGreaterThan(0);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/auth/me').expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toContain('No authorization header');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.error.message).toContain('Invalid authorization header format');
    });

    it('should reject token without Bearer prefix', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', accessToken)
        .expect(401);

      expect(response.body.error.message).toContain('Invalid authorization header format');
    });

    it('should reject refresh token used as access token', async () => {
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          ...testUser,
          email: 'another@example.com',
        });

      const refreshToken = registerResponse.body.tokens.refreshToken;

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should return consistent error format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrong',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('timestamp');
    });

    it('should include details for validation errors', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'weak',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
      expect(Array.isArray(response.body.error.details)).toBe(true);
    });

    it('should not leak sensitive information in errors', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);

      // Should use generic message, not reveal if email exists
      expect(response.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('Full authentication flow', () => {
    it('should complete register -> login -> refresh -> me -> logout flow', async () => {
      // 1. Register
      const registerRes = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const regTokens = registerRes.body.tokens;

      // 2. Login
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const loginTokens = loginRes.body.tokens;

      // 3. Get current user
      const meRes = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginTokens.accessToken}`)
        .expect(200);

      expect(meRes.body.email).toBe(testUser.email);

      // 4. Refresh token
      const refreshRes = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: loginTokens.refreshToken })
        .expect(200);

      const newAccessToken = refreshRes.body.accessToken;

      // 5. Use new access token
      await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // 6. Logout
      await request(app)
        .post('/auth/logout')
        .send({ refreshToken: refreshRes.body.refreshToken })
        .expect(200);

      // 7. Verify token is invalidated
      await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: refreshRes.body.refreshToken })
        .expect(401);
    });
  });
});
