# Backend Development Guidelines

**Purpose**: Comprehensive guidelines for Node.js/Express/TypeScript backend development
**Type**: Domain Knowledge
**Priority**: High
**Auto-Activate**: When working on backend code, APIs, controllers, services

---

## Architecture Pattern

We follow a **layered architecture** pattern:

```
Routes → Controllers → Services → Repositories → Database
```

### Layer Responsibilities

#### Routes (`routes/`)
- Define API endpoints
- Handle URL parameters
- Apply middleware (auth, validation)
- Minimal logic, delegate to controllers

```typescript
// Example: routes/project.routes.ts
import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { projectCreateSchema } from '../schemas/project.schema';

const router = Router();
const projectController = new ProjectController();

router.post(
  '/projects',
  authenticate,
  validateBody(projectCreateSchema),
  projectController.create
);

export default router;
```

#### Controllers (`controllers/`)
- Handle HTTP request/response
- Extract parameters from request
- Call service layer
- Format responses
- Handle errors

```typescript
// Example: controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { BaseController } from './base.controller';

export class ProjectController extends BaseController {
  private projectService: ProjectService;

  constructor() {
    super();
    this.projectService = new ProjectService();
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const orgId = req.user.organizationId;
      const project = await this.projectService.createProject(
        req.body,
        userId,
        orgId
      );
      return this.created(res, project);
    } catch (error) {
      next(error);
    }
  };
}
```

#### Services (`services/`)
- **Business logic**
- Orchestrate multiple repositories
- Transaction management
- Domain validation
- **NO HTTP concerns** (no req/res)

```typescript
// Example: services/project.service.ts
import { ProjectRepository } from '../repositories/project.repository';
import { UserRepository } from '../repositories/user.repository';
import { BusinessError } from '../errors';

export class ProjectService {
  private projectRepo: ProjectRepository;
  private userRepo: UserRepository;

  constructor() {
    this.projectRepo = new ProjectRepository();
    this.userRepo = new UserRepository();
  }

  async createProject(data: CreateProjectDTO, userId: string, orgId: string) {
    // Business validation
    const user = await this.userRepo.findById(userId);
    if (!user.hasPermission('project:create')) {
      throw new BusinessError('Insufficient permissions');
    }

    // Business logic
    const project = {
      ...data,
      organizationId: orgId,
      createdBy: userId,
      status: 'planning',
    };

    return await this.projectRepo.create(project);
  }
}
```

#### Repositories (`repositories/`)
- **Data access only**
- CRUD operations
- Database queries
- Use Prisma ORM
- Return domain models

```typescript
// Example: repositories/project.repository.ts
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super('project');
  }

  async create(data: CreateProjectData): Promise<Project> {
    return await this.prisma.project.create({
      data,
      include: {
        client: true,
        workOrders: true,
      },
    });
  }

  async findByOrganization(
    orgId: string,
    filters: ProjectFilters
  ): Promise<PaginatedResult<Project>> {
    const where = {
      organizationId: orgId,
      deletedAt: null,
      ...(filters.status && { status: filters.status }),
      ...(filters.clientId && { clientId: filters.clientId }),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: filters.offset || 0,
        take: filters.limit || 20,
        orderBy: { createdAt: 'desc' },
        include: { client: true },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      total,
      page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
      totalPages: Math.ceil(total / (filters.limit || 20)),
    };
  }
}
```

---

## Error Handling

### Error Class Hierarchy

```typescript
// errors/base.error.ts
export class BaseError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// errors/business.error.ts
export class BusinessError extends BaseError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

// errors/not-found.error.ts
export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true);
  }
}

// errors/unauthorized.error.ts
export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
  }
}
```

### Error Handling Middleware

```typescript
// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/base.error';
import * as Sentry from '@sentry/node';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', error);

  // Send to Sentry if not operational
  if (!(error instanceof BaseError) || !error.isOperational) {
    Sentry.captureException(error);
  }

  // Handle known errors
  if (error instanceof BaseError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.constructor.name.replace('Error', '').toUpperCase(),
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
}
```

---

## Testing Strategy

### Unit Tests (Services & Repositories)

```typescript
// services/__tests__/project.service.test.ts
import { ProjectService } from '../project.service';
import { ProjectRepository } from '../../repositories/project.repository';
import { BusinessError } from '../../errors';

jest.mock('../../repositories/project.repository');

describe('ProjectService', () => {
  let service: ProjectService;
  let mockProjectRepo: jest.Mocked<ProjectRepository>;

  beforeEach(() => {
    mockProjectRepo = new ProjectRepository() as jest.Mocked<ProjectRepository>;
    service = new ProjectService();
    (service as any).projectRepo = mockProjectRepo;
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      const mockProject = { id: '123', name: 'Test Project' };
      mockProjectRepo.create.mockResolvedValue(mockProject);

      const result = await service.createProject(
        { name: 'Test Project' },
        'user-123',
        'org-123'
      );

      expect(result).toEqual(mockProject);
      expect(mockProjectRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Project',
          organizationId: 'org-123',
        })
      );
    });

    it('should throw error for invalid data', async () => {
      await expect(
        service.createProject({}, 'user-123', 'org-123')
      ).rejects.toThrow(BusinessError);
    });
  });
});
```

### Integration Tests (Controllers/Endpoints)

```typescript
// controllers/__tests__/project.controller.integration.test.ts
import request from 'supertest';
import app from '../../app';
import { generateAuthToken } from '../../utils/test-helpers';

describe('Project Controller', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await generateAuthToken({ userId: 'test-user', orgId: 'test-org' });
  });

  describe('POST /api/v1/projects', () => {
    it('should create project successfully', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          clientId: 'client-123',
          startDate: '2025-01-01',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Project');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/v1/projects')
        .send({ name: 'Test' })
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
});
```

---

## Code Organization

```
backend/services/project-service/
├── src/
│   ├── routes/           # API route definitions
│   │   ├── project.routes.ts
│   │   └── work-order.routes.ts
│   ├── controllers/      # Request/response handling
│   │   ├── base.controller.ts
│   │   ├── project.controller.ts
│   │   └── work-order.controller.ts
│   ├── services/         # Business logic
│   │   ├── project.service.ts
│   │   └── work-order.service.ts
│   ├── repositories/     # Data access
│   │   ├── base.repository.ts
│   │   ├── project.repository.ts
│   │   └── work-order.repository.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── error-handler.ts
│   ├── schemas/          # Zod validation schemas
│   │   ├── project.schema.ts
│   │   └── work-order.schema.ts
│   ├── errors/           # Custom error classes
│   │   ├── base.error.ts
│   │   ├── business.error.ts
│   │   └── not-found.error.ts
│   ├── utils/            # Helper functions
│   │   ├── logger.ts
│   │   └── date.ts
│   └── app.ts            # Express app setup
├── tests/
│   ├── unit/
│   └── integration/
└── package.json
```

---

## Best Practices

### ✅ DO:

1. **Use dependency injection** in constructors
2. **Write unit tests** for all services
3. **Use Zod** for request validation
4. **Log errors** to Sentry
5. **Use async/await** instead of callbacks
6. **Handle all errors** in try-catch blocks
7. **Use TypeScript strict mode**
8. **Document complex logic** with comments
9. **Use Prisma** for all database access
10. **Return standardized responses**

### ❌ DON'T:

1. **Don't put business logic in controllers**
2. **Don't directly access database in controllers**
3. **Don't use console.log** (use proper logger)
4. **Don't catch errors without rethrowing or logging**
5. **Don't use `any` type** in TypeScript
6. **Don't hardcode** configuration values
7. **Don't skip validation** on endpoints
8. **Don't forget to handle** edge cases
9. **Don't leave commented-out code**
10. **Don't skip writing tests**

---

## Related Resources

- [Routing Patterns](./resources/routing-patterns.md)
- [Controller Patterns](./resources/controller-patterns.md)
- [Service Layer Design](./resources/service-layer-design.md)
- [Repository Pattern](./resources/repository-pattern.md)
- [Error Handling Guide](./resources/error-handling.md)
- [Testing Strategies](./resources/testing-strategies.md)
- [Database Best Practices](./resources/database-best-practices.md)

---

**Version**: 1.0
**Last Updated**: 2025-11-08
**Status**: Active
