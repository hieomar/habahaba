import { prisma } from '../config/database.js';
import { generateNextFarmerCode } from './farmer.service.js';

export const processPushSync = async (payload, officerUser) => {
  const { deviceId, farmers = [], farms = [], purchases = [] } = payload;
  const totalRecords = farmers.length + farms.length + purchases.length;

  const result = await prisma.$transaction(async (tx) => {
    const syncedFarmers = [];
    const syncedFarms = [];
    const syncedPurchases = [];

    // 1. Sync Farmers (Last-Write-Wins)
    for (const f of farmers) {
      let existing = await tx.farmer.findFirst({
        where: { OR: [{ uuid: f.uuid }, ...(f.nationalId ? [{ nationalId: f.nationalId }] : [])] },
      });

      const fullName = `${f.firstName.trim()} ${f.lastName.trim()}`;
      const cropsJson = JSON.stringify({ primary: f.crops || [] });

      if (existing) {
        // Update existing record
        const updated = await tx.farmer.update({
          where: { id: existing.id },
          data: {
            firstName: f.firstName,
            lastName: f.lastName,
            fullName,
            phone: f.phoneNumber || existing.phone,
            village: f.village || existing.village,
            district: f.district || existing.district,
            clubId: f.club ? (await tx.club.findFirst({ where: { name: f.club } }))?.id : existing.clubId,
            associationId: f.association ? (await tx.association.findFirst({ where: { name: f.association } }))?.id : existing.associationId,
            latitude: f.latitude || existing.latitude,
            longitude: f.longitude || existing.longitude,
            cropsJson,
            syncStatus: 'SYNCED',
          },
        });
        syncedFarmers.push(updated.uuid || updated.id);
      } else {
        // Create new record
        const farmerCode = await generateNextFarmerCode(f.district || 'Lilongwe');
        const created = await tx.farmer.create({
          data: {
            uuid: f.uuid,
            farmerCode,
            firstName: f.firstName,
            lastName: f.lastName,
            fullName,
            gender: 'MALE',
            phone: f.phoneNumber || null,
            nationalId: f.nationalId || null,
            district: f.district || 'Lilongwe',
            village: f.village || 'Village',
            latitude: f.latitude || null,
            longitude: f.longitude || null,
            farmSize: 2.0,
            cropsJson,
            seedLoanBalance: f.seedLoanBalance || 0,
            status: 'ACTIVE',
            syncStatus: 'SYNCED',
            registrationOfficer: officerUser ? officerUser.name : 'Mobile Sync Agent',
          },
        });
        syncedFarmers.push(created.uuid || created.id);
      }
    }

    // 2. Sync Farms
    for (const fm of farms) {
      const parentFarmer = await tx.farmer.findFirst({
        where: { OR: [{ uuid: fm.farmerUuid }, { id: fm.farmerUuid }] },
      });

      if (parentFarmer) {
        let existingFarm = await tx.farm.findFirst({
          where: { OR: [{ uuid: fm.uuid }, { farmerId_farmName: { farmerId: parentFarmer.id, farmName: fm.farmName } }] },
        });

        if (!existingFarm) {
          const createdFarm = await tx.farm.create({
            data: {
              uuid: fm.uuid,
              farmerId: parentFarmer.id,
              farmName: fm.farmName,
              location: fm.location || parentFarmer.village,
              district: parentFarmer.district,
              village: parentFarmer.village,
              sizeHectares: fm.acreage || 1.0,
              primaryCrop: fm.primaryCrop || 'Maize',
              status: 'ACTIVE',
              syncStatus: 'SYNCED',
            },
          });
          syncedFarms.push(createdFarm.uuid || createdFarm.id);
        } else {
          syncedFarms.push(existingFarm.uuid || existingFarm.id);
        }
      }
    }

    // 3. Sync Purchases & Loan Recoveries
    for (const p of purchases) {
      let existingPurchase = await tx.purchase.findFirst({
        where: { OR: [{ uuid: p.uuid }, { receiptNumber: p.receiptNumber }] },
      });

      if (!existingPurchase) {
        const parentFarmer = await tx.farmer.findFirst({
          where: { OR: [{ uuid: p.farmerUuid }, { id: p.farmerUuid }, { farmerCode: p.farmerUuid }] },
        });

        const commodity = await tx.commodity.findFirst({
          where: { OR: [{ name: p.commodity }, { code: p.commodity }] },
        }) || (await tx.commodity.findFirst());

        if (parentFarmer && commodity) {
          const ipcId = parentFarmer.ipcId || (await tx.iPC.findFirst())?.id;
          const grossAmount = p.totalPrice || p.quantityKg * p.pricePerKg;
          const loanRecovered = p.loanRecovered || 0;
          const netPayable = p.netPayment || Math.max(0, grossAmount - loanRecovered);

          const createdPurchase = await tx.purchase.create({
            data: {
              uuid: p.uuid,
              receiptNumber: p.receiptNumber,
              purchaseDate: p.purchaseDate ? new Date(p.purchaseDate) : new Date(),
              buyingCentre: p.buyingCenter || 'Buying Centre',
              ipcId,
              purchasingOfficerId: officerUser ? officerUser.id : null,
              farmerId: parentFarmer.id,
              commodityId: commodity.id,
              variety: p.variety || null,
              numberOfBags: p.numberOfBags || Math.ceil(p.quantityKg / 50),
              totalWeight: p.quantityKg,
              unitPrice: p.pricePerKg,
              grossAmount,
              seedLoanDeduction: loanRecovered,
              netPayable,
              paymentStatus: 'PAID',
              paymentMethod: 'CASH',
              bagTagRange: p.bagTagRange || `BAG-${p.receiptNumber}-001`,
              syncStatus: 'SYNCED',
            },
          });

          // Deduct loan from farmer balance if recovered
          if (loanRecovered > 0 && parentFarmer.seedLoanBalance >= loanRecovered) {
            await tx.farmer.update({
              where: { id: parentFarmer.id },
              data: { seedLoanBalance: parentFarmer.seedLoanBalance - loanRecovered },
            });
          }

          syncedPurchases.push(createdPurchase.uuid || createdPurchase.id);
        }
      } else {
        syncedPurchases.push(existingPurchase.uuid || existingPurchase.id);
      }
    }

    // 4. Record Mobile Sync Log
    await tx.mobileSyncLog.create({
      data: {
        deviceId,
        userId: officerUser ? officerUser.id : null,
        syncType: 'Batch Offline Mobile Sync',
        recordsCount: totalRecords,
        status: 'SYNCED',
      },
    });

    return {
      syncedCount: {
        farmers: syncedFarmers.length,
        farms: syncedFarms.length,
        purchases: syncedPurchases.length,
      },
      syncedUuids: [...syncedFarmers, ...syncedFarms, ...syncedPurchases],
    };
  });

  return result;
};

export const getPullSeedData = async (userIpcId) => {
  const [commodities, ipcs, warehouses, associations, clubs, farmers] = await Promise.all([
    prisma.commodity.findMany({ where: { status: 'ACTIVE' } }),
    prisma.iPC.findMany({ where: { status: 'ACTIVE' } }),
    prisma.warehouse.findMany({ where: { status: 'ACTIVE' } }),
    prisma.association.findMany(),
    prisma.club.findMany(),
    prisma.farmer.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { farms: true },
    }),
  ]);

  return {
    commodities,
    ipcs,
    warehouses,
    associations,
    clubs,
    farmers,
    serverTimestamp: new Date().toISOString(),
  };
};

export const getSyncLogs = async (queryFilters) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const [total, logs] = await Promise.all([
    prisma.mobileSyncLog.count(),
    prisma.mobileSyncLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { logs, total, page, limit };
};
