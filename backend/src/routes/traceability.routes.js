import { Router } from 'express';
import * as traceabilityController from '../controllers/traceability.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { traceQuerySchema } from '../validations/traceability.validation.js';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/trace',
  checkPermission('Traceability Intelligence', 'canRead'),
  validate(traceQuerySchema),
  traceabilityController.traceGrainLineage
);

export default router;
