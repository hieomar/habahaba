import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const traceGrainLineage = async (searchCode) => {
  const code = searchCode.trim();

  // 1. Try search by Purchase Receipt or Bag Tag Range or UUID
  let purchase = await prisma.purchase.findFirst({
    where: {
      OR: [
        { receiptNumber: { contains: code } },
        { bagTagRange: { contains: code } },
        { id: code },
        { uuid: code },
      ],
    },
    include: {
      farmer: {
        include: {
          farms: true,
          association: true,
          club: true,
          ipc: true,
        },
      },
      commodity: true,
      ipc: true,
      purchasingOfficer: { select: { id: true, name: true, email: true } },
      grns: {
        include: {
          warehouse: true,
          receivingOfficer: { select: { id: true, name: true, email: true } },
          batchGRNs: {
            include: {
              batch: {
                include: {
                  warehouse: true,
                  ipc: true,
                  dispatches: {
                    include: { customer: true, dispatchedBy: { select: { id: true, name: true, email: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // 2. If not found by purchase, try search by GRN
  if (!purchase) {
    const grn = await prisma.gRN.findFirst({
      where: { OR: [{ grnNumber: { contains: code } }, { id: code }] },
      include: { purchaseId: true },
    });

    if (grn && grn.purchaseId) {
      return await traceGrainLineage(grn.purchaseId);
    }
  }

  // 3. If not found, try search by Batch
  if (!purchase) {
    const batch = await prisma.batch.findFirst({
      where: { OR: [{ batchNumber: { contains: code } }, { id: code }] },
      include: {
        batchGRNs: {
          include: { grn: true },
        },
      },
    });

    if (batch && batch.batchGRNs.length > 0 && batch.batchGRNs[0].grn.purchaseId) {
      return await traceGrainLineage(batch.batchGRNs[0].grn.purchaseId);
    }
  }

  // 4. If not found, try search by Dispatch
  if (!purchase) {
    const dispatch = await prisma.dispatch.findFirst({
      where: { OR: [{ dispatchNumber: { contains: code } }, { id: code }] },
    });

    if (dispatch && dispatch.batchId) {
      return await traceGrainLineage(dispatch.batchId);
    }
  }

  // 5. If not found, try search by Farmer Code or National ID
  if (!purchase) {
    const farmer = await prisma.farmer.findFirst({
      where: {
        OR: [{ farmerCode: code }, { nationalId: code }, { phone: code }],
      },
      include: {
        purchases: { orderBy: { purchaseDate: 'desc' }, take: 1 },
      },
    });

    if (farmer && farmer.purchases.length > 0) {
      return await traceGrainLineage(farmer.purchases[0].receiptNumber);
    }
  }

  if (!purchase) {
    throw new NotFoundError(`No traceability record matching code '${code}' could be found`);
  }

  // Build Structured Lineage Graph
  const farmer = purchase.farmer;
  const grnList = purchase.grns || [];
  const batchList = [];
  const dispatchList = [];

  for (const grn of grnList) {
    for (const bg of grn.batchGRNs || []) {
      if (bg.batch) {
        batchList.push(bg.batch);
        for (const d of bg.batch.dispatches || []) {
          dispatchList.push(d);
        }
      }
    }
  }

  // Map Coordinates for Map Visualizer
  const mapCoordinates = [];
  if (farmer.latitude && farmer.longitude) {
    mapCoordinates.push({
      label: `Farm Location (${farmer.fullName})`,
      type: 'FARM',
      lat: farmer.latitude,
      lng: farmer.longitude,
      details: `${farmer.village}, ${farmer.district}`,
    });
  }

  if (purchase.ipc && purchase.ipc.district) {
    mapCoordinates.push({
      label: `Buying Center (${purchase.buyingCentre})`,
      type: 'BUYING_CENTER',
      lat: -13.9626, // IPC Lilongwe center default
      lng: 33.7741,
      details: purchase.ipc.name,
    });
  }

  for (const grn of grnList) {
    if (grn.warehouse) {
      mapCoordinates.push({
        label: `Warehouse (${grn.warehouse.name})`,
        type: 'WAREHOUSE',
        lat: grn.warehouse.gpsLat || -13.9526,
        lng: grn.warehouse.gpsLng || 33.7641,
        details: grn.warehouse.location,
      });
    }
  }

  return {
    traceCode: code,
    lineage: {
      farmer: {
        farmerCode: farmer.farmerCode,
        fullName: farmer.fullName,
        nationalId: farmer.nationalId,
        phone: farmer.phone,
        village: farmer.village,
        district: farmer.district,
        association: farmer.association ? farmer.association.name : null,
        club: farmer.club ? farmer.club.name : null,
        farms: farmer.farms,
      },
      purchase: {
        receiptNumber: purchase.receiptNumber,
        purchaseDate: purchase.purchaseDate,
        buyingCentre: purchase.buyingCentre,
        commodity: purchase.commodity.name,
        variety: purchase.variety,
        grade: purchase.grade,
        numberOfBags: purchase.numberOfBags,
        totalWeight: purchase.totalWeight,
        unitPrice: purchase.unitPrice,
        grossAmount: purchase.grossAmount,
        seedLoanDeduction: purchase.seedLoanDeduction,
        netPayable: purchase.netPayable,
        paymentStatus: purchase.paymentStatus,
        bagTagRange: purchase.bagTagRange,
      },
      intakeGRN: grnList.map((g) => ({
        grnNumber: g.grnNumber,
        warehouse: g.warehouse.name,
        receivingDate: g.receivingDate,
        grossWeight: g.grossWeight,
        tareWeight: g.tareWeight,
        netWeight: g.netWeight,
        acceptedQuantity: g.acceptedQuantity,
        moistureContentPercent: g.moistureContentPercent,
      })),
      batches: batchList.map((b) => ({
        batchNumber: b.batchNumber,
        warehouse: b.warehouse.name,
        storageLocation: b.storageLocation,
        totalWeightKg: b.totalWeightKg,
        numberOfBags: b.numberOfBags,
        status: b.status,
      })),
      dispatches: dispatchList.map((d) => ({
        dispatchNumber: d.dispatchNumber,
        customer: d.customer ? d.customer.name : d.deliveryAddress,
        quantityKg: d.quantityKg,
        vehicleReg: d.vehicleReg,
        driverName: d.driverName,
        dispatchDate: d.dispatchDate,
        status: d.status,
      })),
      mapCoordinates,
    },
  };
};
