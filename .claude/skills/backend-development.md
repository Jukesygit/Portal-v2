# Backend Development Skill

**Domain**: Supabase Edge Functions + PostgreSQL
**Project**: NDT Tool Suite
**Last Updated**: 2025-11-11

## Quick Reference

This skill covers backend development using Supabase Edge Functions and PostgreSQL database.

**Key Technologies**:
- Supabase Edge Functions (Deno runtime)
- PostgreSQL with Row-Level Security (RLS)
- TypeScript for functions
- Supabase Auth integration

**File Locations**:
- Functions: `NDT-SUITE-UMBER-Experimental/supabase/functions/`
- Database schemas: `NDT-SUITE-UMBER-Experimental/database/`
- Migrations: `NDT-SUITE-UMBER-Experimental/database/migrations/`

---

## Core Principles

### 1. Edge Function Architecture

**Function Structure**:
```typescript
// supabase/functions/function-name/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // 1. CORS handling
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // 2. Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Create Supabase client with user context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 4. Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Parse request body
    const body = await req.json();

    // 6. Validate input
    if (!body.requiredField) {
      return new Response(
        JSON.stringify({ error: 'Missing required field' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. Business logic
    const result = await processRequest(body, user);

    // 8. Return response
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### 2. Database Patterns

**Row-Level Security (RLS)**:
```sql
-- Enable RLS on tables
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their organization's data
CREATE POLICY org_isolation ON inspections
  FOR ALL
  USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Policy: Admins can see all data
CREATE POLICY admin_access ON inspections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

**Indexes for Performance**:
```sql
-- Index foreign keys
CREATE INDEX idx_inspections_asset_id ON inspections(asset_id);
CREATE INDEX idx_inspections_org_id ON inspections(organization_id);

-- Index commonly queried columns
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_created_at ON inspections(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_inspections_org_status
  ON inspections(organization_id, status);

-- Partial indexes for specific conditions
CREATE INDEX idx_active_inspections
  ON inspections(organization_id, created_at)
  WHERE status = 'active';
```

### 3. Authentication & Authorization

**JWT Token Verification**:
```typescript
// Edge function automatically verifies JWT
// Access user info from Supabase auth
const { data: { user }, error } = await supabase.auth.getUser();

// Get user's organization
const { data: userData } = await supabase
  .from('users')
  .select('organization_id, role')
  .eq('id', user.id)
  .single();
```

**Role-Based Access Control**:
```typescript
// Check user role
function requireRole(userRole: string, requiredRole: string) {
  const roleHierarchy = {
    'admin': 4,
    'manager': 3,
    'inspector': 2,
    'viewer': 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// In function
if (!requireRole(userData.role, 'manager')) {
  return new Response(
    JSON.stringify({ error: 'Insufficient permissions' }),
    { status: 403 }
  );
}
```

---

## Existing Functions

### submit-account-request
**Purpose**: Handle user account requests
**Location**: `supabase/functions/submit-account-request/index.ts`
**Method**: POST
**Auth**: Required

### approve-account-request
**Purpose**: Approve pending account requests (admin only)
**Location**: `supabase/functions/approve-account-request/index.ts`
**Method**: POST
**Auth**: Required (admin role)

### transfer-asset
**Purpose**: Transfer asset ownership between organizations
**Location**: `supabase/functions/transfer-asset/index.ts`
**Method**: POST
**Auth**: Required (manager+ role)

---

## Common Tasks

### Creating a New Edge Function

**Steps**:
```bash
# 1. Create function directory
mkdir -p supabase/functions/new-function-name

# 2. Create index.ts
touch supabase/functions/new-function-name/index.ts

# 3. Use template (see Function Structure above)

# 4. Test locally
supabase functions serve new-function-name

# 5. Deploy
supabase functions deploy new-function-name
```

### Database Migration

**Create Migration**:
```bash
# Generate migration file
supabase migration new migration_name

# Edit the generated SQL file in database/migrations/
```

**Migration Template**:
```sql
-- database/migrations/YYYYMMDDHHMMSS_migration_name.sql

-- Add new table
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY org_isolation ON new_table
  FOR ALL
  USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Add indexes
CREATE INDEX idx_new_table_org ON new_table(organization_id);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON new_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Querying Database from Function

**Simple Query**:
```typescript
const { data, error } = await supabase
  .from('inspections')
  .select('*')
  .eq('id', inspectionId)
  .single();
```

**Join Query**:
```typescript
const { data, error } = await supabase
  .from('inspections')
  .select(`
    *,
    asset:assets(*),
    inspector:users(id, name, email)
  `)
  .eq('organization_id', orgId);
```

**Complex Query with Raw SQL**:
```typescript
// Use when Supabase client can't express the query
const { data, error } = await supabase.rpc('custom_function_name', {
  param1: value1,
  param2: value2
});

// Define function in migration:
// CREATE OR REPLACE FUNCTION custom_function_name(param1 type, param2 type)
// RETURNS TABLE(...) AS $$
//   -- SQL query
// $$ LANGUAGE sql STABLE;
```

### Transaction Handling

**Using RPC for Transactions**:
```sql
-- Define in migration
CREATE OR REPLACE FUNCTION create_inspection_with_scans(
  p_inspection jsonb,
  p_scans jsonb[]
) RETURNS uuid AS $$
DECLARE
  v_inspection_id uuid;
BEGIN
  -- Insert inspection
  INSERT INTO inspections (organization_id, asset_id, ...)
  SELECT (p_inspection->>'organization_id')::uuid, ...
  RETURNING id INTO v_inspection_id;

  -- Insert scans
  INSERT INTO scans (inspection_id, data)
  SELECT v_inspection_id, unnest(p_scans);

  RETURN v_inspection_id;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Call from function
const { data: inspectionId, error } = await supabase.rpc(
  'create_inspection_with_scans',
  {
    p_inspection: inspectionData,
    p_scans: scansData
  }
);
```

---

## Security Best Practices

### Input Validation

**Always validate and sanitize**:
```typescript
// Define validation schema (can use Zod)
interface CreateInspectionRequest {
  asset_id: string;
  method: 'TOFD' | 'CSCAN' | 'PEC' | 'NII';
  data: Record<string, any>;
}

function validateRequest(body: any): CreateInspectionRequest {
  // Validate required fields
  if (!body.asset_id || typeof body.asset_id !== 'string') {
    throw new Error('Invalid asset_id');
  }

  if (!['TOFD', 'CSCAN', 'PEC', 'NII'].includes(body.method)) {
    throw new Error('Invalid inspection method');
  }

  return body as CreateInspectionRequest;
}
```

### SQL Injection Prevention

**Use parameterized queries**:
```typescript
// ✅ Good - Supabase client uses parameterized queries
const { data } = await supabase
  .from('inspections')
  .select('*')
  .eq('id', userProvidedId);

// ❌ Bad - Never build raw SQL with user input
// const query = `SELECT * FROM inspections WHERE id = '${userProvidedId}'`;
```

### Environment Variables

**Required Variables**:
```typescript
// Always use Deno.env.get() for secrets
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Never hardcode secrets!
```

---

## Error Handling

**Structured Error Responses**:
```typescript
class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

// Usage
if (!body.required_field) {
  throw new APIError(400, 'Missing required field', 'VALIDATION_ERROR');
}

// Global error handler
function handleError(error: any) {
  if (error instanceof APIError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return new Response(
    JSON.stringify({ error: 'Internal server error' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
```

---

## Testing Edge Functions

**Local Testing**:
```bash
# Serve function locally
supabase functions serve function-name --env-file .env.local

# Test with curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"field": "value"}'
```

**Integration Tests** (future):
```typescript
// Using Deno's built-in test runner
Deno.test('function handles valid request', async () => {
  const req = new Request('http://localhost', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer test-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ valid: 'data' })
  });

  const res = await handler(req);
  assertEquals(res.status, 200);
});
```

---

## Performance Optimization

### Connection Pooling

**Supabase handles this automatically**, but be aware:
- Free tier: 10 connections max
- Close connections promptly
- Use connection pooler for high traffic

### Query Optimization

**Use EXPLAIN ANALYZE**:
```sql
EXPLAIN ANALYZE
SELECT * FROM inspections
WHERE organization_id = '...'
AND status = 'active';

-- Look for:
-- - Seq Scan (bad) vs Index Scan (good)
-- - High execution time
-- - Missing indexes
```

**Optimize N+1 Queries**:
```typescript
// ❌ Bad - N+1 queries
const inspections = await getInspections();
for (const inspection of inspections) {
  const asset = await getAsset(inspection.asset_id); // N queries
}

// ✅ Good - Single query with join
const inspections = await supabase
  .from('inspections')
  .select('*, asset:assets(*)');
```

---

## Monitoring & Logging

**Structured Logging**:
```typescript
function log(level: string, message: string, metadata?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  }));
}

// Usage
log('info', 'Processing inspection', { inspectionId, userId });
log('error', 'Database query failed', { error: error.message });
```

**Key Metrics to Track**:
- Response time
- Error rate
- Authentication failures
- Database query time
- Function invocation count

---

## Resources

For detailed information:
- PostgreSQL best practices → `.claude/docs/resources/postgresql-guide.md`
- Supabase RLS patterns → `.claude/docs/resources/rls-patterns.md`
- Edge function examples → `.claude/docs/resources/edge-function-examples.md`

## Skill Maintenance

**Update When**:
- New edge functions added
- Database schema changes
- Security best practices evolve
- Supabase updates released

**Last Review**: 2025-11-11
**Next Review**: After Phase 1 deployment
