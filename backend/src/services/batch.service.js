import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const generateBatchNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.batch.count();
  const sequence = String(count + 1).padStart(3, '0');
  return `BATCH-${year}-${sequence}`;
};

export const createBatch = async (batchData, officerUser) => {
  return await prisma.$transaction(async (tx) => {
    const warehouse = await tx.warehouse.findUnique({ where: { id: batchData.warehouseId } });
    if (!warehouse) throw new NotFoundError(`Warehouse '${batchData.warehouseId}' not found`);

    const ipc = await tx.iPC.findUnique({ where: { id: batchData.ipcId } });
    if (!ipc) throw new NotFoundError(`IPC '${batchData.ipcId}' not found`);

    const commodity = await tx.commodity.findUnique({ where: { id: batchData.commodityId } });
    if (!commodity) throw new NotFoundError(`Commodity '${batchData.commodityId}' not found`);

    // Verify linked GRNs
    const grns = await tx.gRN.findMany({
      where: { id: { in: batchData.grnIds } },
    });

    if (grns.length !== batchData.grnIds.length) {
      throw new BadRequestError('One or more linked GRNs were not found');
    }

    const batchNumber = await generateBatchNumber();

    // Create Batch
    const batch = await tx.batch.create({
      data: {
        batchNumber,
        warehouseId: warehouse.id,
        ipcId: ipc.id,
        commodityId: commodity.id,
        numberOfBags: batchData.numberOfBags,
        totalWeightKg: batchData.totalWeightKg,
        storageLocation: batchData.storageLocation,
        status: 'ACTIVE',
        notes: batchData.notes || null,
        createdBy: officerUser ? officerUser.name : 'System',
      },
    });

    // Create BatchGRN Join Records
    const batchGRNData = grns.map((g) => ({
      batchId: batch.id,
      grnId: g.id,
    }));

    await tx.batchGRN.createMany({
      data: batchGRNData,
    });

    // Audit Trail
    await tx.auditLog.create({
      data: {
        userId: officerUser ? officerUser.id : null,
        userName: officerUser ? officerUser.name : 'System',
        action: 'CREATE',
        module: 'Batch Management',
        recordId: batch.id,
        details: `Created batch ${batchNumber} (${batch.totalWeightKg}kg ${commodity.name}) stored at ${batch.storageLocation}`,
      },
    });

    return await tx.batch.findUnique({
      where: { id: batch.id },
      include: {
        warehouse: true,
        ipc: true,
        commodity: true,
        batchGRNs: { include: { grn: true } },
      },
    });
  });
};

export const getBatches = async (queryFilters) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const where = {};
  if (queryFilters.warehouseId) where.warehouseId = queryFilters.warehouseId;
  if (queryFilters.ipcId) where.ipcId = queryFilters.ipcId;
  if (queryFilters.commodityId) where.commodityId = queryFilters.commodityId;
  if (queryFilters.status) where.status = queryFilters.status;

  const [total, batches] = await Promise.all([
    prisma.batch.count({ where }),
    prisma.batch.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        warehouse: true,
        ipc: true,
        commodity: true,
        batchGRNs: { include: { grn: true } },
      },
    }),
  ]);

  return { batches, total, page, limit };
};

export const getBatchById = async (id) => {
  const batch = await prisma.batch.findFirst({
    where: { OR: [{ id }, { batchNumber: id }] },
    include: {
      warehouse: true,
      ipc: true,
      commodity: true,
      batchGRNs: {
        include: {
          grn: {
            include: {
              purchase: { include: { farmer: true } },
            },
          },
        },
      },
      dispatches: { include: { customer: true } },
    },
  });

  if (!batch) {
    throw new NotFoundError(`Batch '${id}' not found`);
  }

  return batch;
};
