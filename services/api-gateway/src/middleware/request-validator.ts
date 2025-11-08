import type { Request, Response, NextFunction } from 'express';

// Validate request size limits
export function validateRequestSize(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const contentLength = req.headers['content-length'];

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (size > maxSize) {
      res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload exceeds maximum size of 10MB',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
  }

  next();
}

// Validate content type for POST/PUT/PATCH requests
export function validateContentType(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const methods = ['POST', 'PUT', 'PATCH'];

  if (methods.includes(req.method)) {
    const contentType = req.headers['content-type'];

    if (!contentType) {
      res.status(400).json({
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type header is required for this request',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Allow JSON and multipart/form-data (for file uploads)
    const allowedTypes = ['application/json', 'multipart/form-data'];
    const isAllowed = allowedTypes.some((type) => contentType.includes(type));

    if (!isAllowed) {
      res.status(415).json({
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'Content-Type must be application/json or multipart/form-data',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
  }

  next();
}

// Validate required headers
export function validateHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check for potentially malicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url',
  ];

  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      console.warn(`[Gateway] Suspicious header detected: ${header}`);
      // Remove suspicious headers
      delete req.headers[header];
    }
  }

  next();
}

// Sanitize query parameters
export function sanitizeQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        const sanitized = value
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();

        req.query[key] = sanitized;
      }
    }
  }

  next();
}

// Request logging
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`;

    if (process.env.NODE_ENV === 'development') {
      console.log(logMessage);
    }
  });

  next();
}
