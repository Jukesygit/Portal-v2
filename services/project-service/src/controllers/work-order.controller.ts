import type { Request, Response } from 'express';
import { z } from 'zod';
import { WorkOrderService } from '../services/work-order.service.js';

const workOrderService = new WorkOrderService();

// Validation schemas
const createWorkOrderSchema = z.object({
  woNumber: z.string().min(1).max(50),
  projectId: z.string().uuid(),
  description: z.string().min(1),
  startDate: z.coerce.date(),
  targetEndDate: z.coerce.date().optional(),
  status: z.enum(['pending', 'in_progress', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedTo: z.string().uuid().optional(),
  settings: z.record(z.any()).optional(),
});

const updateWorkOrderSchema = createWorkOrderSchema
  .partial()
  .omit({ woNumber: true, projectId: true })
  .extend({
    actualEndDate: z.coerce.date().optional(),
  });

const listWorkOrdersSchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export class WorkOrderController {
  async create(req: Request, res: Response): Promise<void> {
    const data = createWorkOrderSchema.parse(req.body);
    const workOrder = await workOrderService.createWorkOrder(data, req.user!);

    res.status(201).json(workOrder);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const workOrder = await workOrderService.getWorkOrderById(id, req.user!);

    res.status(200).json(workOrder);
  }

  async list(req: Request, res: Response): Promise<void> {
    const query = listWorkOrdersSchema.parse(req.query);
    const { page, limit, ...filters } = query;

    const result = await workOrderService.listWorkOrders(
      filters,
      { page, limit },
      req.user!
    );

    res.status(200).json(result);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = updateWorkOrderSchema.parse(req.body);

    const workOrder = await workOrderService.updateWorkOrder(id, data, req.user!);

    res.status(200).json(workOrder);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await workOrderService.deleteWorkOrder(id, req.user!);

    res.status(200).json(result);
  }

  async getStats(req: Request, res: Response): Promise<void> {
    const { projectId } = req.query as { projectId?: string };
    const stats = await workOrderService.getWorkOrderStats(projectId, req.user!);

    res.status(200).json(stats);
  }
}
