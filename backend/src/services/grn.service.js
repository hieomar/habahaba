import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const generateGRNNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.gRN.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `GRN-${year}-${sequence}`;
};

export const createGRN = async (grnData, receivingOfficerUser) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Validate Warehouse
    const warehouse = await tx.warehouse.findFirst({
      where: { OR: [{ id: grnData.warehouseId }, { code: grnData.warehouseId }] },
    });

    if (!warehouse) {
      throw new NotFoundError(`Warehouse '${grnData.warehouseId}' not found`);
    }

    // 2. Validate Purchase if provided
    let purchase = null;
    let commodityId = null;

    if (grnData.purchaseId) {
      purchase = await tx.purchase.findFirst({
        where: { OR: [{ id: grnData.purchaseId }, { receiptNumber: grnData.purchaseId }] },
        include: { commodity: true },
      });

      if (!purchase) {
        throw new NotFoundError(`Purchase receipt '${grnData.purchaseId}' not found`);
      }
      commodityId = purchase.commodityId;
    } else {
      // Default to Maize if standalone GRN
      const firstComm = await tx.commodity.findFirst();
      commodityId = firstComm ? firstComm.id : null;
    }

    const grnNumber = await generateGRNNumber();

    // 3. Create GRN Record
    const grn = await tx.gRN.create({
      data: {
        grnNumber,
        purchaseId: purchase ? purchase.id : null,
        warehouseId: warehouse.id,
        receivingOfficerId: receivingOfficerUser ? receivingOfficerUser.id : null,
        receivingDate: new Date(),
        grossWeight: grnData.grossWeight,
        tareWeight: grnData.tareWeight,
        netWeight: grnData.netWeight,
        moistureContentPercent: grnData.moistureContentPercent || null,
        acceptedQuantity: grnData.acceptedQuantity,
        rejectedQuantity: grnData.rejectedQuantity || 0,
        rejectionReason: grnData.rejectionReason || null,
      },
      include: {
        warehouse: true,
        purchase: { include: { farmer: true, commodity: true } },
      },
    });

    // 4. Increment Warehouse Inventory Level
    if (commodityId) {
      const existingInventory = await tx.inventory.findUnique({
        where: {
          warehouseId_commodityId: {
            warehouseId: warehouse.id,
            commodityId,
          },
        },
      });

      const capacityKg = (warehouse.capacityMT || 500) * 1000;
      const currentStockKg = (existingInventory ? existingInventory.currentStockKg : 0) + grnData.acceptedQuantity;
      const numberOfBags = (existingInventory ? existingInventory.numberOfBags : 0) + Math.ceil(grnData.acceptedQuantity / 50);
      const utilizationPercent = Math.min(100, (currentStockKg / capacityKg) * 100);

      await tx.inventory.upsert({
        where: {
          warehouseId_commodityId: {
            warehouseId: warehouse.id,
            commodityId,
          },
        },
        update: {
          currentStockKg,
          numberOfBags,
          utilizationPercent,
        },
        create: {
          warehouseId: warehouse.id,
          commodityId,
          currentStockKg,
          numberOfBags,
          capacityKg,
          utilizationPercent,
        },
      });

      // 5. Log Stock Movement (Inward)
      const commodityObj = await tx.commodity.findUnique({ where: { id: commodityId } });
      await tx.stockMovement.create({
        data: {
          type: 'Inward',
          warehouseId: warehouse.id,
          commodity: commodityObj ? commodityObj.name : 'Grain',
          quantityKg: grnData.acceptedQuantity,
          reference: grnNumber,
          officer: receivingOfficerUser ? receivingOfficerUser.name : 'System',
        },
      });
    }

    // 6. Audit Trail
    await tx.auditLog.create({
      data: {
        userId: receivingOfficerUser ? receivingOfficerUser.id : null,
        userName: receivingOfficerUser ? receivingOfficerUser.name : 'System',
        action: 'CREATE',
        module: 'GRN Management',
        recordId: grn.id,
        details: `Issued GRN ${grnNumber} for ${grnData.acceptedQuantity}kg accepted grain at ${warehouse.name}`,
      },
    });

    return grn;
  });
};

export const getGRNs = async (queryFilters) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const where = {};

  if (queryFilters.warehouseId) {
    where.warehouseId = queryFilters.warehouseId;
  }
  if (queryFilters.purchaseId) {
    where.purchaseId = queryFilters.purchaseId;
  }
  if (queryFilters.search) {
    where.grnNumber = { contains: queryFilters.search.trim() };
  }

  const [total, grns] = await Promise.all([
    prisma.gRN.count({ where }),
    prisma.gRN.findMany({
      where,
      skip,
      take: limit,
      orderBy: { receivingDate: 'desc' },
      include: {
        warehouse: true,
        purchase: {
          include: { farmer: true, commodity: true },
        },
        receivingOfficer: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
  ]);

  return { grns, total, page, limit };
};

export const getGRNById = async (id) => {
  const grn = await prisma.gRN.findFirst({
    where: { OR: [{ id }, { grnNumber: id }] },
    include: {
      warehouse: true,
      purchase: {
        include: { farmer: true, commodity: true, ipc: true },
      },
      receivingOfficer: { select: { id: true, name: true, email: true } },
      batchGRNs: {
        include: {
          batch: true,
        },
      },
    },
  });

  if (!grn) {
    throw new NotFoundError(`GRN record '${id}' not found`);
  }

  return grn;
};
