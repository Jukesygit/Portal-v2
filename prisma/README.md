# Prisma Database Schema

This directory contains the Prisma schema and migrations for the NDT Suite V2 database.

## Database Design Principles

### 1. Multi-Tenancy
All tables include `organization_id` for data isolation:
```prisma
organizationId String
organization   Organization @relation(fields: [organizationId], references: [id])

@@index([organizationId])
```

### 2. Soft Deletes
Records are never hard-deleted, using `deletedAt` timestamp:
```prisma
deletedAt DateTime?
```

### 3. Audit Trail
All tables track creation and modification:
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
createdBy String?
updatedBy String?
```

## Schema Overview

### Core Domains

#### Organizations & Users
- `Organization` - Multi-tenant organizations
- `User` - System users with roles
- `UserProfile` - Extended user information

#### Project Management
- `Project` - NDT projects
- `WorkOrder` - Work assignments
- `Asset` - Hierarchical asset structure (facility → system → component → weld)
- `Inspection` - Inspection records with results

#### Personnel Management
- `Certification` - NDT certifications (ASNT, ISO, EN)
- `TrainingRecord` - Training history
- `Schedule` - Resource scheduling
- `Timesheet` - Time tracking

#### Quality Management
- `Procedure` - Versioned procedures (WPS, PQR, etc.)
- `NonConformanceReport` - NCR tracking with CAPA
- `Audit` - Audit management

#### Equipment & Calibration
- `Equipment` - Equipment registry
- `CalibrationRecord` - Calibration tracking

#### Client Management
- `Client` - Client information
- `Contract` - Contract management

#### System
- `Notification` - In-app notifications

## Usage

### Generate Prisma Client
```bash
npx prisma generate
```

### Create Migration
```bash
npx prisma migrate dev --name init
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Reset Database (dev only)
```bash
npx prisma migrate reset
```

### Studio (GUI)
```bash
npx prisma studio
```

## Indexing Strategy

All foreign keys are indexed:
```prisma
@@index([organizationId])
@@index([userId])
@@index([projectId])
```

Common query patterns indexed:
```prisma
@@index([organizationId, status])
@@index([userId, expirationDate])
@@index([nextDueDate])
```

## Unique Constraints

Organization-scoped uniqueness:
```prisma
@@unique([organizationId, projectNumber])
@@unique([organizationId, ncrNumber])
@@unique([organizationId, equipmentNumber])
```

Global uniqueness:
```prisma
email String @unique
```

## Data Types

- **IDs**: UUID (`String @id @default(uuid())`)
- **Timestamps**: `DateTime`
- **Money**: `Decimal @db.Decimal(15, 2)`
- **JSON**: `Json` for flexible data
- **Strings**: `String` (no length limit in PostgreSQL)

## Relations

### One-to-Many
```prisma
// In Organization
projects Project[]

// In Project
organizationId String
organization   Organization @relation(fields: [organizationId], references: [id])
```

### One-to-One
```prisma
// In User
profile UserProfile?

// In UserProfile
userId String @id
user   User   @relation(fields: [userId], references: [id])
```

### Many-to-Many
Handled through junction tables with additional fields.

## Migration History

- `init` - Initial schema with all core tables

## Notes

- All timestamps stored in UTC
- Soft deletes implemented on all core tables
- Row-Level Security (RLS) will be implemented at database level
- Multi-tenancy enforced through `organization_id`
