import type { Request, Response } from 'express';
import { z } from 'zod';
import { ClientService } from '../services/client.service.js';

const clientService = new ClientService();

// Validation schemas
const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  contactPerson: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
});

const updateClientSchema = createClientSchema.partial();

const listClientsSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export class ClientController {
  async create(req: Request, res: Response): Promise<void> {
    const data = createClientSchema.parse(req.body);
    const client = await clientService.createClient(data, req.user!);

    res.status(201).json(client);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const client = await clientService.getClientById(id, req.user!);

    res.status(200).json(client);
  }

  async list(req: Request, res: Response): Promise<void> {
    const query = listClientsSchema.parse(req.query);
    const { page, limit, ...filters } = query;

    const result = await clientService.listClients(
      filters,
      { page, limit },
      req.user!
    );

    res.status(200).json(result);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = updateClientSchema.parse(req.body);

    const client = await clientService.updateClient(id, data, req.user!);

    res.status(200).json(client);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await clientService.deleteClient(id, req.user!);

    res.status(200).json(result);
  }

  async getStats(req: Request, res: Response): Promise<void> {
    const stats = await clientService.getClientStats(req.user!);

    res.status(200).json(stats);
  }
}
