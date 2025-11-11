# Testing Development Skill

**Domain**: Testing Strategy & Implementation
**Project**: NDT Tool Suite
**Last Updated**: 2025-11-11

## Quick Reference

This skill covers testing patterns, strategies, and best practices for the NDT Suite.

**Target Stack** (from rebuild plan):
- **Unit Tests**: Vitest
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright
- **Coverage Target**: 80% overall, 100% for critical paths

**Current State**: Minimal testing (to be improved during rebuild)

---

## Testing Philosophy

### Test Pyramid

```
      E2E Tests (5%)
     /              \
  Integration (15%)
 /                    \
Unit Tests (80%)
```

**Why This Distribution?**:
- Unit tests: Fast, focused, easy to maintain
- Integration tests: Test module interactions
- E2E tests: Test critical user journeys, slow but high confidence

### Coverage Requirements

From rebuild plan (ndt-suite-rebuild-context.md:469):
- **Overall**: 80% minimum
- **Critical Paths**: 100% (auth, calculations, data migrations)
- **Services**: 90% (business logic)
- **Controllers**: 80% (request handling)
- **Utilities**: 90% (helper functions)

---

## Unit Testing Patterns

### Testing Pure Functions

**NDT Calculations** (highest priority):
```javascript
// src/tools/tofd-calculator/calculator.test.js
import { describe, it, expect } from 'vitest';
import {
  calculateDeadZones,
  calculateCoverage,
  validateInputs
} from './calculator.js';

describe('TOFD Calculator', () => {
  describe('calculateDeadZones', () => {
    it('calculates correct upper dead zone', () => {
      const result = calculateDeadZones({
        pcs: 100,
        angle: 60,
        thickness: 25
      });

      expect(result.upper).toBeCloseTo(43.3, 1);
    });

    it('calculates correct lower dead zone', () => {
      const result = calculateDeadZones({
        pcs: 100,
        angle: 60,
        thickness: 25
      });

      expect(result.lower).toBeCloseTo(28.9, 1);
    });

    it('handles edge case: 90 degree angle', () => {
      const result = calculateDeadZones({
        pcs: 100,
        angle: 90,
        thickness: 25
      });

      // At 90°, tan approaches infinity
      expect(result.lower).toBeLessThan(1);
    });
  });

  describe('validateInputs', () => {
    it('rejects negative PCS', () => {
      const errors = validateInputs({ pcs: -10, angle: 60, thickness: 25 });
      expect(errors).toContain('PCS must be positive');
    });

    it('rejects angle outside valid range', () => {
      const errors = validateInputs({ pcs: 100, angle: 120, thickness: 25 });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('accepts valid inputs', () => {
      const errors = validateInputs({ pcs: 100, angle: 60, thickness: 25 });
      expect(errors).toHaveLength(0);
    });
  });
});
```

**Best Practices for Calculation Tests**:
- Test edge cases (0, infinity, negative numbers)
- Test boundary values (min/max ranges)
- Use `toBeCloseTo()` for floating-point comparisons
- Test both valid and invalid inputs
- Document expected formulas in comments

### Testing React Components

**Component Testing with RTL**:
```javascript
// src/components/InspectionCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InspectionCard from './InspectionCard';

describe('InspectionCard', () => {
  const mockInspection = {
    id: '123',
    method: 'TOFD',
    asset: { name: 'Tank-A1' },
    status: 'completed',
    date: '2025-11-11'
  };

  it('renders inspection details', () => {
    render(<InspectionCard inspection={mockInspection} />);

    expect(screen.getByText('Tank-A1')).toBeInTheDocument();
    expect(screen.getByText('TOFD')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<InspectionCard inspection={mockInspection} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockInspection);
  });

  it('displays status badge with correct color', () => {
    render(<InspectionCard inspection={mockInspection} />);

    const badge = screen.getByText('completed');
    expect(badge).toHaveClass('status-completed');
  });
});
```

**RTL Best Practices**:
- Query by role, label, or text (not test IDs unless necessary)
- Test from user's perspective
- Don't test implementation details
- Mock external dependencies (APIs, hooks)

### Testing Custom Hooks

```javascript
// src/hooks/useInspectionData.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useInspectionData from './useInspectionData';
import { supabase } from '@/supabase-client';

vi.mock('@/supabase-client');

describe('useInspectionData', () => {
  it('fetches inspections on mount', async () => {
    const mockData = [{ id: '1', method: 'TOFD' }];
    supabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockData, error: null })
    });

    const { result } = renderHook(() => useInspectionData('org-123'));

    await waitFor(() => {
      expect(result.current.inspections).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles errors gracefully', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch' }
      })
    });

    const { result } = renderHook(() => useInspectionData('org-123'));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.inspections).toEqual([]);
    });
  });
});
```

---

## Integration Testing

### API Endpoint Testing

```javascript
// For future backend services
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('POST /api/inspections', () => {
  let authToken;

  beforeAll(async () => {
    // Setup test database
    // Get auth token
    authToken = await getTestAuthToken();
  });

  it('creates new inspection with valid data', async () => {
    const response = await request(app)
      .post('/api/inspections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        assetId: 'asset-123',
        method: 'TOFD',
        parameters: { pcs: 100, angle: 60 }
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.method).toBe('TOFD');
  });

  it('rejects unauthorized requests', async () => {
    const response = await request(app)
      .post('/api/inspections')
      .send({ assetId: 'asset-123', method: 'TOFD' });

    expect(response.status).toBe(401);
  });

  afterAll(async () => {
    // Cleanup test database
  });
});
```

### Database Integration Tests

```javascript
describe('Database Operations', () => {
  beforeEach(async () => {
    // Reset test database to known state
    await resetTestDatabase();
  });

  it('enforces RLS policies', async () => {
    // Create user from org A
    const userA = await createTestUser('org-a');

    // Try to access org B data
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('organization_id', 'org-b');

    // Should return empty due to RLS
    expect(data).toHaveLength(0);
  });

  it('maintains referential integrity', async () => {
    // Try to create inspection with invalid asset ID
    const { error } = await supabase
      .from('inspections')
      .insert({ assetId: 'invalid', method: 'TOFD' });

    expect(error).toBeTruthy();
    expect(error.message).toContain('foreign key');
  });
});
```

---

## E2E Testing with Playwright

### Critical User Journeys

**Test: Complete Inspection Workflow**:
```javascript
// tests/e2e/inspection-workflow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Inspection Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can create TOFD inspection', async ({ page }) => {
    // Navigate to inspections
    await page.click('text=Inspections');

    // Click create button
    await page.click('text=New Inspection');

    // Fill form
    await page.selectOption('[name="method"]', 'TOFD');
    await page.fill('[name="pcs"]', '100');
    await page.fill('[name="angle"]', '60');
    await page.fill('[name="thickness"]', '25');

    // Calculate
    await page.click('text=Calculate');

    // Verify results displayed
    await expect(page.locator('.dead-zone-results')).toBeVisible();

    // Save inspection
    await page.fill('[name="name"]', 'Test Inspection');
    await page.click('text=Save');

    // Verify redirect and success message
    await expect(page).toHaveURL(/\/inspections\/[a-z0-9-]+/);
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('user can generate inspection report', async ({ page }) => {
    // Navigate to existing inspection
    await page.goto('/inspections/test-inspection-id');

    // Click generate report
    await page.click('text=Generate Report');

    // Wait for report generation
    await page.waitForSelector('.report-preview', { timeout: 10000 });

    // Download PDF
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Download PDF')
    ]);

    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
```

**E2E Best Practices**:
- Test critical user journeys only
- Use data-testid for complex selectors
- Wait for network requests to complete
- Take screenshots on failure
- Run in CI pipeline

---

## Test Organization

### File Structure

```
src/
├── components/
│   ├── InspectionCard.jsx
│   └── InspectionCard.test.jsx      # Co-located tests
├── tools/
│   ├── tofd-calculator/
│   │   ├── calculator.js
│   │   ├── calculator.test.js       # Unit tests
│   │   ├── TOFDCalculator.jsx
│   │   └── TOFDCalculator.test.jsx  # Component tests
│   └── ...
└── hooks/
    ├── useInspectionData.js
    └── useInspectionData.test.js

tests/
├── e2e/
│   ├── auth.spec.js
│   ├── inspection-workflow.spec.js
│   └── report-generation.spec.js
└── integration/
    ├── api/
    └── database/
```

### Naming Conventions

- Unit/component tests: `*.test.js` or `*.spec.js`
- E2E tests: `*.spec.js` in `tests/e2e/`
- Test suites: `describe('ComponentName', () => {})`
- Test cases: `it('does something specific', () => {})`

---

## Mocking Strategies

### Mocking Supabase

```javascript
// src/__mocks__/supabase-client.js
export const supabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    update: vi.fn().mockResolvedValue({ data: {}, error: null }),
    delete: vi.fn().mockResolvedValue({ error: null })
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null
    })
  }
};
```

### Mocking External APIs

```javascript
// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked' }),
    ok: true,
    status: 200
  })
);
```

---

## Coverage Reports

### Generating Coverage

```bash
# Run tests with coverage
npm run test:coverage

# View HTML report
open coverage/index.html
```

### Vitest Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js',
        '**/*.spec.js'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

---

## Testing Checklist

**Before Committing**:
- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Coverage thresholds met
- [ ] No console errors in tests

**Critical Paths to Test** (100% coverage required):
- [ ] Authentication flow
- [ ] TOFD calculations (all formulas)
- [ ] C-Scan data processing
- [ ] NII coverage calculations
- [ ] Report generation
- [ ] Data synchronization
- [ ] Permission checks

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Resources

For detailed information:
- Vitest documentation → https://vitest.dev
- React Testing Library → https://testing-library.com/react
- Playwright guides → https://playwright.dev
- Testing best practices → `.claude/docs/resources/testing-best-practices.md`

## Skill Maintenance

**Update When**:
- Testing frameworks updated
- New testing patterns discovered
- Coverage requirements change
- New critical paths identified

**Last Review**: 2025-11-11
**Next Review**: After test infrastructure setup
