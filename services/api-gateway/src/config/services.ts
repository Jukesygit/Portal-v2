import dotenv from 'dotenv';

dotenv.config();

export interface ServiceConfig {
  name: string;
  url: string;
  path: string;
  stripPath?: boolean;
  requireAuth?: boolean;
}

export const SERVICES: ServiceConfig[] = [
  {
    name: 'auth-service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    path: '/api/auth',
    stripPath: true,
    requireAuth: false, // Auth endpoints don't require authentication
  },
  {
    name: 'project-service',
    url: process.env.PROJECT_SERVICE_URL || 'http://localhost:4002',
    path: '/api/projects',
    stripPath: true,
    requireAuth: true,
  },
  {
    name: 'inspection-service',
    url: process.env.INSPECTION_SERVICE_URL || 'http://localhost:4003',
    path: '/api/inspections',
    stripPath: true,
    requireAuth: true,
  },
];

export const getServiceByPath = (path: string): ServiceConfig | undefined => {
  return SERVICES.find((service) => path.startsWith(service.path));
};
