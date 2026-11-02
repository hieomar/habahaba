import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  checkPermission('Inventory Management', 'canRead'),
  inventoryController.getInventory
);

router.get(
  '/movements',
  checkPermission('Inventory Management', 'canRead'),
  inventoryController.getStockMovements
);

export default router;
