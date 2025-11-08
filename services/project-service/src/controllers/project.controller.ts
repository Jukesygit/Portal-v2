import type { Request, Response } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/project.service.js';

const projectService = new ProjectService();

// Validation schemas
const createProjectSchema = z.object({
  projectNumber: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  clientId: z.string().uuid(),
  startDate: z.coerce.date(),
  targetEndDate: z.coerce.date().optional(),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  settings: z.record(z.any()).optional(),
});

const updateProjectSchema = createProjectSchema.partial().omit({ projectNumber: true });

const listProjectsSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export class ProjectController {
  async create(req: Request, res: Response): Promise<void> {
    const data = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(data, req.user!);

    res.status(201).json(project);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const project = await projectService.getProjectById(id, req.user!);

    res.status(200).json(project);
  }

  async list(req: Request, res: Response): Promise<void> {
    const query = listProjectsSchema.parse(req.query);
    const { page, limit, ...filters } = query;

    const result = await projectService.listProjects(
      filters,
      { page, limit },
      req.user!
    );

    res.status(200).json(result);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = updateProjectSchema.parse(req.body);

    const project = await projectService.updateProject(id, data, req.user!);

    res.status(200).json(project);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await projectService.deleteProject(id, req.user!);

    res.status(200).json(result);
  }

  async getStats(req: Request, res: Response): Promise<void> {
    const stats = await projectService.getProjectStats(req.user!);

    res.status(200).json(stats);
  }
}
