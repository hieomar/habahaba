import { Router } from 'express';
import * as farmController from '../controllers/farm.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createFarmSchema } from '../validations/farm.validation.js';

const router = Router();

router.use(authenticateJWT);

router.post(
  '/',
  checkPermission('Farm Management', 'canCreate'),
  validate(createFarmSchema),
  farmController.createFarm
);

router.get(
  '/farmer/:farmerId',
  checkPermission('Farm Management', 'canRead'),
  farmController.getFarmsByFarmer
);

export default router;
