import { Router } from 'express';
import * as purchaseController from '../controllers/purchase.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPurchaseSchema, purchaseQuerySchema, updatePaymentSchema } from '../validations/purchase.validation.js';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  checkPermission('Commodity Purchases', 'canRead'),
  validate(purchaseQuerySchema),
  purchaseController.getPurchases
);

router.post(
  '/',
  checkPermission('Commodity Purchases', 'canCreate'),
  validate(createPurchaseSchema),
  purchaseController.createPurchase
);

router.get('/:id', checkPermission('Commodity Purchases', 'canRead'), purchaseController.getPurchaseById);

router.post(
  '/:id/pay',
  checkPermission('Commodity Purchases', 'canUpdate'),
  validate(updatePaymentSchema),
  purchaseController.updatePaymentStatus
);

export default router;
