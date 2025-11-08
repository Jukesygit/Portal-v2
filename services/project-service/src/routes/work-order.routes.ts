import { Router } from 'express';
import { WorkOrderController } from '../controllers/work-order.controller.js';
import { extractUser, requirePermission } from '../middleware/extract-user.js';

const router = Router();
const workOrderController = new WorkOrderController();

// All routes require user authentication (enforced by API Gateway)
router.use(extractUser);

// Work order stats
router.get(
  '/stats',
  requirePermission('workorder:read'),
  (req, res, next) => {
    workOrderController.getStats(req, res).catch(next);
  }
);

// List work orders
router.get(
  '/',
  requirePermission('workorder:read'),
  (req, res, next) => {
    workOrderController.list(req, res).catch(next);
  }
);

// Create work order
router.post(
  '/',
  requirePermission('workorder:create'),
  (req, res, next) => {
    workOrderController.create(req, res).catch(next);
  }
);

// Get work order by ID
router.get(
  '/:id',
  requirePermission('workorder:read'),
  (req, res, next) => {
    workOrderController.getById(req, res).catch(next);
  }
);

// Update work order
router.patch(
  '/:id',
  requirePermission('workorder:update'),
  (req, res, next) => {
    workOrderController.update(req, res).catch(next);
  }
);

// Delete work order
router.delete(
  '/:id',
  requirePermission('workorder:delete'),
  (req, res, next) => {
    workOrderController.delete(req, res).catch(next);
  }
);

export default router;
