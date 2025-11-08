import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request, Response, NextFunction } from 'express';
import { SERVICES, getServiceByPath } from '../config/services.js';
import type { ServiceConfig } from '../config/services.js';

export function createServiceProxy(service: ServiceConfig) {
  return createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    pathRewrite: service.stripPath
      ? (path) => {
          // Remove the gateway path prefix and forward to service
          // e.g., /api/projects/123 -> /projects/123
          return path.replace(service.path, '');
        }
      : undefined,
    onProxyReq: (proxyReq, req: Request) => {
      // Forward user information to downstream services
      if ((req as any).user) {
        const user = (req as any).user;
        proxyReq.setHeader('X-User-Id', user.sub);
        proxyReq.setHeader('X-User-Email', user.email);
        proxyReq.setHeader('X-User-Role', user.role);
        proxyReq.setHeader('X-Organization-Id', user.organizationId);
        proxyReq.setHeader('X-User-Permissions', JSON.stringify(user.permissions));
      }

      // Log proxied request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Gateway] Proxying ${req.method} ${req.path} -> ${service.url}`);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Gateway] Response from ${service.name}: ${proxyRes.statusCode}`
        );
      }
    },
    onError: (err, req, res) => {
      console.error(`[Gateway] Proxy error for ${service.name}:`, err.message);

      if (!res.headersSent) {
        (res as Response).status(502).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `${service.name} is currently unavailable`,
            timestamp: new Date().toISOString(),
          },
        });
      }
    },
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  });
}

// Route handler that determines which service to proxy to
export function serviceRouter(req: Request, res: Response, next: NextFunction) {
  const service = getServiceByPath(req.path);

  if (!service) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'No service found for this path',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Attach service info to request for later use
  (req as any).targetService = service;
  next();
}
