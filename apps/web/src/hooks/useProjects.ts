import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

// Types
export interface Project {
  id: string;
  organizationId: string;
  projectNumber: string;
  name: string;
  description?: string;
  clientId: string;
  startDate: string;
  targetEndDate?: string;
  actualEndDate?: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt?: string;
  client: {
    id: string;
    name: string;
    contactPerson?: string;
  };
  _count: {
    workOrders: number;
  };
  workOrders?: Array<{
    id: string;
    woNumber: string;
    description: string;
    status: string;
    startDate: string;
    targetEndDate?: string;
  }>;
}

export interface ProjectFilters {
  status?: string;
  priority?: string;
  clientId?: string;
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

export interface CreateProjectData {
  projectNumber: string;
  name: string;
  description?: string;
  clientId: string;
  startDate: string;
  targetEndDate?: string;
  status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  actualEndDate?: string;
}

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: () => [...projectKeys.all, 'stats'] as const,
};

// Hooks
export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Project>>(
        '/projects',
        { params: filters }
      );
      return response;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Project>(`/projects/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

export function useProjectStats() {
  return useQuery({
    queryKey: projectKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get<{
        total: number;
        byStatus: Record<string, number>;
      }>('/projects/stats');
      return response;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await apiClient.post<Project>('/projects', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectData) => {
      const response = await apiClient.patch<Project>(`/projects/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string }>(
        `/projects/${id}`
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}
