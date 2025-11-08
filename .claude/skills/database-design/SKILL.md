# Database Design Guidelines

**Purpose**: Comprehensive database schema design and best practices
**Type**: Technical Knowledge
**Priority**: High
**Auto-Activate**: When working on schema, migrations, database queries

---

## Core Design Principles

### 1. Multi-Tenancy

**Every table MUST include `organization_id`** for data isolation.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  -- other fields
  CONSTRAINT projects_org_idx UNIQUE (organization_id, project_number)
);

-- Row-Level Security (RLS) policy
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation ON projects
  USING (organization_id = current_setting('app.current_org_id')::UUID);
```

### 2. Soft Deletes

**Never hard-delete records**. Use `deleted_at` timestamp.

```sql
ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Queries should filter out deleted records
SELECT * FROM projects WHERE deleted_at IS NULL;

-- Soft delete
UPDATE projects SET deleted_at = NOW() WHERE id = '...';

-- Restore
UPDATE projects SET deleted_at = NULL WHERE id = '...';
```

### 3. Audit Trail

**All tables must track creation and modification**.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,

  -- Audit fields (required on all tables)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Normalization

**Follow 3rd Normal Form (3NF)** for transactional data:
- No repeating groups
- No partial dependencies
- No transitive dependencies

**Denormalize for reporting** when necessary:
- Materialized views
- Computed columns
- Read replicas

---

## Naming Conventions

### Tables
- **Plural nouns**: `users`, `projects`, `work_orders`
- **Lowercase**: Always lowercase
- **Underscores**: For multi-word names
- **No prefixes**: Don't prefix with `tbl_`

### Columns
- **snake_case**: `created_at`, `first_name`, `project_number`
- **Be explicit**: `start_date` not `start`
- **Boolean prefix**: `is_active`, `has_permission`
- **Dates**: `_at` for timestamps, `_date` for dates only

### Foreign Keys
- **Pattern**: `{referenced_table}_id`
- Examples: `user_id`, `project_id`, `organization_id`

### Indexes
- **Pattern**: `idx_{table}_{columns}`
- Example: `idx_projects_org_status`
- Unique: `uniq_{table}_{columns}`
- Foreign key: `fk_{table}_{column}`

---

## Schema Patterns

### Hierarchical Data

Use self-referencing foreign key + path for efficient queries.

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  parent_asset_id UUID REFERENCES assets(id),
  asset_type TEXT NOT NULL, -- 'facility', 'system', 'component', 'weld'
  name TEXT NOT NULL,
  path TEXT, -- Materialized path: '/facility-id/system-id/component-id'

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for hierarchy queries
CREATE INDEX idx_assets_parent ON assets(parent_asset_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_path ON assets USING btree(path) WHERE deleted_at IS NULL;

-- Query all descendants
SELECT * FROM assets WHERE path LIKE '/facility-123/%';

-- Query immediate children
SELECT * FROM assets WHERE parent_asset_id = 'facility-123' AND deleted_at IS NULL;
```

### Polymorphic Relationships

Use nullable foreign keys with a type discriminator.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,

  -- Polymorphic relationship
  related_entity_type TEXT NOT NULL, -- 'project', 'inspection', 'user', etc.
  related_entity_id UUID NOT NULL,

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for polymorphic queries
CREATE INDEX idx_documents_related ON documents(related_entity_type, related_entity_id);

-- Query all documents for a project
SELECT * FROM documents
WHERE related_entity_type = 'project' AND related_entity_id = 'project-123';
```

### Many-to-Many Relationships

Use junction tables with composite primary keys.

```sql
CREATE TABLE employee_skills (
  employee_id UUID NOT NULL REFERENCES users(id),
  skill_id UUID NOT NULL REFERENCES skills(id),
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  certified_date DATE,

  PRIMARY KEY (employee_id, skill_id)
);

CREATE INDEX idx_employee_skills_skill ON employee_skills(skill_id);
```

### Versioning/History

Use temporal tables for version tracking.

```sql
CREATE TABLE procedures (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  procedure_number TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL, -- 'draft', 'approved', 'obsolete'

  -- Version tracking
  effective_date DATE,
  expiration_date DATE,
  approved_by UUID REFERENCES users(id),
  approval_date DATE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Separate table for historical versions
CREATE TABLE procedure_history (
  id UUID PRIMARY KEY,
  procedure_id UUID NOT NULL REFERENCES procedures(id),
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL,
  effective_date DATE,
  created_at TIMESTAMPTZ NOT NULL,

  UNIQUE(procedure_id, version)
);

-- Trigger to save history on update
CREATE OR REPLACE FUNCTION save_procedure_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO procedure_history (
    id, procedure_id, version, content, status, effective_date, created_at
  ) VALUES (
    gen_random_uuid(), OLD.id, OLD.version, OLD.content, OLD.status,
    OLD.effective_date, OLD.updated_at
  );
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER procedure_version_trigger
  BEFORE UPDATE ON procedures
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION save_procedure_history();
```

---

## Indexing Strategy

### Basic Rules

1. **Index foreign keys** - Always
2. **Index query filters** - WHERE clauses, JOIN conditions
3. **Index sort columns** - ORDER BY
4. **Composite indexes** - Match query patterns
5. **Partial indexes** - For filtered queries

### Examples

```sql
-- Foreign key index (always)
CREATE INDEX idx_work_orders_project ON work_orders(project_id);

-- Composite index for common query
CREATE INDEX idx_work_orders_project_status
  ON work_orders(project_id, status)
  WHERE deleted_at IS NULL;

-- Partial index for active records only
CREATE INDEX idx_certifications_active
  ON certifications(user_id, expiration_date)
  WHERE expiration_date > CURRENT_DATE;

-- Full-text search index
CREATE INDEX idx_assets_search
  ON assets USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Query using full-text search
SELECT * FROM assets
WHERE to_tsvector('english', name || ' ' || COALESCE(description, ''))
  @@ to_tsquery('english', 'pump & station');
```

### Index Maintenance

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Find unused indexes
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_%';

-- Rebuild index if needed
REINDEX INDEX CONCURRENTLY idx_name;
```

---

## Data Types

### Choosing the Right Type

```sql
-- UUIDs for primary keys (better for distributed systems)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- TEXT for strings (no length limit in PostgreSQL)
name TEXT NOT NULL
description TEXT

-- TIMESTAMPTZ for timestamps (stores timezone)
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- DATE for dates only
birth_date DATE
inspection_date DATE

-- NUMERIC for precise decimals (money, measurements)
budget_amount NUMERIC(15, 2) -- 15 digits, 2 decimal places
thickness NUMERIC(10, 3) -- For precise measurements

-- INTEGER for counts
employee_count INTEGER
version INTEGER DEFAULT 1

-- BOOLEAN for true/false
is_active BOOLEAN DEFAULT TRUE
has_permission BOOLEAN

-- JSONB for flexible data
settings JSONB
results JSONB
metadata JSONB

-- ENUM for fixed sets
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
status project_status NOT NULL DEFAULT 'planning'

-- ARRAY for lists (use sparingly)
tags TEXT[]
```

---

## Constraints

### Primary Keys

```sql
-- UUID primary key
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
```

### Foreign Keys

```sql
-- With ON DELETE behavior
CREATE TABLE work_orders (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL
);
```

### Check Constraints

```sql
-- Range validation
CREATE TABLE certifications (
  id UUID PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  expiration_date DATE NOT NULL CHECK (expiration_date > issue_date)
);

-- Status validation
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled'))
);
```

### Unique Constraints

```sql
-- Single column unique
CREATE TABLE users (
  email TEXT NOT NULL UNIQUE
);

-- Composite unique (per organization)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  project_number TEXT NOT NULL,
  CONSTRAINT projects_org_number_unique UNIQUE (organization_id, project_number)
);

-- Partial unique (only for non-deleted)
CREATE UNIQUE INDEX uniq_users_email_active
  ON users(email)
  WHERE deleted_at IS NULL;
```

---

## Migrations with Prisma

### Migration Workflow

```bash
# Create new migration
npx prisma migrate dev --name add_certifications_table

# Apply migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Migration Best Practices

```prisma
// prisma/schema.prisma

// Good: Add nullable column first
model Project {
  id String @id @default(uuid())
  name String
  clientId String? // Nullable initially
  @@map("projects")
}

// Then in a second migration, make it required and add default
// After data backfill
model Project {
  id String @id @default(uuid())
  name String
  clientId String // Now required
  @@map("projects")
}
```

---

## Performance Optimization

### Query Optimization

```sql
-- Bad: N+1 queries
SELECT * FROM projects;
-- Then for each project:
SELECT * FROM work_orders WHERE project_id = ?;

-- Good: JOIN
SELECT
  p.*,
  json_agg(wo.*) AS work_orders
FROM projects p
LEFT JOIN work_orders wo ON wo.project_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id;
```

### Pagination

```sql
-- Offset-based (good for small datasets)
SELECT * FROM projects
ORDER BY created_at DESC
LIMIT 20 OFFSET 40; -- Page 3

-- Cursor-based (better for large datasets)
SELECT * FROM projects
WHERE created_at < '2025-01-01T00:00:00Z' -- cursor
ORDER BY created_at DESC
LIMIT 20;
```

### Aggregations

```sql
-- Use indexes for aggregations
CREATE INDEX idx_inspections_date ON inspections(inspection_date);

-- Efficient count with index
SELECT COUNT(*) FROM projects WHERE status = 'active' AND deleted_at IS NULL;

-- Avoid COUNT(*) on large tables, use estimates
SELECT reltuples::BIGINT FROM pg_class WHERE relname = 'projects';
```

---

## Best Practices Checklist

### ✅ DO:

1. **Use UUIDs** for primary keys
2. **Index foreign keys** always
3. **Enable RLS** for multi-tenancy
4. **Use TIMESTAMPTZ** not TIMESTAMP
5. **Soft delete** with deleted_at
6. **Add audit fields** to all tables
7. **Use migrations** for schema changes
8. **Test migrations** on copy of production data
9. **Document complex queries** with comments
10. **Use transactions** for multi-table updates

### ❌ DON'T:

1. **Don't hard-delete** records (use soft delete)
2. **Don't use SELECT *** (specify columns)
3. **Don't miss organization_id** on any table
4. **Don't forget indexes** on foreign keys
5. **Don't use VARCHAR(n)** (use TEXT in PostgreSQL)
6. **Don't store files in database** (use S3)
7. **Don't skip migrations** (always use Prisma migrate)
8. **Don't trust user input** (validate and sanitize)
9. **Don't forget backups** (automated, tested)
10. **Don't expose raw errors** to clients

---

## Related Resources

- [Schema Patterns Reference](./resources/schema-patterns.md)
- [Indexing Strategies](./resources/indexing-strategies.md)
- [Migration Best Practices](./resources/migration-best-practices.md)
- [Query Optimization Guide](./resources/query-optimization.md)
- [Multi-Tenancy Patterns](./resources/multi-tenancy.md)

---

**Version**: 1.0
**Last Updated**: 2025-11-08
**Status**: Active
