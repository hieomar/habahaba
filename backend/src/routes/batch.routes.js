import { Router } from 'express';
import * as batchController from '../controllers/batch.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createBatchSchema, batchQuerySchema } from '../validations/batch.validation.js';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  checkPermission('Batch Management', 'canRead'),
  validate(batchQuerySchema),
  batchController.getBatches
);

router.post(
  '/',
  checkPermission('Batch Management', 'canCreate'),
  validate(createBatchSchema),
  batchController.createBatch
);

router.get('/:id', checkPermission('Batch Management', 'canRead'), batchController.getBatchById);

export default router;
