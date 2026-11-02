import { prisma } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

/**
 * Generates the next sequential Farmer Code (e.g. NAS-LLW-00129)
 */
export const generateNextFarmerCode = async (district = 'Lilongwe') => {
  const prefix = district.substring(0, 3).toUpperCase();
  const count = await prisma.farmer.count();
  const sequence = String(count + 1).padStart(5, '0');
  return `NAS-${prefix}-${sequence}`;
};

export const createFarmer = async (farmerData, officerUser) => {
  // Check if National ID already exists
  if (farmerData.nationalId) {
    const existing = await prisma.farmer.findUnique({
      where: { nationalId: farmerData.nationalId },
    });
    if (existing) {
      throw new ConflictError(`Farmer with National ID '${farmerData.nationalId}' already exists`);
    }
  }

  const farmerCode = await generateNextFarmerCode(farmerData.district);
  const fullName = `${farmerData.firstName.trim()} ${farmerData.lastName.trim()}`;
  const cropsJson = JSON.stringify({
    primary: farmerData.primaryCrops || [],
    secondary: farmerData.secondaryCrops || [],
  });

  const farmer = await prisma.farmer.create({
    data: {
      uuid: farmerData.uuid || null,
      farmerCode,
      firstName: farmerData.firstName.trim(),
      lastName: farmerData.lastName.trim(),
      fullName,
      gender: farmerData.gender,
      dob: farmerData.dob ? new Date(farmerData.dob) : null,
      phone: farmerData.phoneNumber || null,
      altPhone: farmerData.altPhone || null,
      nationalId: farmerData.nationalId || null,
      district: farmerData.district,
      ta: farmerData.ta || null,
      epa: farmerData.epa || null,
      section: farmerData.section || null,
      village: farmerData.village,
      gps: farmerData.gps || null,
      latitude: farmerData.latitude || null,
      longitude: farmerData.longitude || null,
      ipcId: farmerData.ipcId || null,
      associationId: farmerData.associationId || null,
      clubId: farmerData.clubId || null,
      groupName: farmerData.groupName || null,
      memberNo: farmerData.memberNo || null,
      farmSize: farmerData.farmSize,
      unit: farmerData.unit || 'Hectares',
      cropsJson,
      productionSeason: farmerData.productionSeason || '2025/2026',
      registrationOfficer: officerUser ? officerUser.name : 'System',
      seedLoanBalance: farmerData.seedLoanBalance || 0,
      status: 'ACTIVE',
    },
    include: {
      ipc: true,
      association: true,
      club: true,
    },
  });

  // Write Audit Log
  await prisma.auditLog.create({
    data: {
      userId: officerUser ? officerUser.id : null,
      userName: officerUser ? officerUser.name : 'System',
      action: 'CREATE',
      module: 'Farmer Management',
      recordId: farmer.id,
      details: `Created farmer ${farmer.fullName} (${farmer.farmerCode})`,
    },
  });

  return farmer;
};

export const getFarmers = async (queryFilters) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const where = {};

  if (queryFilters.search) {
    const s = queryFilters.search.trim();
    where.OR = [
      { fullName: { contains: s } },
      { farmerCode: { contains: s } },
      { nationalId: { contains: s } },
      { phone: { contains: s } },
      { village: { contains: s } },
    ];
  }

  if (queryFilters.district) {
    where.district = queryFilters.district;
  }

  if (queryFilters.status) {
    where.status = queryFilters.status;
  }

  const [total, farmers] = await Promise.all([
    prisma.farmer.count({ where }),
    prisma.farmer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        ipc: true,
        association: true,
        club: true,
        _count: {
          select: { farms: true, purchases: true },
        },
      },
    }),
  ]);

  return { farmers, total, page, limit };
};

export const getFarmerById = async (id) => {
  const farmer = await prisma.farmer.findFirst({
    where: {
      OR: [{ id }, { farmerCode: id }, { uuid: id }],
    },
    include: {
      ipc: true,
      association: true,
      club: true,
      farms: true,
      purchases: {
        orderBy: { purchaseDate: 'desc' },
        take: 10,
        include: {
          commodity: true,
        },
      },
    },
  });

  if (!farmer) {
    throw new NotFoundError(`Farmer with ID or Code '${id}' not found`);
  }

  return farmer;
};

export const updateFarmer = async (id, updateData, officerUser) => {
  const farmer = await prisma.farmer.findUnique({ where: { id } });
  if (!farmer) {
    throw new NotFoundError(`Farmer '${id}' not found`);
  }

  if (updateData.firstName || updateData.lastName) {
    const fn = updateData.firstName ? updateData.firstName.trim() : farmer.firstName;
    const ln = updateData.lastName ? updateData.lastName.trim() : farmer.lastName;
    updateData.fullName = `${fn} ${ln}`;
  }

  const updated = await prisma.farmer.update({
    where: { id },
    data: updateData,
    include: {
      association: true,
      club: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: officerUser ? officerUser.id : null,
      userName: officerUser ? officerUser.name : 'System',
      action: 'UPDATE',
      module: 'Farmer Management',
      recordId: farmer.id,
      details: `Updated details for farmer ${updated.fullName} (${updated.farmerCode})`,
    },
  });

  return updated;
};

export const getFarmerGroups = async () => {
  const [associations, clubs] = await Promise.all([
    prisma.association.findMany({
      include: {
        ipc: true,
        _count: { select: { clubs: true, farmers: true } },
      },
    }),
    prisma.club.findMany({
      include: {
        association: true,
        _count: { select: { farmers: true } },
      },
    }),
  ]);

  return { associations, clubs };
};

export const getFarmerHistory = async (id) => {
  const farmer = await getFarmerById(id);

  const purchases = await prisma.purchase.findMany({
    where: { farmerId: farmer.id },
    orderBy: { purchaseDate: 'desc' },
    include: {
      commodity: true,
      grns: true,
    },
  });

  return {
    farmer: {
      id: farmer.id,
      farmerCode: farmer.farmerCode,
      fullName: farmer.fullName,
      seedLoanBalance: farmer.seedLoanBalance,
    },
    purchases,
  };
};
