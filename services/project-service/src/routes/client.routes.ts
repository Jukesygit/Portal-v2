import { Router } from 'express';
import { ClientController } from '../controllers/client.controller.js';
import { extractUser, requirePermission } from '../middleware/extract-user.js';

const router = Router();
const clientController = new ClientController();

// All routes require user authentication (enforced by API Gateway)
router.use(extractUser);

// Client stats
router.get(
  '/stats',
  requirePermission('client:read'),
  (req, res, next) => {
    clientController.getStats(req, res).catch(next);
  }
);

// List clients
router.get(
  '/',
  requirePermission('client:read'),
  (req, res, next) => {
    clientController.list(req, res).catch(next);
  }
);

// Create client
router.post(
  '/',
  requirePermission('client:create'),
  (req, res, next) => {
    clientController.create(req, res).catch(next);
  }
);

// Get client by ID
router.get(
  '/:id',
  requirePermission('client:read'),
  (req, res, next) => {
    clientController.getById(req, res).catch(next);
  }
);

// Update client
router.patch(
  '/:id',
  requirePermission('client:update'),
  (req, res, next) => {
    clientController.update(req, res).catch(next);
  }
);

// Delete client
router.delete(
  '/:id',
  requirePermission('client:delete'),
  (req, res, next) => {
    clientController.delete(req, res).catch(next);
  }
);

export default router;
