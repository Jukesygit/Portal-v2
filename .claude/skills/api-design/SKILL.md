# API Design Guidelines

**Purpose**: RESTful API design patterns and best practices
**Type**: Technical Knowledge
**Priority**: High
**Auto-Activate**: When working on API endpoints, routes, HTTP

---

## RESTful Principles

### 1. Resource-Based URLs

Use **nouns**, not verbs. Resources are the key abstraction.

```
✅ Good:
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/123
PATCH  /api/v1/projects/123
DELETE /api/v1/projects/123

❌ Bad:
GET    /api/v1/getProjects
POST   /api/v1/createProject
GET    /api/v1/getProjectById?id=123
```

### 2. HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource(s) | Yes | Yes |
| POST | Create new resource | No | No |
| PUT | Replace entire resource | Yes | No |
| PATCH | Update partial resource | No* | No |
| DELETE | Remove resource | Yes | No |

*PATCH can be idempotent depending on implementation

### 3. Status Codes

**Success Codes**:
- `200 OK` - Successful GET, PATCH, DELETE
- `201 Created` - Successful POST (include Location header)
- `204 No Content` - Successful but no response body

**Client Error Codes**:
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity` - Validation errors

**Server Error Codes**:
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Server overloaded or down

---

## URL Structure

### Pattern

```
https://api.example.com/v1/resource/identifier/sub-resource
└─────┬────────────┘ └┬┘ └────┬────┘ └─────┬───┘ └─────┬────┘
      │               │       │            │           │
   Domain          Version  Resource     ID      Sub-resource
```

### Examples

```
GET    /api/v1/projects                      # List projects
GET    /api/v1/projects/123                  # Get project
GET    /api/v1/projects/123/work-orders      # Get work orders for project
POST   /api/v1/projects                      # Create project
PATCH  /api/v1/projects/123                  # Update project
DELETE /api/v1/projects/123                  # Delete project

# Actions (when necessary)
POST   /api/v1/work-orders/123/assign        # Assign work order
POST   /api/v1/projects/123/archive          # Archive project
POST   /api/v1/certifications/123/renew      # Renew certification
```

---

## Request/Response Format

### Request Body (JSON)

```json
POST /api/v1/projects
Content-Type: application/json

{
  "name": "Pipeline Inspection Project",
  "clientId": "client-uuid-here",
  "startDate": "2025-01-15",
  "endDate": "2025-06-30",
  "budget": 125000.00,
  "scope": {
    "description": "Full pipeline inspection",
    "requirements": ["RT", "UT", "VT"]
  }
}
```

### Success Response

```json
HTTP/1.1 201 Created
Location: /api/v1/projects/abc-123-def
Content-Type: application/json

{
  "id": "abc-123-def",
  "organizationId": "org-uuid",
  "name": "Pipeline Inspection Project",
  "projectNumber": "PROJ-2025-001",
  "clientId": "client-uuid-here",
  "status": "planning",
  "startDate": "2025-01-15",
  "endDate": "2025-06-30",
  "budget": 125000.00,
  "actualCost": 0.00,
  "scope": {
    "description": "Full pipeline inspection",
    "requirements": ["RT", "UT", "VT"]
  },
  "createdAt": "2025-11-08T10:30:00Z",
  "updatedAt": "2025-11-08T10:30:00Z",
  "createdBy": "user-uuid"
}
```

### Error Response

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "startDate",
        "message": "Start date must be in the future"
      },
      {
        "field": "clientId",
        "message": "Client ID is required"
      }
    ],
    "timestamp": "2025-11-08T10:30:00Z",
    "requestId": "req_abc123xyz"
  }
}
```

---

## Pagination

### Query Parameters

```
GET /api/v1/projects?page=2&limit=20&sort=-createdAt&status=active
```

### Response Format

```json
{
  "data": [
    { "id": "1", "name": "Project 1" },
    { "id": "2", "name": "Project 2" }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": true
  },
  "links": {
    "first": "/api/v1/projects?page=1&limit=20",
    "prev": "/api/v1/projects?page=1&limit=20",
    "self": "/api/v1/projects?page=2&limit=20",
    "next": "/api/v1/projects?page=3&limit=20",
    "last": "/api/v1/projects?page=8&limit=20"
  }
}
```

### Implementation

```typescript
interface PaginationParams {
  page?: number; // Default: 1
  limit?: number; // Default: 20, Max: 100
  sort?: string; // e.g., "-createdAt" for descending
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  links: {
    first: string;
    prev: string | null;
    self: string;
    next: string | null;
    last: string;
  };
}

function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
  baseUrl: string
): PaginatedResponse<T> {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 20, 100);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
    links: {
      first: `${baseUrl}?page=1&limit=${limit}`,
      prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
      self: `${baseUrl}?page=${page}&limit=${limit}`,
      next: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
    },
  };
}
```

---

## Filtering & Sorting

### Query Parameters

```
# Filter by status
GET /api/v1/projects?status=active

# Multiple filters
GET /api/v1/projects?status=active&clientId=client-123

# Date range
GET /api/v1/inspections?startDate=2025-01-01&endDate=2025-12-31

# Search
GET /api/v1/projects?search=pipeline

# Sort (prefix with - for descending)
GET /api/v1/projects?sort=-createdAt
GET /api/v1/projects?sort=name,createdAt
```

### Implementation

```typescript
interface FilterParams {
  status?: ProjectStatus;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
}

function buildWhereClause(filters: FilterParams) {
  const where: any = {
    deletedAt: null, // Always filter soft-deleted
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.clientId) {
    where.clientId = filters.clientId;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { projectNumber: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

function buildOrderBy(sort?: string) {
  if (!sort) return { createdAt: 'desc' };

  const orderBy: any[] = [];
  const fields = sort.split(',');

  for (const field of fields) {
    const descending = field.startsWith('-');
    const fieldName = descending ? field.substring(1) : field;
    orderBy.push({ [fieldName]: descending ? 'desc' : 'asc' });
  }

  return orderBy;
}
```

---

## Authentication

### JWT Bearer Token

```
GET /api/v1/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Structure

```typescript
interface JWTPayload {
  sub: string; // User ID
  email: string;
  organizationId: string;
  role: 'admin' | 'manager' | 'inspector' | 'viewer';
  permissions: string[];
  iat: number; // Issued at
  exp: number; // Expiration (15 minutes)
}
```

### Refresh Token Flow

```typescript
// 1. Login - Get access token + refresh token
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJ...", // 15 minutes
  "refreshToken": "eyJ...", // 7 days
  "expiresIn": 900
}

// 2. Access protected resource
GET /api/v1/projects
Authorization: Bearer eyJ...

// 3. Access token expires - Use refresh token
POST /api/v1/auth/refresh
{
  "refreshToken": "eyJ..."
}

Response:
{
  "accessToken": "eyJ...", // New 15-minute token
  "expiresIn": 900
}

// 4. Logout - Invalidate tokens
POST /api/v1/auth/logout
{
  "refreshToken": "eyJ..."
}
```

---

## Rate Limiting

### Headers

```
GET /api/v1/projects
Authorization: Bearer eyJ...

Response:
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```

### Rate Limit Exceeded

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699999999
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "timestamp": "2025-11-08T10:30:00Z"
  }
}
```

---

## Versioning

### URL Versioning (Recommended)

```
/api/v1/projects
/api/v2/projects
```

**Pros**:
- Clear and explicit
- Easy to route
- Easy to cache

**Cons**:
- URL changes between versions

### Implementation

```typescript
// app.ts
import v1Routes from './routes/v1';
import v2Routes from './routes/v2';

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);
```

---

## Async Operations (Long-Running Tasks)

### Pattern: Job Queue

For operations that take >5 seconds (report generation, bulk operations):

```typescript
// 1. Client initiates job
POST /api/v1/reports/generate
{
  "projectId": "project-123",
  "templateId": "template-456",
  "format": "pdf"
}

Response:
HTTP/1.1 202 Accepted
Location: /api/v1/reports/jobs/job-789

{
  "jobId": "job-789",
  "status": "pending",
  "createdAt": "2025-11-08T10:30:00Z",
  "estimatedCompletion": "2025-11-08T10:32:00Z"
}

// 2. Client polls job status
GET /api/v1/reports/jobs/job-789

Response:
{
  "jobId": "job-789",
  "status": "processing", // pending, processing, completed, failed
  "progress": 45, // 0-100
  "createdAt": "2025-11-08T10:30:00Z",
  "startedAt": "2025-11-08T10:30:15Z",
  "estimatedCompletion": "2025-11-08T10:32:00Z"
}

// 3. Job completes
GET /api/v1/reports/jobs/job-789

Response:
{
  "jobId": "job-789",
  "status": "completed",
  "progress": 100,
  "result": {
    "reportId": "report-999",
    "downloadUrl": "/api/v1/reports/report-999/download"
  },
  "createdAt": "2025-11-08T10:30:00Z",
  "startedAt": "2025-11-08T10:30:15Z",
  "completedAt": "2025-11-08T10:31:45Z"
}

// 4. Download result
GET /api/v1/reports/report-999/download

Response:
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="report-project-123.pdf"

[PDF binary data]
```

---

## Best Practices

### ✅ DO:

1. **Use nouns for resources**, not verbs
2. **Return appropriate status codes**
3. **Include request ID** in all responses
4. **Paginate list endpoints**
5. **Version your API** (URL versioning)
6. **Use JWT** for authentication
7. **Rate limit** all endpoints
8. **Log all requests** with correlation IDs
9. **Handle errors consistently**
10. **Document with OpenAPI/Swagger**

### ❌ DON'T:

1. **Don't use verbs in URLs**
2. **Don't return raw errors** to client
3. **Don't skip authentication checks**
4. **Don't forget pagination** on lists
5. **Don't use GET for mutations**
6. **Don't expose internal errors**
7. **Don't skip input validation**
8. **Don't return 200 for errors**
9. **Don't hardcode** URLs in responses
10. **Don't forget CORS** configuration

---

## Related Resources

- [REST API Patterns](./resources/rest-api-patterns.md)
- [Authentication Flow Guide](./resources/authentication-flow.md)
- [Error Handling Standards](./resources/error-handling.md)
- [Pagination & Filtering](./resources/pagination-filtering.md)
- [OpenAPI Documentation](./resources/openapi-documentation.md)

---

**Version**: 1.0
**Last Updated**: 2025-11-08
**Status**: Active
