import { prisma } from '../config/database.js';

export const getInventoryByWarehouse = async (warehouseId) => {
  const where = warehouseId ? { warehouseId } : {};

  const inventory = await prisma.inventory.findMany({
    where,
    include: {
      warehouse: true,
      commodity: true,
    },
    orderBy: { lastUpdated: 'desc' },
  });

  return inventory;
};

export const getStockMovements = async (queryFilters = {}) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const where = {};
  if (queryFilters.warehouseId) {
    where.warehouseId = queryFilters.warehouseId;
  }
  if (queryFilters.type) {
    where.type = queryFilters.type;
  }

  const [total, movements] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        warehouse: true,
      },
    }),
  ]);

  return { movements, total, page, limit };
};
