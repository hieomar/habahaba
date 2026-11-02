import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createUserSchema, updateUserSchema, updatePermissionsSchema } from '../validations/admin.validation.js';

const router = Router();

router.use(authenticateJWT);

// Users Management
router.get('/users', checkPermission('User Management', 'canRead'), adminController.getUsers);
router.post('/users', checkPermission('User Management', 'canCreate'), validate(createUserSchema), adminController.createUser);
router.put('/users/:id', checkPermission('User Management', 'canUpdate'), validate(updateUserSchema), adminController.updateUser);

// Roles & Permissions Management
router.get('/roles', checkPermission('Role Management', 'canRead'), adminController.getRoles);
router.put('/roles/:id/permissions', checkPermission('Permission Management', 'canUpdate'), validate(updatePermissionsSchema), adminController.updateRolePermissions);

export default router;
