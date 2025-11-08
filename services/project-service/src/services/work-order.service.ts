import { PrismaClient } from '@prisma/client';
import type { UserContext } from '../middleware/extract-user.js';

const prisma = new PrismaClient();

export interface CreateWorkOrderData {
  woNumber: string;
  projectId: string;
  description: string;
  startDate: Date;
  targetEndDate?: Date;
  status?: string;
  priority?: string;
  assignedTo?: string;
  settings?: Record<string, any>;
}

export interface UpdateWorkOrderData {
  description?: string;
  startDate?: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  status?: string;
  priority?: string;
  assignedTo?: string;
  settings?: Record<string, any>;
}

export interface WorkOrderFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
}

export class WorkOrderService {
  /**
   * Create a new work order
   */
  async createWorkOrder(data: CreateWorkOrderData, user: UserContext) {
    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // Check for duplicate WO number within project
    const existing = await prisma.workOrder.findFirst({
      where: {
        woNumber: data.woNumber,
        projectId: data.projectId,
        deletedAt: null,
      },
    });

    if (existing) {
      const error = new Error('Work order number already exists in this project');
      (error as any).code = 'DUPLICATE_WO_NUMBER';
      (error as any).statusCode = 409;
      throw error;
    }

    // If assignedTo is provided, verify user exists in organization
    if (data.assignedTo) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assignedTo,
          organizationId: user.organizationId,
          deletedAt: null,
        },
      });

      if (!assignee) {
        throw new Error('Assigned user not found or access denied');
      }
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        ...data,
        organizationId: user.organizationId,
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        settings: data.settings || {},
        createdBy: user.userId,
        updatedBy: user.userId,
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return workOrder;
  }

  /**
   * Get work order by ID
   */
  async getWorkOrderById(id: string, user: UserContext) {
    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assignedToUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!workOrder) {
      const error = new Error('Work order not found');
      (error as any).statusCode = 404;
      throw error;
    }

    return workOrder;
  }

  /**
   * List work orders with filtering and pagination
   */
  async listWorkOrders(
    filters: WorkOrderFilters,
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

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.search) {
      where.OR = [
        { woNumber: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              projectNumber: true,
              name: true,
            },
          },
          assignedToUser: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: workOrders,
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
   * Update work order
   */
  async updateWorkOrder(id: string, data: UpdateWorkOrderData, user: UserContext) {
    const existing = await prisma.workOrder.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      const error = new Error('Work order not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // If changing assignedTo, verify new user exists
    if (data.assignedTo) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assignedTo,
          organizationId: user.organizationId,
          deletedAt: null,
        },
      });

      if (!assignee) {
        throw new Error('Assigned user not found or access denied');
      }
    }

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        ...data,
        updatedBy: user.userId,
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return workOrder;
  }

  /**
   * Soft delete work order
   */
  async deleteWorkOrder(id: string, user: UserContext) {
    const existing = await prisma.workOrder.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      const error = new Error('Work order not found');
      (error as any).statusCode = 404;
      throw error;
    }

    await prisma.workOrder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: user.userId,
      },
    });

    return { message: 'Work order deleted successfully' };
  }

  /**
   * Get work order statistics
   */
  async getWorkOrderStats(projectId: string | undefined, user: UserContext) {
    const where: any = {
      organizationId: user.organizationId,
      deletedAt: null,
    };

    if (projectId) {
      // Verify project access
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          organizationId: user.organizationId,
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error('Project not found or access denied');
      }

      where.projectId = projectId;
    }

    const stats = await prisma.workOrder.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    const total = await prisma.workOrder.count({ where });

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
