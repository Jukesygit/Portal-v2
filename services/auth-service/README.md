# Authentication Service

Enterprise-grade authentication and authorization service for the NDT Suite platform.

## Features

- **JWT-based authentication** with access and refresh tokens
- **Role-Based Access Control (RBAC)** with granular permissions
- **Multi-tenant architecture** with organization-level isolation
- **Secure password handling** with bcrypt (12 rounds)
- **Token refresh mechanism** for seamless user experience
- **Comprehensive middleware** for authentication and authorization

## Technology Stack

- Node.js 20+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- bcrypt
- jsonwebtoken

## Authentication Flow

```
┌─────────┐                ┌──────────────┐                ┌──────────┐
│ Client  │                │ Auth Service │                │ Database │
└────┬────┘                └──────┬───────┘                └────┬─────┘
     │                            │                             │
     │  POST /auth/register       │                             │
     ├───────────────────────────>│                             │
     │                            │  Create org + user + profile│
     │                            ├────────────────────────────>│
     │                            │                             │
     │                            │<────────────────────────────┤
     │  { accessToken, refresh }  │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │  POST /auth/login          │                             │
     ├───────────────────────────>│                             │
     │                            │  Verify credentials         │
     │                            ├────────────────────────────>│
     │                            │                             │
     │  { accessToken, refresh }  │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │  GET /protected (Bearer)   │                             │
     ├───────────────────────────>│                             │
     │                            │  Verify JWT                 │
     │                            │  Check permissions          │
     │                            │                             │
     │  { data }                  │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │  Access token expires      │                             │
     │                            │                             │
     │  POST /auth/refresh        │                             │
     ├───────────────────────────>│                             │
     │                            │  Verify refresh token       │
     │                            ├────────────────────────────>│
     │                            │                             │
     │  { accessToken, refresh }  │                             │
     │<───────────────────────────┤                             │
```

## API Endpoints

### POST /auth/register

Register a new user and organization.

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "ACME NDT Services"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "role": "admin",
    "organizationId": "uuid",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

**Errors:**
- `409 Conflict` - User with email already exists
- `400 Bad Request` - Invalid request data or weak password

### POST /auth/login

Authenticate with email and password.

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "role": "admin",
    "organizationId": "uuid",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid email or password
- `403 Forbidden` - Account is not active

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired refresh token

### POST /auth/logout

Invalidate refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "admin@company.com",
  "role": "admin",
  "organizationId": "uuid",
  "permissions": ["project:create", "project:read", ...],
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "certifications": []
  }
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

### GET /health

Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Permission System

### Roles

- **admin** - Full system access (all permissions)
- **manager** - Project and team management
- **inspector** - Perform inspections and create reports
- **viewer** - Read-only access

### Permission Matrix

| Permission | Admin | Manager | Inspector | Viewer |
|------------|-------|---------|-----------|--------|
| project:create | ✅ | ✅ | ❌ | ❌ |
| project:read | ✅ | ✅ | ✅ | ✅ |
| project:update | ✅ | ✅ | ❌ | ❌ |
| project:delete | ✅ | ✅ | ❌ | ❌ |
| inspection:create | ✅ | ✅ | ✅ | ❌ |
| inspection:read | ✅ | ✅ | ✅ | ✅ |
| inspection:update | ✅ | ✅ | ✅ | ❌ |
| inspection:delete | ✅ | ✅ | ❌ | ❌ |
| user:create | ✅ | ✅ | ❌ | ❌ |
| user:read | ✅ | ✅ | ✅ | ✅ |
| user:update | ✅ | ✅ | ❌ | ❌ |
| user:delete | ✅ | ❌ | ❌ | ❌ |
| settings:manage | ✅ | ❌ | ❌ | ❌ |

See `src/utils/permissions.ts` for complete permission list (40+ permissions).

## Middleware Usage

### Authentication

```typescript
import { authenticate } from './middleware/authenticate';

// Protect route - requires valid JWT
router.get('/projects', authenticate, projectController.list);

// Optional authentication
import { optionalAuthenticate } from './middleware/authenticate';
router.get('/public', optionalAuthenticate, publicController.list);
```

### Authorization

```typescript
import { requirePermission, requireRole } from './middleware/authorize';
import { Permissions } from './utils/permissions';

// Require specific permission
router.post('/projects',
  authenticate,
  requirePermission(Permissions.PROJECT_CREATE),
  projectController.create
);

// Require multiple permissions (all)
import { requireAllPermissions } from './middleware/authorize';
router.delete('/projects/:id',
  authenticate,
  requireAllPermissions([
    Permissions.PROJECT_DELETE,
    Permissions.PROJECT_UPDATE
  ]),
  projectController.delete
);

// Require any of multiple permissions
import { requireAnyPermission } from './middleware/authorize';
router.get('/reports',
  authenticate,
  requireAnyPermission([
    Permissions.REPORT_READ,
    Permissions.REPORT_EXPORT
  ]),
  reportController.list
);

// Require specific role
router.get('/admin/settings',
  authenticate,
  requireRole('admin'),
  adminController.settings
);
```

## Environment Variables

Create a `.env` file in the service directory:

```env
# Server
PORT=4001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ndt_suite

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

**Security Notes:**
- Generate strong random secrets for production (min 32 characters)
- Use different secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Never commit `.env` to version control
- Rotate secrets regularly in production

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

Passwords are hashed using bcrypt with 12 salt rounds.

## Token Lifetimes

- **Access Token**: 15 minutes (short-lived for security)
- **Refresh Token**: 7 days (long-lived for convenience)

When an access token expires, clients should use the refresh token to obtain a new access token without requiring re-authentication.

## Development

### Install Dependencies

```bash
npm install
```

### Run Database Migrations

```bash
npx prisma migrate dev
```

### Start Development Server

```bash
npm run dev
```

The service will start on `http://localhost:4001`.

### Run Tests

```bash
# Unit tests
npm test

# Test coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Codes

- `VALIDATION_ERROR` (400) - Invalid request data
- `AUTHENTICATION_ERROR` (401) - Missing or invalid credentials/token
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `BUSINESS_ERROR` (409) - Business logic violation (e.g., duplicate email)
- `INTERNAL_ERROR` (500) - Unexpected server error

## Security Considerations

1. **Token Storage**: Store access tokens in memory or sessionStorage (never localStorage for sensitive apps). Store refresh tokens in httpOnly cookies when possible.

2. **HTTPS Only**: Always use HTTPS in production to prevent token interception.

3. **Token Rotation**: Refresh tokens are rotated on each refresh to limit exposure if compromised.

4. **Password Hashing**: bcrypt with 12 rounds provides strong protection against brute-force attacks.

5. **CORS**: Configure CORS_ORIGIN to allow only trusted frontend domains.

6. **Rate Limiting**: Implement rate limiting on login and registration endpoints (recommended: max 5 attempts per 15 minutes).

7. **SQL Injection**: Prisma ORM provides automatic protection against SQL injection.

8. **XSS Protection**: helmet middleware adds security headers including XSS protection.

## Architecture

```
src/
├── controllers/       # HTTP request handlers
│   └── auth.controller.ts
├── middleware/        # Express middleware
│   ├── authenticate.ts
│   ├── authorize.ts
│   └── error-handler.ts
├── routes/            # API route definitions
│   └── auth.routes.ts
├── services/          # Business logic
│   └── auth.service.ts
├── utils/             # Utility functions
│   ├── jwt.ts
│   ├── password.ts
│   └── permissions.ts
└── index.ts           # Express app setup
```

## Integration with Other Services

Other microservices can validate JWTs independently using the shared JWT_SECRET:

```typescript
import { verifyAccessToken } from '@ndt-suite/shared-types';

// In your service middleware
const token = req.headers.authorization?.split(' ')[1];
const payload = verifyAccessToken(token);
// payload contains: { sub, email, organizationId, role, permissions }
```

## Monitoring

Key metrics to monitor:
- Authentication success/failure rates
- Token refresh frequency
- Average response times per endpoint
- Error rates by type
- Active sessions count

## License

Proprietary - ACME NDT Services
