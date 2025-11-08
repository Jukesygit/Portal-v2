import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

// Types
export interface WorkOrder {
  id: string;
  organizationId: string;
  woNumber: string;
  projectId: string;
  description: string;
  startDate: string;
  targetEndDate?: string;
  actualEndDate?: string;
  status: 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt?: string;
  project: {
    id: string;
    projectNumber: string;
    name: string;
    client?: {
      id: string;
      name: string;
    };
  };
  assignedToUser?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface WorkOrderFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CreateWorkOrderData {
  woNumber: string;
  projectId: string;
  description: string;
  startDate: string;
  targetEndDate?: string;
  status?: 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  settings?: Record<string, any>;
}

export interface UpdateWorkOrderData extends Partial<Omit<CreateWorkOrderData, 'woNumber' | 'projectId'>> {
  actualEndDate?: string;
}

export interface WorkOrderStats {
  total: number;
  byStatus: Record<string, number>;
}

// Query keys
export const workOrderKeys = {
  all: ['work-orders'] as const,
  lists: () => [...workOrderKeys.all, 'list'] as const,
  list: (filters: WorkOrderFilters) => [...workOrderKeys.lists(), filters] as const,
  details: () => [...workOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...workOrderKeys.details(), id] as const,
  stats: (projectId?: string) => [...workOrderKeys.all, 'stats', projectId] as const,
};

// API functions
const fetchWorkOrders = async (filters: WorkOrderFilters): Promise<PaginatedResponse<WorkOrder>> => {
  const response = await apiClient.get('/work-orders', { params: filters });
  return response.data;
};

const fetchWorkOrderById = async (id: string): Promise<WorkOrder> => {
  const response = await apiClient.get(`/work-orders/${id}`);
  return response.data;
};

const createWorkOrder = async (data: CreateWorkOrderData): Promise<WorkOrder> => {
  const response = await apiClient.post('/work-orders', data);
  return response.data;
};

const updateWorkOrder = async ({ id, data }: { id: string; data: UpdateWorkOrderData }): Promise<WorkOrder> => {
  const response = await apiClient.patch(`/work-orders/${id}`, data);
  return response.data;
};

const deleteWorkOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`/work-orders/${id}`);
};

const fetchWorkOrderStats = async (projectId?: string): Promise<WorkOrderStats> => {
  const response = await apiClient.get('/work-orders/stats', {
    params: projectId ? { projectId } : undefined,
  });
  return response.data;
};

// Hooks
export function useWorkOrders(filters: WorkOrderFilters = {}) {
  return useQuery({
    queryKey: workOrderKeys.list(filters),
    queryFn: () => fetchWorkOrders(filters),
  });
}

export function useWorkOrder(id: string | undefined) {
  return useQuery({
    queryKey: workOrderKeys.detail(id!),
    queryFn: () => fetchWorkOrderById(id!),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useWorkOrderStats(projectId?: string) {
  return useQuery({
    queryKey: workOrderKeys.stats(projectId),
    queryFn: () => fetchWorkOrderStats(projectId),
  });
}
