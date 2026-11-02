import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

/**
 * Generates the next sequential Purchase Receipt Number (e.g. RCP-2026-0001)
 */
export const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `RCP-${year}-${sequence}`;
};

/**
 * Generates Bag Tag Range string (e.g. BAG-2026-0001-001 to 004)
 */
export const generateBagTagRange = (receiptNumber, numBags) => {
  if (numBags <= 0) return 'BAG-NONE';
  const prefix = receiptNumber.replace('RCP', 'BAG');
  if (numBags === 1) return `${prefix}-001`;
  const endPad = String(numBags).padStart(3, '0');
  return `${prefix}-001 to 0${endPad}`;
};

export const createPurchase = async (purchaseData, purchasingOfficerUser) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Validate Farmer
    const farmer = await tx.farmer.findFirst({
      where: {
        OR: [{ id: purchaseData.farmerId }, { farmerCode: purchaseData.farmerId }],
      },
    });

    if (!farmer) {
      throw new NotFoundError(`Farmer with ID '${purchaseData.farmerId}' not found`);
    }

    if (farmer.status !== 'ACTIVE') {
      throw new BadRequestError(`Cannot record purchase for non-active farmer '${farmer.fullName}'`);
    }

    // 2. Validate Commodity
    const commodity = await tx.commodity.findFirst({
      where: {
        OR: [{ id: purchaseData.commodityId }, { code: purchaseData.commodityId }],
      },
    });

    if (!commodity) {
      throw new NotFoundError(`Commodity '${purchaseData.commodityId}' not found`);
    }

    // 3. Perform Payout & Seed Loan Recovery Math
    const bagWeight = purchaseData.bagWeight || 50;
    const numberOfBags = Math.ceil(purchaseData.quantityKg / bagWeight);
    const grossAmount = purchaseData.quantityKg * purchaseData.pricePerKg;

    // Loan Recovery calculation: Math.min(grossAmount, farmer.seedLoanBalance)
    const loanRecovered = Math.min(grossAmount, farmer.seedLoanBalance || 0);
    const otherDeductions = purchaseData.otherDeductions || 0;
    const netPayable = Math.max(0, grossAmount - loanRecovered - otherDeductions);

    // 4. Generate Identifiers
    const receiptNumber = await generateReceiptNumber();
    const bagTagRange = generateBagTagRange(receiptNumber, numberOfBags);
    const ipcId = farmer.ipcId || purchasingOfficerUser?.assignedIpcId || (await tx.iPC.findFirst())?.id;

    // 5. Create Purchase Record
    const purchase = await tx.purchase.create({
      data: {
        uuid: purchaseData.uuid || null,
        receiptNumber,
        purchaseDate: purchaseData.purchaseDate ? new Date(purchaseData.purchaseDate) : new Date(),
        buyingCentre: purchaseData.buyingCentre,
        ipcId,
        purchasingOfficerId: purchasingOfficerUser ? purchasingOfficerUser.id : null,
        farmerId: farmer.id,
        commodityId: commodity.id,
        variety: purchaseData.variety || null,
        grade: purchaseData.grade || 'Grade 1',
        qualityGrade: purchaseData.qualityGrade || 'Standard',
        numberOfBags,
        bagWeight,
        totalWeight: purchaseData.quantityKg,
        unitPrice: purchaseData.pricePerKg,
        grossAmount,
        seedLoanDeduction: loanRecovered,
        otherDeductions,
        netPayable,
        paymentStatus: purchaseData.paymentStatus || 'PAID',
        paymentMethod: purchaseData.paymentMethod || 'CASH',
        paymentDate: purchaseData.paymentStatus === 'PAID' ? new Date() : null,
        paymentReference: purchaseData.paymentReference || null,
        purchaseNotes: purchaseData.purchaseNotes || null,
        bagTagRange,
      },
      include: {
        farmer: true,
        commodity: true,
        ipc: true,
      },
    });

    // 6. Deduct Recovered Loan from Farmer Balance
    if (loanRecovered > 0) {
      await tx.farmer.update({
        where: { id: farmer.id },
        data: { seedLoanBalance: farmer.seedLoanBalance - loanRecovered },
      });
    }

    // 7. Write Audit Trail
    await tx.auditLog.create({
      data: {
        userId: purchasingOfficerUser ? purchasingOfficerUser.id : null,
        userName: purchasingOfficerUser ? purchasingOfficerUser.name : 'System',
        action: 'CREATE',
        module: 'Commodity Purchases',
        recordId: purchase.id,
        details: `Recorded purchase ${receiptNumber} (${purchase.totalWeight}kg ${commodity.name}) from ${farmer.fullName}. Gross: MWK ${grossAmount}, Loan Recovered: MWK ${loanRecovered}, Net Payout: MWK ${netPayable}`,
      },
    });

    return purchase;
  });
};

export const getPurchases = async (queryFilters) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const where = {};

  if (queryFilters.status) {
    where.paymentStatus = queryFilters.status;
  }
  if (queryFilters.commodityId) {
    where.commodityId = queryFilters.commodityId;
  }
  if (queryFilters.farmerId) {
    where.farmerId = queryFilters.farmerId;
  }
  if (queryFilters.buyingCentre) {
    where.buyingCentre = { contains: queryFilters.buyingCentre.trim() };
  }
  if (queryFilters.startDate && queryFilters.endDate) {
    where.purchaseDate = {
      gte: new Date(queryFilters.startDate),
      lte: new Date(queryFilters.endDate),
    };
  }

  const [total, purchases] = await Promise.all([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      skip,
      take: limit,
      orderBy: { purchaseDate: 'desc' },
      include: {
        farmer: {
          select: { id: true, farmerCode: true, fullName: true, phone: true, village: true, district: true },
        },
        commodity: true,
        ipc: true,
        purchasingOfficer: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
  ]);

  return { purchases, total, page, limit };
};

export const getPurchaseById = async (id) => {
  const purchase = await prisma.purchase.findFirst({
    where: {
      OR: [{ id }, { receiptNumber: id }, { uuid: id }],
    },
    include: {
      farmer: true,
      commodity: true,
      ipc: true,
      purchasingOfficer: {
        select: { id: true, name: true, email: true },
      },
      grns: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new NotFoundError(`Purchase receipt '${id}' not found`);
  }

  return purchase;
};

export const updatePaymentStatus = async (id, paymentData, officerUser) => {
  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase) {
    throw new NotFoundError(`Purchase receipt '${id}' not found`);
  }

  const updated = await prisma.purchase.update({
    where: { id },
    data: {
      paymentStatus: paymentData.paymentStatus,
      paymentMethod: paymentData.paymentMethod || purchase.paymentMethod,
      paymentReference: paymentData.paymentReference || purchase.paymentReference,
      paymentDate: paymentData.paymentStatus === 'PAID' ? new Date() : purchase.paymentDate,
    },
    include: {
      farmer: true,
      commodity: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: officerUser ? officerUser.id : null,
      userName: officerUser ? officerUser.name : 'System',
      action: 'UPDATE',
      module: 'Commodity Purchases',
      recordId: purchase.id,
      details: `Updated payment status for receipt ${purchase.receiptNumber} to '${paymentData.paymentStatus}'`,
    },
  });

  return updated;
};
