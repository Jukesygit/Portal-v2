import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { extractUser, requirePermission } from '../middleware/extract-user.js';

const router = Router();
const projectController = new ProjectController();

// All routes require user authentication (enforced by API Gateway)
router.use(extractUser);

// Project stats
router.get(
  '/stats',
  requirePermission('project:read'),
  (req, res, next) => {
    projectController.getStats(req, res).catch(next);
  }
);

// List projects
router.get(
  '/',
  requirePermission('project:read'),
  (req, res, next) => {
    projectController.list(req, res).catch(next);
  }
);

// Create project
router.post(
  '/',
  requirePermission('project:create'),
  (req, res, next) => {
    projectController.create(req, res).catch(next);
  }
);

// Get project by ID
router.get(
  '/:id',
  requirePermission('project:read'),
  (req, res, next) => {
    projectController.getById(req, res).catch(next);
  }
);

// Update project
router.patch(
  '/:id',
  requirePermission('project:update'),
  (req, res, next) => {
    projectController.update(req, res).catch(next);
  }
);

// Delete project
router.delete(
  '/:id',
  requirePermission('project:delete'),
  (req, res, next) => {
    projectController.delete(req, res).catch(next);
  }
);

export default router;
