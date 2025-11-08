# Project Service

Microservice for managing projects, work orders, and clients in the NDT Suite platform.

## Features

- **Project Management**: Create, read, update, delete projects with multi-tenant isolation
- **Work Order Management**: Manage work orders within projects
- **Client Management**: Maintain client database with contact information
- **Statistics**: Project, work order, and client analytics
- **Permission-Based Access**: Fine-grained RBAC integration
- **Soft Deletes**: Recoverable deletion with audit trail
- **Validation**: Comprehensive input validation with Zod
- **Multi-Tenancy**: Organization-level data isolation

## Architecture

```
┌──────────────┐
│ API Gateway  │
│  (Port 4000) │
└──────┬───────┘
       │
       │ HTTP + User Headers
       ▼
┌──────────────────────────────────────┐
│       Project Service (Port 4002)    │
├──────────────────────────────────────┤
│  Middleware                          │
│  - Extract User Context              │
│  - Permission Validation             │
│  - Error Handling                    │
├──────────────────────────────────────┤
│  Routes                              │
│  - /projects                         │
│  - /work-orders                      │
│  - /clients                          │
├──────────────────────────────────────┤
│  Controllers                         │
│  - Request validation (Zod)          │
│  - Response formatting               │
├──────────────────────────────────────┤
│  Services                            │
│  - Business logic                    │
│  - Data validation                   │
│  - Authorization checks              │
├──────────────────────────────────────┤
│  Prisma ORM                          │
└───────────┬──────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │  PostgreSQL   │
    └───────────────┘
```

## API Endpoints

### Projects

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/projects` | List projects | `project:read` |
| GET | `/projects/:id` | Get project details | `project:read` |
| POST | `/projects` | Create new project | `project:create` |
| PATCH | `/projects/:id` | Update project | `project:update` |
| DELETE | `/projects/:id` | Delete project (soft) | `project:delete` |
| GET | `/projects/stats` | Get project statistics | `project:read` |

### Work Orders

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/work-orders` | List work orders | `workorder:read` |
| GET | `/work-orders/:id` | Get work order details | `workorder:read` |
| POST | `/work-orders` | Create new work order | `workorder:create` |
| PATCH | `/work-orders/:id` | Update work order | `workorder:update` |
| DELETE | `/work-orders/:id` | Delete work order (soft) | `workorder:delete` |
| GET | `/work-orders/stats` | Get work order statistics | `workorder:read` |

### Clients

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/clients` | List clients | `client:read` |
| GET | `/clients/:id` | Get client details | `client:read` |
| POST | `/clients` | Create new client | `client:create` |
| PATCH | `/clients/:id` | Update client | `client:update` |
| DELETE | `/clients/:id` | Delete client (soft) | `client:delete` |
| GET | `/clients/stats` | Get client statistics | `client:read` |

## Request/Response Examples

### Create Project

**Request:**
```http
POST /projects
Content-Type: application/json

{
  "projectNumber": "PRJ-2024-001",
  "name": "Pipeline Inspection - Main Street",
  "description": "NDT inspection for new pipeline installation",
  "clientId": "123e4567-e89b-12d3-a456-426614174000",
  "startDate": "2024-01-15",
  "targetEndDate": "2024-02-15",
  "status": "planning",
  "priority": "high"
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "organizationId": "123e4567-e89b-12d3-a456-426614174002",
  "projectNumber": "PRJ-2024-001",
  "name": "Pipeline Inspection - Main Street",
  "description": "NDT inspection for new pipeline installation",
  "clientId": "123e4567-e89b-12d3-a456-426614174000",
  "startDate": "2024-01-15T00:00:00.000Z",
  "targetEndDate": "2024-02-15T00:00:00.000Z",
  "actualEndDate": null,
  "status": "planning",
  "priority": "high",
  "settings": {},
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z",
  "createdBy": "user-id",
  "updatedBy": "user-id",
  "deletedAt": null,
  "client": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "ACME Corporation",
    "contactPerson": "John Doe"
  },
  "_count": {
    "workOrders": 0
  }
}
```

### List Projects

**Request:**
```http
GET /projects?status=in_progress&page=1&limit=20&search=pipeline
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "...",
      "projectNumber": "PRJ-2024-001",
      "name": "Pipeline Inspection - Main Street",
      "status": "in_progress",
      "priority": "high",
      "startDate": "2024-01-15T00:00:00.000Z",
      "targetEndDate": "2024-02-15T00:00:00.000Z",
      "client": {
        "id": "...",
        "name": "ACME Corporation",
        "contactPerson": "John Doe"
      },
      "_count": {
        "workOrders": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Create Work Order

**Request:**
```http
POST /work-orders
Content-Type: application/json

{
  "woNumber": "WO-2024-001",
  "projectId": "123e4567-e89b-12d3-a456-426614174001",
  "description": "Ultrasonic testing of weld joints",
  "startDate": "2024-01-16",
  "targetEndDate": "2024-01-20",
  "status": "pending",
  "priority": "high",
  "assignedTo": "inspector-user-id"
}
```

**Response (201):**
```json
{
  "id": "...",
  "woNumber": "WO-2024-001",
  "projectId": "...",
  "description": "Ultrasonic testing of weld joints",
  "startDate": "2024-01-16T00:00:00.000Z",
  "targetEndDate": "2024-01-20T00:00:00.000Z",
  "actualEndDate": null,
  "status": "pending",
  "priority": "high",
  "assignedTo": "inspector-user-id",
  "project": {
    "id": "...",
    "projectNumber": "PRJ-2024-001",
    "name": "Pipeline Inspection - Main Street"
  },
  "assignedToUser": {
    "id": "inspector-user-id",
    "email": "inspector@example.com",
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
}
```

### Create Client

**Request:**
```http
POST /clients
Content-Type: application/json

{
  "name": "ACME Corporation",
  "contactPerson": "John Doe",
  "email": "john.doe@acme.com",
  "phone": "+1-555-0100",
  "address": "123 Main Street",
  "city": "Houston",
  "state": "TX",
  "postalCode": "77001",
  "country": "USA",
  "status": "active"
}
```

**Response (201):**
```json
{
  "id": "...",
  "organizationId": "...",
  "name": "ACME Corporation",
  "contactPerson": "John Doe",
  "email": "john.doe@acme.com",
  "phone": "+1-555-0100",
  "address": "123 Main Street",
  "city": "Houston",
  "state": "TX",
  "postalCode": "77001",
  "country": "USA",
  "notes": null,
  "status": "active",
  "_count": {
    "projects": 0
  }
}
```

## Data Models

### Project

```typescript
{
  id: string;                    // UUID
  organizationId: string;        // Multi-tenant isolation
  projectNumber: string;         // Unique per organization
  name: string;
  description?: string;
  clientId: string;              // Foreign key to Client
  startDate: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
}
```

### Work Order

```typescript
{
  id: string;
  organizationId: string;
  projectId: string;             // Foreign key to Project
  woNumber: string;              // Unique per project
  description: string;
  startDate: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  status: 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;           // Foreign key to User
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
}
```

### Client

```typescript
{
  id: string;
  organizationId: string;
  name: string;                  // Unique per organization
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'prospect';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
}
```

## Query Parameters

### List Endpoints

All list endpoints support these query parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search in relevant fields
- `status` (string): Filter by status
- `priority` (string): Filter by priority (projects/work orders)
- `clientId` (uuid): Filter by client (projects)
- `projectId` (uuid): Filter by project (work orders)
- `assignedTo` (uuid): Filter by assigned user (work orders)

## Business Rules

### Projects

- Project numbers must be unique within organization
- Cannot delete project with active work orders (status: pending or in_progress)
- User must have access to client to create/update project
- Soft delete preserves audit trail

### Work Orders

- WO numbers must be unique within project
- Cannot create work order for non-existent project
- Assigned user must exist in organization
- User must have access to parent project

### Clients

- Client names must be unique within organization
- Cannot delete client with active projects
- Soft delete preserves historical data

## Error Handling

### Validation Errors (400)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "projectNumber",
        "message": "String must contain at least 1 character(s)"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Authentication Required (401)

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "User information missing from request",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Permission Denied (403)

```json
{
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions",
    "details": [
      {
        "field": "permission",
        "message": "Required permission: project:create"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Not Found (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Duplicate Entry (409)

```json
{
  "error": {
    "code": "DUPLICATE_PROJECT_NUMBER",
    "message": "Project number already exists",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Business Rule Violation (400)

```json
{
  "error": {
    "code": "PROJECT_HAS_ACTIVE_WORK_ORDERS",
    "message": "Cannot delete project with active work orders. Please complete or cancel all work orders first.",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Environment Variables

```env
# Server
PORT=4002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ndt_suite

# CORS (if accessed directly, though gateway is preferred)
CORS_ORIGIN=http://localhost:4000
```

## Development

### Install Dependencies

```bash
npm install
```

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Start Development Server

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
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

## Multi-Tenancy

All data is automatically scoped to the user's organization:

1. **User Context Extraction**: API Gateway forwards `X-Organization-Id` header
2. **Automatic Filtering**: All queries include `organizationId` filter
3. **Creation**: New records automatically tagged with user's `organizationId`
4. **Validation**: Cross-organization references are prevented

This ensures complete data isolation between organizations.

## Security

- **Permission Checks**: All endpoints validate user permissions
- **Organization Isolation**: Multi-tenant data separation
- **Input Validation**: Zod schemas prevent invalid data
- **Soft Deletes**: Recoverable deletion with audit trail
- **Audit Trail**: `createdBy`, `updatedBy`, `createdAt`, `updatedAt` on all records

## Monitoring

Key metrics:
- Request rate per endpoint
- Response times
- Error rates
- Database query performance
- Active projects/work orders
- Resource utilization

## License

Proprietary - ACME NDT Services
