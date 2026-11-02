import { Router } from 'express';
import * as masterdataController from '../controllers/masterdata.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticateJWT);

// Reference Data
router.get('/master-data/commodities', masterdataController.getCommodities);
router.get('/master-data/ipcs', masterdataController.getIPCs);
router.get('/master-data/warehouses', masterdataController.getWarehouses);
router.get('/master-data/marketing-centres', masterdataController.getMarketingCentres);

// Audit & Notifications
router.get('/audit-logs', checkPermission('Audit Logs', 'canRead'), masterdataController.getAuditLogs);
router.get('/notifications', masterdataController.getNotifications);

// Analytics Reports
router.get('/reports/summary', checkPermission('Reports & Analytics', 'canRead'), masterdataController.getSummaryReport);

export default router;
