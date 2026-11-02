import { Router } from 'express';
import * as grnController from '../controllers/grn.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGRNSchema, grnQuerySchema } from '../validations/grn.validation.js';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  checkPermission('GRN Management', 'canRead'),
  validate(grnQuerySchema),
  grnController.getGRNs
);

router.post(
  '/',
  checkPermission('GRN Management', 'canCreate'),
  validate(createGRNSchema),
  grnController.createGRN
);

router.get('/:id', checkPermission('GRN Management', 'canRead'), grnController.getGRNById);

export default router;
