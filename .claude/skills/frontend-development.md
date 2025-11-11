# Frontend Development Skill

**Domain**: React 19 + Vite + Modern JavaScript
**Project**: NDT Tool Suite
**Last Updated**: 2025-11-11

## Quick Reference

This skill provides best practices and patterns for frontend development in the NDT Suite project.

**Key Technologies**:
- React 19 (latest features)
- Vite 5 (build tool)
- React Router v7
- Material-UI patterns (preparing for upgrade)
- Supabase Client

**File Locations**:
- Components: `NDT-SUITE-UMBER-Experimental/src/components/`
- Pages: `NDT-SUITE-UMBER-Experimental/src/pages/`
- Tools: `NDT-SUITE-UMBER-Experimental/src/tools/`
- Styles: `NDT-SUITE-UMBER-Experimental/src/styles/`

---

## Core Principles

### 1. Component Architecture

**Component Types**:
```javascript
// Page Components (in src/pages/)
// - Top-level route components
// - Handle data fetching and state management
// - Coordinate multiple smaller components

// Feature Components (in src/components/)
// - Reusable UI components
// - Self-contained with clear props interface
// - Should work in isolation

// Tool Components (in src/tools/)
// - NDT-specific calculation/visualization tools
// - Complex domain logic
// - Often stateful with local data management
```

**Naming Conventions**:
- PascalCase for components: `InspectionCard.jsx`
- camelCase for utilities: `dataManager.js`
- kebab-case for CSS modules: `inspection-card.css`

### 2. State Management Strategy

**Current Pattern** (being improved):
```javascript
// Local component state (useState)
const [isOpen, setIsOpen] = useState(false);

// Shared state (lift up to parent or use Context)
// Avoid prop drilling beyond 2 levels

// Server state (to be migrated to TanStack Query)
// Currently using custom hooks with Supabase client
```

**Future Pattern** (from rebuild plan):
```javascript
// Server state → TanStack Query
// UI state → Zustand
// Server data should NEVER be in client store
```

### 3. Data Fetching Patterns

**Current Supabase Integration**:
```javascript
import { supabase } from '@/supabase-client';

// In component or custom hook
const fetchData = async () => {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('column', value);

  if (error) {
    console.error('Error:', error);
    return;
  }

  return data;
};
```

**Error Handling**:
```javascript
// Always handle errors gracefully
// Show user-friendly messages
// Log for debugging

try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Failed to fetch:', error);
  setError('Unable to load data. Please try again.');
}
```

### 4. React 19 Features

**Available Modern Features**:
- Use hooks (useState, useEffect, useMemo, useCallback)
- Custom hooks for reusable logic
- Context for shared state
- Suspense for lazy loading (use sparingly)

**Performance Optimization**:
```javascript
// Memoize expensive calculations
const calculatedValue = useMemo(() => {
  return expensiveCalculation(input);
}, [input]);

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// Lazy load heavy components
const Viewer3D = lazy(() => import('./components/Viewer3D'));
```

---

## Project-Specific Patterns

### NDT Tool Components

Tools in `src/tools/` follow this structure:
```javascript
// Each tool is typically a self-contained module
src/tools/
  ├── tofd-calculator/
  │   ├── calculator.js      // Calculation logic
  │   ├── TOFDCalculator.jsx // UI component
  │   └── utils.js           // Helper functions
  ├── cscan-visualizer/
  ├── pec-visualizer/
  └── nii-coverage-calculator/
```

**Tool Development Pattern**:
1. Separate calculation logic from UI
2. Keep domain logic pure (testable)
3. UI component handles input/output
4. Use proper error boundaries

### Layout & Routing

**Current Structure**:
```javascript
// App.jsx - Main routing
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Protected routes use ProtectedRoute component
<Route path="/admin" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

**Layout Pattern**:
```javascript
// Layout.jsx provides consistent structure
// - Header with navigation
// - Main content area
// - Footer (if applicable)
```

### Styling Approach

**Current Method**: CSS files + inline styles
```javascript
// Import CSS
import './styles/component-name.css';

// Use className
<div className="inspection-card">
  {/* content */}
</div>
```

**Future Direction** (from rebuild plan):
- Material-UI v7 component library
- CSS-in-JS with MUI system
- Theme customization

### Form Handling

**Pattern**:
```javascript
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate
  if (!validateForm(formData)) {
    setError('Validation failed');
    return;
  }

  // Submit
  try {
    await submitData(formData);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

---

## Common Tasks

### Creating a New Component

**Steps**:
1. Determine location (components/, pages/, or tools/)
2. Create component file with `.jsx` extension
3. Follow naming convention (PascalCase)
4. Import required dependencies
5. Create functional component
6. Export default or named export
7. Add to parent component or router

**Template**:
```javascript
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
}

export default ComponentName;
```

### Adding a New Page

**Steps**:
1. Create page component in `src/pages/`
2. Name with `Page` suffix: `NewFeaturePage.jsx`
3. Add route in `App.jsx`
4. Add navigation link if needed
5. Add to `ProtectedRoute` if authentication required

### Integrating with Supabase

**Read from Database**:
```javascript
// In component or custom hook
useEffect(() => {
  async function loadData() {
    const { data, error } = await supabase
      .from('inspections')
      .select('*, assets(*)')  // Join with assets table
      .order('created_at', { ascending: false });

    if (data) setInspections(data);
  }

  loadData();
}, []);
```

**Write to Database**:
```javascript
const saveInspection = async (inspectionData) => {
  const { data, error } = await supabase
    .from('inspections')
    .insert([inspectionData])
    .select();

  if (error) throw error;
  return data[0];
};
```

---

## Testing Approach

**Current State**: Minimal testing (to be improved)

**Target** (from rebuild plan):
- Vitest + React Testing Library
- 80%+ coverage
- Focus on critical paths

**Component Testing Pattern**:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    // Assert expected behavior
  });
});
```

---

## Performance Guidelines

### Bundle Size

**Current Build Tool**: Vite
- Automatic code splitting
- Fast HMR (Hot Module Replacement)
- Optimized production builds

**Best Practices**:
```javascript
// Lazy load heavy components
const Viewer3D = lazy(() => import('./Viewer3D'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Viewer3D />
</Suspense>

// Dynamic imports for large libraries
const loadHeavyLib = async () => {
  const module = await import('heavy-library');
  return module;
};
```

### Rendering Performance

**Avoid Unnecessary Re-renders**:
```javascript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// Memoize values that don't change often
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

---

## Resources

For detailed information on specific topics, see:
- React 19 features → `.claude/docs/resources/react-19-guide.md`
- Vite configuration → `.claude/docs/resources/vite-config.md`
- Supabase integration → `.claude/docs/resources/supabase-patterns.md`
- Testing patterns → `.claude/docs/resources/testing-guide.md`

## Skill Maintenance

**Update When**:
- New patterns emerge
- Technology upgrades (React, Vite, etc.)
- Team decides on new conventions
- Common issues discovered

**Last Review**: 2025-11-11
**Next Review**: After Phase 1 of rebuild completes
