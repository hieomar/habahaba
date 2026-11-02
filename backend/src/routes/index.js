import { Router } from 'express';
import authRoutes from './auth.routes.js';
import farmerRoutes from './farmer.routes.js';
import farmRoutes from './farm.routes.js';
import purchaseRoutes from './purchase.routes.js';
import grnRoutes from './grn.routes.js';
import inventoryRoutes from './inventory.routes.js';
import batchRoutes from './batch.routes.js';
import customerRoutes from './customer.routes.js';
import dispatchRoutes from './dispatch.routes.js';
import traceabilityRoutes from './traceability.routes.js';
import syncRoutes from './sync.routes.js';
import adminRoutes from './admin.routes.js';
import masterdataRoutes from './masterdata.routes.js';

const router = Router();

// Mount Module Routes
router.use('/auth', authRoutes);
router.use('/farmers', farmerRoutes);
router.use('/farms', farmRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/grns', grnRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/batches', batchRoutes);
router.use('/customers', customerRoutes);
router.use('/dispatches', dispatchRoutes);
router.use('/traceability', traceabilityRoutes);
router.use('/sync', syncRoutes);
router.use('/admin', adminRoutes);
router.use('/', masterdataRoutes);

export default router;
