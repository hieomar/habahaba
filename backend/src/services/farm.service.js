import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const createFarm = async (farmData, officerUser) => {
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmData.farmerId },
  });

  if (!farmer) {
    throw new NotFoundError(`Farmer with ID '${farmData.farmerId}' not found`);
  }

  const farm = await prisma.farm.create({
    data: {
      uuid: farmData.uuid || null,
      farmerId: farmer.id,
      farmName: farmData.farmName.trim(),
      location: farmData.location.trim(),
      district: farmData.district || farmer.district,
      village: farmData.village || farmer.village,
      sizeHectares: farmData.sizeHectares,
      gpsLat: farmData.gpsLat || null,
      gpsLng: farmData.gpsLng || null,
      primaryCrop: farmData.primaryCrop,
      secondaryCrop: farmData.secondaryCrop || null,
      season: farmData.season || '2025/2026',
      productionEstimateKg: farmData.productionEstimateKg || null,
      soilType: farmData.soilType || null,
      irrigated: farmData.irrigated || false,
      extensionNotes: farmData.extensionNotes || null,
      status: 'ACTIVE',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: officerUser ? officerUser.id : null,
      userName: officerUser ? officerUser.name : 'System',
      action: 'CREATE',
      module: 'Farm Management',
      recordId: farm.id,
      details: `Registered farm plot '${farm.farmName}' (${farm.sizeHectares} Ha) for farmer ${farmer.fullName}`,
    },
  });

  return farm;
};

export const getFarmsByFarmer = async (farmerId) => {
  const farmer = await prisma.farmer.findFirst({
    where: { OR: [{ id: farmerId }, { farmerCode: farmerId }] },
  });

  if (!farmer) {
    throw new NotFoundError(`Farmer '${farmerId}' not found`);
  }

  return await prisma.farm.findMany({
    where: { farmerId: farmer.id },
    orderBy: { createdAt: 'desc' },
  });
};
