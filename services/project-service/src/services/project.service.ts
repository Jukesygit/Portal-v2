import { PrismaClient } from '@prisma/client';
import type { UserContext } from '../middleware/extract-user.js';

const prisma = new PrismaClient();

export interface CreateProjectData {
  projectNumber: string;
  name: string;
  description?: string;
  clientId: string;
  startDate: Date;
  targetEndDate?: Date;
  status?: string;
  priority?: string;
  settings?: Record<string, any>;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  clientId?: string;
  startDate?: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  status?: string;
  priority?: string;
  settings?: Record<string, any>;
}

export interface ProjectFilters {
  status?: string;
  priority?: string;
  clientId?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData, user: UserContext) {
    // Validate user has access to the client
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new Error('Client not found or access denied');
    }

    // Check for duplicate project number within organization
    const existing = await prisma.project.findFirst({
      where: {
        projectNumber: data.projectNumber,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (existing) {
      const error = new Error('Project number already exists');
      (error as any).code = 'DUPLICATE_PROJECT_NUMBER';
      (error as any).statusCode = 409;
      throw error;
    }

    const project = await prisma.project.create({
      data: {
        ...data,
        organizationId: user.organizationId,
        status: data.status || 'planning',
        priority: data.priority || 'medium',
        settings: data.settings || {},
        createdBy: user.userId,
        updatedBy: user.userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
          },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
    });

    return project;
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string, user: UserContext) {
    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
        workOrders: {
          where: { deletedAt: null },
          select: {
            id: true,
            woNumber: true,
            description: true,
            status: true,
            startDate: true,
            targetEndDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
    });

    if (!project) {
      const error = new Error('Project not found');
      (error as any).statusCode = 404;
      throw error;
    }

    return project;
  }

  /**
   * List projects with filtering and pagination
   */
  async listProjects(
    filters: ProjectFilters,
    pagination: PaginationParams,
    user: UserContext
  ) {
    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: user.organizationId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.search) {
      where.OR = [
        { projectNumber: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
            },
          },
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: projects,
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
   * Update project
   */
  async updateProject(id: string, data: UpdateProjectData, user: UserContext) {
    // Verify project exists and user has access
    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      const error = new Error('Project not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // If changing client, verify new client exists and is accessible
    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: data.clientId,
          organizationId: user.organizationId,
          deletedAt: null,
        },
      });

      if (!client) {
        throw new Error('Client not found or access denied');
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        updatedBy: user.userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
          },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
    });

    return project;
  }

  /**
   * Soft delete project
   */
  async deleteProject(id: string, user: UserContext) {
    // Verify project exists and user has access
    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      const error = new Error('Project not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Check if project has active work orders
    const activeWorkOrders = await prisma.workOrder.count({
      where: {
        projectId: id,
        status: { in: ['pending', 'in_progress'] },
        deletedAt: null,
      },
    });

    if (activeWorkOrders > 0) {
      const error = new Error(
        'Cannot delete project with active work orders. Please complete or cancel all work orders first.'
      );
      (error as any).code = 'PROJECT_HAS_ACTIVE_WORK_ORDERS';
      (error as any).statusCode = 400;
      throw error;
    }

    await prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: user.userId,
      },
    });

    return { message: 'Project deleted successfully' };
  }

  /**
   * Get project statistics
   */
  async getProjectStats(user: UserContext) {
    const stats = await prisma.project.groupBy({
      by: ['status'],
      where: {
        organizationId: user.organizationId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    const total = await prisma.project.count({
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
