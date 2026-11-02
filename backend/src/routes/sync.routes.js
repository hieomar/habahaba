import { Router } from 'express';
import * as syncController from '../controllers/sync.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { syncPushSchema } from '../validations/sync.validation.js';

const router = Router();

router.use(authenticateJWT);

router.post('/push', validate(syncPushSchema), syncController.pushSync);
router.get('/pull', syncController.pullSeed);
router.get('/logs', checkPermission('Mobile Data Sync', 'canRead'), syncController.getSyncLogs);

export default router;
