import { z } from 'zod';

// Project status
export const ProjectStatus = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

// Project type
export interface Project {
  id: string;
  organizationId: string;
  projectNumber: string;
  name: string;
  clientId: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  budgetAmount: number | null;
  actualCost: number | null;
  scope: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: string;
  updatedBy: string | null;
}

// Zod schemas
export const projectStatusSchema = z.enum([
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
]);

export const createProjectSchema = z.object({
  name: z.string().min(3),
  clientId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budgetAmount: z.number().positive().optional(),
  scope: z.record(z.unknown()).optional(),
});

export type CreateProjectDTO = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(3).optional(),
  clientId: z.string().uuid().nullable().optional(),
  status: projectStatusSchema.optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  budgetAmount: z.number().positive().nullable().optional(),
  actualCost: z.number().nonnegative().nullable().optional(),
  scope: z.record(z.unknown()).optional(),
});

export type UpdateProjectDTO = z.infer<typeof updateProjectSchema>;

// Project filters
export const projectFiltersSchema = z.object({
  status: projectStatusSchema.optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
});

export type ProjectFilters = z.infer<typeof projectFiltersSchema>;
