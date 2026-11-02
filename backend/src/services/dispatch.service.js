import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const generateDispatchNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.dispatch.count();
  const sequence = String(count + 1).padStart(3, '0');
  return `DSP-${year}-${sequence}`;
};

export const createDispatch = async (dispatchData, officerUser) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Validate Source Warehouse
    const warehouse = await tx.warehouse.findFirst({
      where: { OR: [{ id: dispatchData.warehouseId }, { code: dispatchData.warehouseId }] },
    });
    if (!warehouse) throw new NotFoundError(`Source warehouse '${dispatchData.warehouseId}' not found`);

    // 2. Validate Batch
    const batch = await tx.batch.findFirst({
      where: { OR: [{ id: dispatchData.batchId }, { batchNumber: dispatchData.batchId }] },
      include: { commodity: true },
    });

    if (!batch) throw new NotFoundError(`Batch '${dispatchData.batchId}' not found`);
    if (batch.status === 'DISPATCHED') {
      throw new BadRequestError(`Batch '${batch.batchNumber}' has already been fully dispatched`);
    }

    // 3. Validate Customer if provided
    let customer = null;
    if (dispatchData.customerId) {
      customer = await tx.customer.findFirst({
        where: { OR: [{ id: dispatchData.customerId }, { code: dispatchData.customerId }] },
      });
    }

    const dispatchNumber = await generateDispatchNumber();

    // 4. Create Dispatch Waybill Record
    const dispatch = await tx.dispatch.create({
      data: {
        dispatchNumber,
        customerId: customer ? customer.id : null,
        warehouseId: warehouse.id,
        batchId: batch.id,
        numberOfBags: dispatchData.numberOfBags,
        quantityKg: dispatchData.quantityKg,
        dispatchDate: dispatchData.dispatchDate ? new Date(dispatchData.dispatchDate) : new Date(),
        deliveryAddress: dispatchData.deliveryAddress.trim(),
        vehicleReg: dispatchData.vehicleReg.trim().toUpperCase(),
        driverName: dispatchData.driverName.trim(),
        dispatchedById: officerUser ? officerUser.id : null,
        status: 'IN_TRANSIT',
        notes: dispatchData.notes || null,
      },
      include: {
        warehouse: true,
        batch: { include: { commodity: true } },
        customer: true,
      },
    });

    // 5. Decrement Warehouse Inventory Level
    const existingInventory = await tx.inventory.findUnique({
      where: {
        warehouseId_commodityId: {
          warehouseId: warehouse.id,
          commodityId: batch.commodityId,
        },
      },
    });

    if (existingInventory) {
      const newStockKg = Math.max(0, existingInventory.currentStockKg - dispatchData.quantityKg);
      const newBags = Math.max(0, existingInventory.numberOfBags - dispatchData.numberOfBags);
      const capacityKg = (warehouse.capacityMT || 500) * 1000;
      const newUtilization = Math.max(0, (newStockKg / capacityKg) * 100);

      await tx.inventory.update({
        where: { id: existingInventory.id },
        data: {
          currentStockKg: newStockKg,
          numberOfBags: newBags,
          utilizationPercent: newUtilization,
        },
      });
    }

    // 6. Log Outward Stock Movement
    await tx.stockMovement.create({
      data: {
        type: 'Outward',
        warehouseId: warehouse.id,
        commodity: batch.commodity.name,
        quantityKg: dispatchData.quantityKg,
        reference: dispatchNumber,
        officer: officerUser ? officerUser.name : 'System',
      },
    });

    // 7. Update Batch Status if fully dispatched
    if (batch.totalWeightKg <= dispatchData.quantityKg) {
      await tx.batch.update({
        where: { id: batch.id },
        data: { status: 'DISPATCHED' },
      });
    }

    // 8. Audit Trail
    await tx.auditLog.create({
      data: {
        userId: officerUser ? officerUser.id : null,
        userName: officerUser ? officerUser.name : 'System',
        action: 'CREATE',
        module: 'Dispatch Management',
        recordId: dispatch.id,
        details: `Issued dispatch waybill ${dispatchNumber} (${dispatchData.quantityKg}kg ${batch.commodity.name}) from ${warehouse.name} to ${customer ? customer.name : dispatchData.deliveryAddress}`,
      },
    });

    return dispatch;
  });
};

export const getDispatches = async (queryFilters) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const where = {};
  if (queryFilters.warehouseId) where.warehouseId = queryFilters.warehouseId;
  if (queryFilters.customerId) where.customerId = queryFilters.customerId;
  if (queryFilters.status) where.status = queryFilters.status;

  const [total, dispatches] = await Promise.all([
    prisma.dispatch.count({ where }),
    prisma.dispatch.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dispatchDate: 'desc' },
      include: {
        warehouse: true,
        customer: true,
        batch: { include: { commodity: true } },
        dispatchedBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return { dispatches, total, page, limit };
};

export const getDispatchById = async (id) => {
  const dispatch = await prisma.dispatch.findFirst({
    where: { OR: [{ id }, { dispatchNumber: id }] },
    include: {
      warehouse: true,
      customer: true,
      batch: {
        include: {
          commodity: true,
          batchGRNs: { include: { grn: { include: { purchase: { include: { farmer: true } } } } } },
        },
      },
      dispatchedBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!dispatch) {
    throw new NotFoundError(`Dispatch waybill '${id}' not found`);
  }

  return dispatch;
};

export const markDispatchDelivered = async (id, deliveryData, officerUser) => {
  const dispatch = await prisma.dispatch.findUnique({ where: { id } });
  if (!dispatch) throw new NotFoundError(`Dispatch waybill '${id}' not found`);

  const updated = await prisma.dispatch.update({
    where: { id },
    data: {
      status: deliveryData.status || 'DELIVERED',
      receivedBy: deliveryData.receivedBy.trim(),
      receivedDate: deliveryData.receivedDate ? new Date(deliveryData.receivedDate) : new Date(),
    },
    include: {
      customer: true,
      warehouse: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: officerUser ? officerUser.id : null,
      userName: officerUser ? officerUser.name : 'System',
      action: 'UPDATE',
      module: 'Dispatch Management',
      recordId: dispatch.id,
      details: `Marked dispatch ${dispatch.dispatchNumber} as DELIVERED to ${deliveryData.receivedBy}`,
    },
  });

  return updated;
};
