import { PrismaClient } from '@prisma/client';
import type { UserContext } from '../middleware/extract-user.js';

const prisma = new PrismaClient();

export interface CreateClientData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  status?: string;
}

export interface UpdateClientData {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  status?: string;
}

export interface ClientFilters {
  status?: string;
  search?: string;
}

export class ClientService {
  /**
   * Create a new client
   */
  async createClient(data: CreateClientData, user: UserContext) {
    // Check for duplicate client name within organization
    const existing = await prisma.client.findFirst({
      where: {
        name: data.name,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (existing) {
      const error = new Error('A client with this name already exists');
      (error as any).code = 'DUPLICATE_CLIENT_NAME';
      (error as any).statusCode = 409;
      throw error;
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        organizationId: user.organizationId,
        status: data.status || 'active',
        createdBy: user.userId,
        updatedBy: user.userId,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    return client;
  }

  /**
   * Get client by ID
   */
  async getClientById(id: string, user: UserContext) {
    const client = await prisma.client.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
      include: {
        projects: {
          where: { deletedAt: null },
          select: {
            id: true,
            projectNumber: true,
            name: true,
            status: true,
            startDate: true,
            targetEndDate: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Most recent 10 projects
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!client) {
      const error = new Error('Client not found');
      (error as any).statusCode = 404;
      throw error;
    }

    return client;
  }

  /**
   * List clients with filtering and pagination
   */
  async listClients(
    filters: ClientFilters,
    pagination: { page?: number; limit?: number },
    user: UserContext
  ) {
    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organizationId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { contactPerson: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Update client
   */
  async updateClient(id: string, data: UpdateClientData, user: UserContext) {
    const existing = await prisma.client.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      const error = new Error('Client not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // If changing name, check for duplicates
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.client.findFirst({
        where: {
          name: data.name,
          organizationId: user.organizationId,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (duplicate) {
        const error = new Error('A client with this name already exists');
        (error as any).code = 'DUPLICATE_CLIENT_NAME';
        (error as any).statusCode = 409;
        throw error;
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...data,
        updatedBy: user.userId,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    return client;
  }

  /**
   * Soft delete client
   */
  async deleteClient(id: string, user: UserContext) {
    const existing = await prisma.client.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      const error = new Error('Client not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Check if client has active projects
    const activeProjects = await prisma.project.count({
      where: {
        clientId: id,
        status: { in: ['planning', 'in_progress'] },
        deletedAt: null,
      },
    });

    if (activeProjects > 0) {
      const error = new Error(
        'Cannot delete client with active projects. Please complete or cancel all projects first.'
      );
      (error as any).code = 'CLIENT_HAS_ACTIVE_PROJECTS';
      (error as any).statusCode = 400;
      throw error;
    }

    await prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: user.userId,
      },
    });

    return { message: 'Client deleted successfully' };
  }

  /**
   * Get client statistics
   */
  async getClientStats(user: UserContext) {
    const stats = await prisma.client.groupBy({
      by: ['status'],
      where: {
        organizationId: user.organizationId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    const total = await prisma.client.count({
      where: {
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    return {
      total,
      byStatus: stats.reduce(
        (acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}
