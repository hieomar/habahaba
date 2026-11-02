import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCustomerSchema } from '../validations/customer.validation.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', customerController.getCustomers);

router.post(
  '/',
  checkPermission('Dispatch Management', 'canCreate'),
  validate(createCustomerSchema),
  customerController.createCustomer
);

export default router;
