import { api } from "./client";

/**
 * Purchases Service
 *
 * Backend contract:
 *   GET    /api/v1/purchases                     → { data: Purchase[], total, page, limit, stats }
 *   POST   /api/v1/purchases                     → { data: Purchase }
 *   GET    /api/v1/purchases/:id                 → { data: Purchase }
 *   PUT    /api/v1/purchases/:id                 → { data: Purchase }
 *
 * Purchase shape (abbreviated):
 *   { id, receiptNumber, status, purchaseDate, buyingCentre, ipc,
 *     purchasingOfficer, approvedBy, farmerId, farmerName, farmerPhone,
 *     farmerAssociation, farmerClub, farmerGroup, farmerVillage, farmerDistrict,
 *     commodity, variety, grade, qualityGrade, numberOfBags,
 *     bagWeight, totalWeight, unitPrice, grossAmount,
 *     seedLoanDeduction, otherDeductions, netPayable,
 *     paymentStatus, paymentMethod, paymentDate, paymentReference,
 *     grn: { grnNumber, warehouse, receivingOfficer, receivingDate, grnStatus },
 *     warehouse: { name, location, bin, stack, shelf },
 *     batch: { batchNumber, batchStatus },
 *     bags: [...], documents: [...], timeline: [...] }
 *
 * stats shape: { totalPurchases, totalWeight, totalValue, pendingPayment }
 */

export const purchasesService = {
  list: (params) => api.get("/purchases", params),

  get: (id) => api.get(`/purchases/${id}`),

  create: (payload) => api.post("/purchases", payload),

  update: (id, payload) => api.put(`/purchases/${id}`, payload),
};
