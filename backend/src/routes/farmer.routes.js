import { Router } from 'express';
import * as farmerController from '../controllers/farmer.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createFarmerSchema, updateFarmerSchema, farmerQuerySchema } from '../validations/farmer.validation.js';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  checkPermission('Farmer Management', 'canRead'),
  validate(farmerQuerySchema),
  farmerController.getFarmers
);

router.post(
  '/',
  checkPermission('Farmer Management', 'canCreate'),
  validate(createFarmerSchema),
  farmerController.createFarmer
);

router.get('/groups', checkPermission('Farmer Management', 'canRead'), farmerController.getFarmerGroups);

router.get('/:id', checkPermission('Farmer Management', 'canRead'), farmerController.getFarmerById);

router.put(
  '/:id',
  checkPermission('Farmer Management', 'canUpdate'),
  validate(updateFarmerSchema),
  farmerController.updateFarmer
);

router.get('/:id/history', checkPermission('Farmer Management', 'canRead'), farmerController.getFarmerHistory);

export default router;
