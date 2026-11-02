import { prisma } from '../config/database.js';

export const getCommodities = async () => prisma.commodity.findMany({ orderBy: { name: 'asc' } });

export const getIPCs = async () =>
  prisma.iPC.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { warehouses: true, farmers: true, users: true } } },
  });

export const getWarehouses = async () =>
  prisma.warehouse.findMany({
    orderBy: { name: 'asc' },
    include: { ipc: true, _count: { select: { grns: true, batches: true } } },
  });

export const getMarketingCentres = async () =>
  prisma.marketingCentre.findMany({
    orderBy: { name: 'asc' },
    include: { ipc: true, association: true },
  });

export const getAuditLogs = async (queryFilters = {}) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const where = {};
  if (queryFilters.module) where.module = queryFilters.module;
  if (queryFilters.action) where.action = queryFilters.action;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  return { logs, total, page, limit };
};

export const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
};

export const getSystemSummaryReport = async () => {
  const [totalFarmers, totalFarms, totalPurchases, totalWarehouses, totalVolumeKg, totalPayout] = await Promise.all([
    prisma.farmer.count(),
    prisma.farm.count(),
    prisma.purchase.count(),
    prisma.warehouse.count(),
    prisma.purchase.aggregate({ _sum: { totalWeight: true } }),
    prisma.purchase.aggregate({ _sum: { netPayable: true } }),
  ]);

  return {
    totalFarmers,
    totalFarms,
    totalPurchases,
    totalWarehouses,
    totalVolumeKg: totalVolumeKg._sum.totalWeight || 0,
    totalPayoutMWK: totalPayout._sum.netPayable || 0,
    generatedAt: new Date().toISOString(),
  };
};
