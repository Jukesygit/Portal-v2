# API Gateway

Central API gateway for the NDT Suite microservices architecture. Provides unified entry point, request routing, rate limiting, authentication, and security features.

## Features

- **Request Routing**: Intelligent routing to microservices based on URL paths
- **Rate Limiting**: Prevents abuse with configurable rate limits
- **Authentication**: JWT token validation and user context forwarding
- **Request Validation**: Input sanitization and validation
- **Security Headers**: Helmet integration for HTTP security
- **CORS**: Configurable cross-origin resource sharing
- **Health Checks**: Service health monitoring
- **Error Handling**: Consistent error responses
- **Logging**: Request/response logging for debugging

## Architecture

```
┌─────────┐          ┌──────────────┐          ┌────────────────┐
│  Client │  ──────> │ API Gateway  │  ──────> │ Auth Service   │
└─────────┘          │   (Port 4000)│          │   (Port 4001)  │
                     │              │          └────────────────┘
                     │              │
                     │              │          ┌────────────────┐
                     │  - Routing   │  ──────> │ Project Service│
                     │  - Auth      │          │   (Port 4002)  │
                     │  - Rate Limit│          └────────────────┘
                     │  - Validation│
                     │  - Security  │          ┌────────────────┐
                     └──────────────┘  ──────> │ Other Services │
                                                └────────────────┘
```

## Service Routes

The gateway routes requests to backend services based on path prefixes:

| Path Prefix | Service | Port | Auth Required |
|-------------|---------|------|---------------|
| `/api/auth` | Auth Service | 4001 | No |
| `/api/projects` | Project Service | 4002 | Yes |
| `/api/inspections` | Inspection Service | 4003 | Yes |

## Technology Stack

- **Express.js**: Web framework
- **http-proxy-middleware**: Service proxying
- **express-rate-limit**: Rate limiting
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **jsonwebtoken**: JWT validation

## Environment Variables

```env
# Server
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Service URLs
AUTH_SERVICE_URL=http://localhost:4001
PROJECT_SERVICE_URL=http://localhost:4002
INSPECTION_SERVICE_URL=http://localhost:4003

# JWT (for token validation)
JWT_SECRET=your-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # Max requests per window
```

## Rate Limiting

The gateway implements three tiers of rate limiting:

### 1. Auth Limiter (Strict)
Applied to authentication endpoints to prevent brute force attacks:
- **Window**: 15 minutes
- **Max Requests**: 5
- **Endpoints**: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`

### 2. Standard Limiter
Applied to most API endpoints:
- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 (configurable)
- **Key**: User ID (if authenticated) or IP address

### 3. Read Limiter
More lenient limit for read-only operations:
- **Window**: 15 minutes
- **Max Requests**: 200 (2x standard)

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

Headers included in response:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests in window
- `RateLimit-Reset`: Timestamp when limit resets

## Request Flow

### 1. Incoming Request
```
POST /api/projects
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

### 2. Gateway Processing
1. Security headers added (Helmet)
2. CORS validation
3. Request size validation (<10MB)
4. Content-Type validation
5. Header sanitization
6. Query parameter sanitization
7. Rate limiting check
8. JWT token validation (if required)
9. Route matching

### 3. Service Proxying
Gateway forwards request to backend service with additional headers:

```
POST /projects
Authorization: Bearer eyJhbGc...
X-User-Id: 123e4567-e89b-12d3-a456-426614174000
X-User-Email: user@example.com
X-User-Role: admin
X-Organization-Id: 123e4567-e89b-12d3-a456-426614174001
X-User-Permissions: ["project:create", "project:read", ...]
```

### 4. Response
Backend response is forwarded to client with appropriate headers.

## Authentication

### Public Routes (No Auth Required)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /health`
- `GET /api/status`

### Protected Routes (Auth Required)
All other routes require valid JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Validation

The gateway validates JWT tokens and:
- Verifies signature using `JWT_SECRET`
- Checks expiration
- Extracts user information
- Forwards user context to backend services via headers

### Error Responses

**Missing Token:**
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "No authorization header provided",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Invalid Token:**
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid access token",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expired Token:**
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Request Validation

### Size Limits
- **Maximum Request Size**: 10MB
- **Body Parsers**: JSON and URL-encoded

### Content-Type Validation
POST/PUT/PATCH requests must have valid Content-Type:
- `application/json`
- `multipart/form-data` (for file uploads)

### Header Sanitization
Potentially malicious headers are removed:
- `x-forwarded-host`
- `x-original-url`
- `x-rewrite-url`

### Query Sanitization
Query parameters are sanitized to prevent XSS:
- HTML tags removed
- Script tags stripped
- Whitespace trimmed

## Health Monitoring

### Gateway Health
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "api-gateway",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": [
    {
      "name": "auth-service",
      "path": "/api/auth",
      "url": "http://localhost:4001"
    },
    {
      "name": "project-service",
      "path": "/api/projects",
      "url": "http://localhost:4002"
    }
  ]
}
```

### Service Status
```bash
GET /api/status
```

Response:
```json
{
  "gateway": "operational",
  "services": [
    {
      "name": "auth-service",
      "status": "unknown",
      "path": "/api/auth"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Handling

### Service Unavailable
When a backend service is unreachable:

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "auth-service is currently unavailable",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Not Found
When no route matches the request:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found",
    "path": "/api/unknown",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Internal Error
Unexpected errors:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

The gateway will start on `http://localhost:4000`.

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Production

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Set production values for:
   - `JWT_SECRET`: Strong random secret (32+ chars)
   - `CORS_ORIGIN`: Production frontend URL
   - Service URLs: Production service endpoints
3. Set `NODE_ENV=production`

## Security Considerations

1. **JWT Secret**: Use strong, randomly generated secrets in production
2. **CORS**: Configure `CORS_ORIGIN` to allow only trusted domains
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Adjust limits based on expected traffic
5. **Logging**: Monitor logs for suspicious activity
6. **Headers**: Helmet provides security headers by default

## Monitoring

Key metrics to monitor:
- Request rate and latency
- Error rates by service
- Rate limit violations
- Authentication failures
- Service availability

## Adding New Services

To add a new backend service:

1. **Update `src/config/services.ts`:**
```typescript
{
  name: 'new-service',
  url: process.env.NEW_SERVICE_URL || 'http://localhost:4004',
  path: '/api/new-service',
  stripPath: true,
  requireAuth: true,
}
```

2. **Add environment variable to `.env`:**
```env
NEW_SERVICE_URL=http://localhost:4004
```

3. **Restart gateway**

The service will be automatically registered and routed.

## Troubleshooting

### Gateway won't start
- Check port 4000 is not in use
- Verify environment variables are set
- Check backend services are configured

### Service connection errors
- Verify backend service URLs are correct
- Check backend services are running
- Review firewall/network configuration

### Authentication failures
- Verify `JWT_SECRET` matches auth service
- Check token expiration
- Review Authorization header format

### Rate limiting issues
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed
- Check if using correct identifier (user ID vs IP)
- Review rate limit windows

## License

Proprietary - ACME NDT Services
