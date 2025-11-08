# Frontend Development Guidelines

**Purpose**: Comprehensive guidelines for React 19 + TypeScript + TanStack development
**Type**: Domain Knowledge
**Priority**: High
**Auto-Activate**: When working on frontend code, React components, UI

---

## Tech Stack

### Core Technologies
- **React 19**: Latest features including Server Components and Actions
- **TypeScript**: Strict mode for type safety
- **TanStack Router**: File-based routing with type safety
- **TanStack Query**: Server state management and caching
- **MUI v7**: Component library with accessibility
- **Zustand**: Lightweight client state management (when needed)
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation

---

## Component Architecture

### Component Structure

```
src/
├── routes/               # File-based routing
│   ├── _layout.tsx       # Root layout
│   ├── _auth/            # Auth-protected routes
│   │   ├── projects/
│   │   │   ├── index.tsx           # /projects
│   │   │   ├── $id.tsx             # /projects/:id
│   │   │   └── create.tsx          # /projects/create
│   │   └── work-orders/
│   └── login.tsx         # Public routes
├── components/           # Reusable components
│   ├── ui/               # Generic UI components
│   │   ├── Button/
│   │   ├── DataTable/
│   │   └── Modal/
│   ├── forms/            # Form components
│   │   ├── ProjectForm/
│   │   └── WorkOrderForm/
│   └── layout/           # Layout components
│       ├── Header/
│       ├── Sidebar/
│       └── Footer/
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useProjects.ts
│   └── useDebounce.ts
├── lib/                  # Utilities and config
│   ├── api-client.ts
│   ├── query-client.ts
│   └── theme.ts
├── types/                # TypeScript types
│   ├── project.ts
│   └── user.ts
└── utils/                # Helper functions
    ├── date.ts
    └── format.ts
```

---

## Component Patterns

### Functional Components with TypeScript

```tsx
// components/ProjectCard/ProjectCard.tsx
import { FC } from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';

interface ProjectCardProps {
  project: Project;
  onClick?: (projectId: string) => void;
  className?: string;
}

export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  onClick,
  className,
}) => {
  const handleClick = () => {
    onClick?.(project.id);
  };

  return (
    <Card className={className} onClick={handleClick} sx={{ cursor: 'pointer' }}>
      <CardContent>
        <Typography variant="h6">{project.name}</Typography>
        <Typography color="text.secondary">{project.clientName}</Typography>
        <Chip
          label={project.status}
          color={getStatusColor(project.status)}
          size="small"
        />
      </CardContent>
    </Card>
  );
};

// Helper function (keep with component or in utils)
function getStatusColor(status: ProjectStatus): 'success' | 'warning' | 'error' {
  const colors = {
    active: 'success',
    planning: 'warning',
    completed: 'success',
    cancelled: 'error',
  } as const;
  return colors[status] || 'warning';
}
```

### Colocation Pattern

Keep related files together:

```
components/ProjectCard/
├── ProjectCard.tsx
├── ProjectCard.test.tsx
├── ProjectCard.styles.ts
├── useProjectActions.ts
└── index.ts
```

---

## State Management

### Server State (TanStack Query)

**Use for**: API data, server-side state

```tsx
// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => api.projects.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => api.projects.get(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) => api.projects.create(data),
    onSuccess: () => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDTO }) =>
      api.projects.update(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['projects', id] });

      const previousProject = queryClient.getQueryData(['projects', id]);

      queryClient.setQueryData(['projects', id], (old: Project) => ({
        ...old,
        ...data,
      }));

      return { previousProject };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          ['projects', variables.id],
          context.previousProject
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
}
```

### Client State (Zustand)

**Use for**: UI state, modals, filters, temporary data

```typescript
// stores/useFilterStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  status: ProjectStatus | null;
  clientId: string | null;
  searchTerm: string;

  setStatus: (status: ProjectStatus | null) => void;
  setClientId: (clientId: string | null) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      status: null,
      clientId: null,
      searchTerm: '',

      setStatus: (status) => set({ status }),
      setClientId: (clientId) => set({ clientId }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      resetFilters: () => set({ status: null, clientId: null, searchTerm: '' }),
    }),
    {
      name: 'project-filters',
    }
  )
);

// Usage in component
function ProjectList() {
  const { status, searchTerm, setStatus, setSearchTerm } = useFilterStore();
  const { data, isLoading } = useProjects({ status, searchTerm });

  // ...
}
```

---

## Routing with TanStack Router

### File-Based Routes

```tsx
// routes/_layout.tsx (Root layout)
import { Outlet } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function RootLayout() {
  return (
    <div className="app-layout">
      <Header />
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// routes/_auth/projects/index.tsx
import { useProjects } from '@/hooks/useProjects';
import { ProjectList } from '@/components/ProjectList';

export default function ProjectsPage() {
  const { data, isLoading, error } = useProjects();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <ProjectList projects={data.data} />;
}

// routes/_auth/projects/$id.tsx
import { useParams } from '@tanstack/react-router';
import { useProject } from '@/hooks/useProjects';

export default function ProjectDetailPage() {
  const { id } = useParams({ from: '/projects/$id' });
  const { data: project, isLoading } = useProject(id);

  if (isLoading) return <Skeleton />;

  return <ProjectDetail project={project} />;
}
```

### Protected Routes

```tsx
// routes/_auth.tsx (Auth layout)
import { Outlet, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;

  return <Outlet />;
}
```

---

## Forms with React Hook Form + Zod

```tsx
// components/forms/ProjectForm/ProjectForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button } from '@mui/material';

// Validation schema
const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  clientId: z.string().uuid('Invalid client ID'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  endDate: z.string().optional(),
  budget: z.number().positive('Budget must be positive').optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

export function ProjectForm({ initialData, onSubmit }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('name')}
        label="Project Name"
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
      />

      <TextField
        {...register('clientId')}
        label="Client ID"
        error={!!errors.clientId}
        helperText={errors.clientId?.message}
        fullWidth
      />

      <TextField
        {...register('startDate')}
        label="Start Date"
        type="date"
        error={!!errors.startDate}
        helperText={errors.startDate?.message}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}

// Usage in component
function CreateProjectPage() {
  const createProject = useCreateProject();
  const navigate = useNavigate();

  const handleSubmit = async (data: ProjectFormData) => {
    await createProject.mutateAsync(data);
    navigate({ to: '/projects' });
  };

  return <ProjectForm onSubmit={handleSubmit} />;
}
```

---

## Performance Optimization

### 1. Code Splitting & Lazy Loading

```tsx
// routes/_auth/projects/index.tsx
import { lazy, Suspense } from 'react';
import { Skeleton } from '@mui/material';

// Lazy load heavy components
const ProjectGanttChart = lazy(() => import('@/components/ProjectGanttChart'));
const Project3DViewer = lazy(() => import('@/components/Project3DViewer'));

export default function ProjectDetailPage() {
  return (
    <div>
      <ProjectHeader />

      <Suspense fallback={<Skeleton height={400} />}>
        <ProjectGanttChart projectId={projectId} />
      </Suspense>

      <Suspense fallback={<Skeleton height={600} />}>
        <Project3DViewer assetId={assetId} />
      </Suspense>
    </div>
  );
}
```

### 2. Memoization

```tsx
import { useMemo, useCallback } from 'react';

function ProjectList({ projects }: { projects: Project[] }) {
  // Memoize expensive calculations
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [projects]);

  // Memoize callbacks passed to child components
  const handleProjectClick = useCallback((projectId: string) => {
    navigate({ to: '/projects/$id', params: { id: projectId } });
  }, [navigate]);

  return (
    <div>
      {sortedProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={handleProjectClick}
        />
      ))}
    </div>
  );
}
```

### 3. Virtual Scrolling for Large Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeProjectList({ projects }: { projects: Project[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: projects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProjectCard project={projects[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing

### Component Tests

```tsx
// components/ProjectCard/ProjectCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  const mockProject: Project = {
    id: '123',
    name: 'Test Project',
    clientName: 'Test Client',
    status: 'active',
  };

  it('renders project information', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ProjectCard project={mockProject} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith('123');
  });
});
```

### Hook Tests

```tsx
// hooks/__tests__/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects } from '../useProjects';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProjects', () => {
  it('fetches projects successfully', async () => {
    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data.data)).toBe(true);
  });
});
```

---

## Best Practices

### ✅ DO:

1. **Use functional components** with hooks
2. **Type all props** with TypeScript interfaces
3. **Use TanStack Query** for server state
4. **Memoize expensive computations** with useMemo
5. **Memoize callbacks** passed to children with useCallback
6. **Use Zod** for form validation
7. **Lazy load** heavy components
8. **Write component tests** for all components
9. **Use MUI components** for consistency
10. **Handle loading and error states**

### ❌ DON'T:

1. **Don't use class components**
2. **Don't use `any` type**
3. **Don't mix server and client state**
4. **Don't forget error boundaries**
5. **Don't skip loading states**
6. **Don't inline large components**
7. **Don't forget accessibility**
8. **Don't use inline styles** (use MUI sx or styled)
9. **Don't skip prop validation**
10. **Don't forget to cleanup effects**

---

## Related Resources

- [Component Patterns](./resources/component-patterns.md)
- [State Management Guide](./resources/state-management.md)
- [Routing Patterns](./resources/routing-patterns.md)
- [Form Best Practices](./resources/form-best-practices.md)
- [Performance Optimization](./resources/performance-optimization.md)
- [Testing Components](./resources/testing-components.md)

---

**Version**: 1.0
**Last Updated**: 2025-11-08
**Status**: Active
