import { Router } from 'express';
import * as dispatchController from '../controllers/dispatch.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createDispatchSchema, updateDeliverySchema, dispatchQuerySchema } from '../validations/dispatch.validation.js';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  checkPermission('Dispatch Management', 'canRead'),
  validate(dispatchQuerySchema),
  dispatchController.getDispatches
);

router.post(
  '/',
  checkPermission('Dispatch Management', 'canCreate'),
  validate(createDispatchSchema),
  dispatchController.createDispatch
);

router.get('/:id', checkPermission('Dispatch Management', 'canRead'), dispatchController.getDispatchById);

router.post(
  '/:id/deliver',
  checkPermission('Dispatch Management', 'canUpdate'),
  validate(updateDeliverySchema),
  dispatchController.markDispatchDelivered
);

export default router;
