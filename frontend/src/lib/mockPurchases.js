// ─────────────────────────────────────────────────────────────
// GTMS Mock Purchase Data
// All purchases reference farmers from SEED_FARMERS in mockFarmers.js
// ─────────────────────────────────────────────────────────────

export const SEED_PURCHASES = [
  {
    id: "PUR-2024-0001",
    receiptNumber: "RCP-2024-8801",
    status: "Completed",
    purchaseDate: "2024-05-12",
    buyingCentre: "Lilongwe North Buying Centre",
    ipc: "Lilongwe IPC",
    purchasingOfficer: "John Phiri",
    approvedBy: "Mary Zgambo",

    // Farmer reference
    farmerId: "FMR-2024-0001",
    farmerName: "Chikondi Banda",
    farmerPhone: "+265 991 234 567",
    farmerAssociation: "Lilongwe North Association",
    farmerClub: "Tiyanjane Club",
    farmerGroup: "Tiyanjane Group A",
    farmerVillage: "Mphande 1",
    farmerDistrict: "Lilongwe",
    farmerStatus: "Active",

    // Commodity
    commodity: "Maize",
    variety: "DK8031",
    grade: "Grade 1",
    qualityGrade: "Premium",
    numberOfBags: 4,
    bagWeight: 50,
    totalWeight: 200,
    unitPrice: 75,
    grossAmount: 15000,
    purchaseNotes: "Excellent quality grain, well-dried.",
    commodityStatus: "Accepted",

    // Financials
    seedLoanDeduction: 2500,
    otherDeductions: 500,
    netPayable: 12000,
    paymentStatus: "Paid",
    paymentMethod: "Mobile Money (TNM Mpamba)",
    paymentDate: "2024-05-13",
    paymentReference: "MPM-20240513-99821",

    // GRN
    grn: {
      grnNumber: "GRN-2024-0441",
      warehouse: "Lilongwe Main Silo",
      warehouseCode: "WH-LLW-001",
      receivingOfficer: "Peter Zimba",
      receivingDate: "2024-05-12",
      acceptedQuantity: 200,
      rejectedQuantity: 0,
      grnStatus: "Verified",
    },

    // Warehouse
    warehouse: {
      name: "Lilongwe Main Silo",
      location: "Area 23, Lilongwe",
      currentStockStatus: "Stored",
      bin: "B-04",
      stack: "S-12",
      shelf: "Level 2",
      storageCondition: "Dry & Ventilated",
      inventoryStatus: "Active",
    },

    // Batch
    batch: {
      batchNumber: "BCH-2024-1045",
      batchStatus: "Active",
      batchCreationDate: "2024-05-13",
      currentWarehouse: "Lilongwe Main Silo",
      commodity: "Maize",
      quantity: 200,
      qualityStatus: "Passed",
    },

    // Bags
    bags: [
      { bagNumber: "BAG-8990", weight: 50, location: "Bin B-04", batch: "BCH-2024-1045", status: "Stored" },
      { bagNumber: "BAG-8991", weight: 50, location: "Bin B-04", batch: "BCH-2024-1045", status: "Stored" },
      { bagNumber: "BAG-8992", weight: 50, location: "Bin B-04", batch: "BCH-2024-1045", status: "Stored" },
      { bagNumber: "BAG-8993", weight: 50, location: "Bin B-04", batch: "BCH-2024-1045", status: "Stored" },
    ],

    // Documents
    documents: [
      { id: "PDOC-001", name: "Signed Purchase Form", type: "Purchase Form", uploadDate: "2024-05-12", uploadedBy: "John Phiri", status: "Verified" },
      { id: "PDOC-002", name: "Weight Ticket — WH-LLW-001", type: "Weight Ticket", uploadDate: "2024-05-12", uploadedBy: "Peter Zimba", status: "Verified" },
      { id: "PDOC-003", name: "Quality Inspection Report", type: "Quality Certificate", uploadDate: "2024-05-12", uploadedBy: "Peter Zimba", status: "Verified" },
      { id: "PDOC-004", name: "Commodity Photo 1", type: "Commodity Photo", uploadDate: "2024-05-12", uploadedBy: "John Phiri", status: "Verified" },
    ],

    // Activity timeline
    timeline: [
      { id: 1, activity: "Purchase Created", date: "2024-05-12", time: "09:14 AM", performedBy: "John Phiri", details: "Purchase record initiated at Lilongwe North Buying Centre.", icon: "create" },
      { id: 2, activity: "Commodity Weighed", date: "2024-05-12", time: "09:32 AM", performedBy: "Peter Zimba", details: "4 bags weighed at 50 kg each. Total: 200 kg.", icon: "scale" },
      { id: 3, activity: "Quality Inspected", date: "2024-05-12", time: "09:55 AM", performedBy: "Peter Zimba", details: "Grade 1 Maize — Premium quality. Passed.", icon: "inspect" },
      { id: 4, activity: "Purchase Approved", date: "2024-05-12", time: "10:10 AM", performedBy: "Mary Zgambo", details: "Purchase approved by IPC Manager.", icon: "approve" },
      { id: 5, activity: "Goods Received", date: "2024-05-12", time: "10:45 AM", performedBy: "Peter Zimba", details: "GRN-2024-0441 issued. All 200 kg accepted.", icon: "receive" },
      { id: 6, activity: "Warehouse Stored", date: "2024-05-12", time: "11:30 AM", performedBy: "Peter Zimba", details: "Stored in Bin B-04, Stack S-12, Level 2.", icon: "store" },
      { id: 7, activity: "Batch Assigned", date: "2024-05-13", time: "08:00 AM", performedBy: "System", details: "Assigned to Batch BCH-2024-1045.", icon: "batch" },
      { id: 8, activity: "Payment Processed", date: "2024-05-13", time: "10:22 AM", performedBy: "System", details: "MWK 12,000 sent via TNM Mpamba. Ref: MPM-20240513-99821.", icon: "payment" },
      { id: 9, activity: "Receipt Generated", date: "2024-05-13", time: "10:23 AM", performedBy: "System", details: "Receipt RCP-2024-8801 generated and archived.", icon: "receipt" },
    ],
  },

  {
    id: "PUR-2024-0002",
    receiptNumber: "RCP-2024-8802",
    status: "Completed",
    purchaseDate: "2024-05-15",
    buyingCentre: "Mchinji Central Buying Centre",
    ipc: "Mchinji IPC",
    purchasingOfficer: "Sarah Mwale",
    approvedBy: "George Kachingwe",

    farmerId: "FMR-2024-0002",
    farmerName: "Moses Phiri",
    farmerPhone: "+265 882 345 678",
    farmerAssociation: "Mchinji Farmers Association",
    farmerClub: "Chikondano Club",
    farmerGroup: "Chikondano Group B",
    farmerVillage: "Chisenga",
    farmerDistrict: "Mchinji",
    farmerStatus: "Pending Verification",

    commodity: "Groundnuts",
    variety: "CG7",
    grade: "Grade 1",
    qualityGrade: "Premium",
    numberOfBags: 3,
    bagWeight: 50,
    totalWeight: 150,
    unitPrice: 210,
    grossAmount: 31500,
    purchaseNotes: "Premium groundnuts, well-shelled and sorted.",
    commodityStatus: "Accepted",

    seedLoanDeduction: 5000,
    otherDeductions: 0,
    netPayable: 26500,
    paymentStatus: "Paid",
    paymentMethod: "Airtel Money",
    paymentDate: "2024-05-16",
    paymentReference: "ATL-20240516-11235",

    grn: {
      grnNumber: "GRN-2024-0442",
      warehouse: "Mchinji Depot",
      warehouseCode: "WH-MCH-001",
      receivingOfficer: "Samuel Nyirenda",
      receivingDate: "2024-05-15",
      acceptedQuantity: 150,
      rejectedQuantity: 0,
      grnStatus: "Verified",
    },

    warehouse: {
      name: "Mchinji Depot",
      location: "Mchinji Town Centre",
      currentStockStatus: "Stored",
      bin: "A-07",
      stack: "S-03",
      shelf: "Level 1",
      storageCondition: "Dry & Ventilated",
      inventoryStatus: "Active",
    },

    batch: {
      batchNumber: "BCH-2024-1102",
      batchStatus: "Active",
      batchCreationDate: "2024-05-16",
      currentWarehouse: "Mchinji Depot",
      commodity: "Groundnuts",
      quantity: 150,
      qualityStatus: "Passed",
    },

    bags: [
      { bagNumber: "BAG-9101", weight: 50, location: "Bin A-07", batch: "BCH-2024-1102", status: "Stored" },
      { bagNumber: "BAG-9102", weight: 50, location: "Bin A-07", batch: "BCH-2024-1102", status: "Stored" },
      { bagNumber: "BAG-9103", weight: 50, location: "Bin A-07", batch: "BCH-2024-1102", status: "Stored" },
    ],

    documents: [
      { id: "PDOC-005", name: "Signed Purchase Form", type: "Purchase Form", uploadDate: "2024-05-15", uploadedBy: "Sarah Mwale", status: "Verified" },
      { id: "PDOC-006", name: "Weight Ticket — WH-MCH-001", type: "Weight Ticket", uploadDate: "2024-05-15", uploadedBy: "Samuel Nyirenda", status: "Verified" },
    ],

    timeline: [
      { id: 1, activity: "Purchase Created", date: "2024-05-15", time: "08:05 AM", performedBy: "Sarah Mwale", details: "Purchase record initiated at Mchinji Central Buying Centre.", icon: "create" },
      { id: 2, activity: "Commodity Weighed", date: "2024-05-15", time: "08:25 AM", performedBy: "Samuel Nyirenda", details: "3 bags weighed at 50 kg each. Total: 150 kg.", icon: "scale" },
      { id: 3, activity: "Purchase Approved", date: "2024-05-15", time: "09:00 AM", performedBy: "George Kachingwe", details: "Purchase approved by IPC Manager.", icon: "approve" },
      { id: 4, activity: "Goods Received", date: "2024-05-15", time: "09:30 AM", performedBy: "Samuel Nyirenda", details: "GRN-2024-0442 issued. All 150 kg accepted.", icon: "receive" },
      { id: 5, activity: "Payment Processed", date: "2024-05-16", time: "09:15 AM", performedBy: "System", details: "MWK 26,500 sent via Airtel Money. Ref: ATL-20240516-11235.", icon: "payment" },
    ],
  },

  {
    id: "PUR-2024-0003",
    receiptNumber: "RCP-2024-8803",
    status: "Pending Payment",
    purchaseDate: "2024-06-01",
    buyingCentre: "Kasungu Boma Buying Centre",
    ipc: "Kasungu IPC",
    purchasingOfficer: "Peter Zimba",
    approvedBy: "Alice Mbewe",

    farmerId: "FMR-2024-0003",
    farmerName: "Grace Mwale",
    farmerPhone: "+265 995 555 123",
    farmerAssociation: "Kasungu Central Association",
    farmerClub: "Mtendere Club",
    farmerGroup: "Mtendere Group C",
    farmerVillage: "Kavala",
    farmerDistrict: "Kasungu",
    farmerStatus: "Active",

    commodity: "Soybeans",
    variety: "Tikolore",
    grade: "Grade 2",
    qualityGrade: "Standard",
    numberOfBags: 5,
    bagWeight: 50,
    totalWeight: 250,
    unitPrice: 120,
    grossAmount: 30000,
    purchaseNotes: "Good quality soybeans.",
    commodityStatus: "Accepted",

    seedLoanDeduction: 3000,
    otherDeductions: 200,
    netPayable: 26800,
    paymentStatus: "Pending",
    paymentMethod: "Mobile Money (TNM Mpamba)",
    paymentDate: null,
    paymentReference: null,

    grn: {
      grnNumber: "GRN-2024-0503",
      warehouse: "Kasungu Silo",
      warehouseCode: "WH-KSG-001",
      receivingOfficer: "Alice Mbewe",
      receivingDate: "2024-06-01",
      acceptedQuantity: 250,
      rejectedQuantity: 0,
      grnStatus: "Verified",
    },

    warehouse: {
      name: "Kasungu Silo",
      location: "Kasungu Industrial Area",
      currentStockStatus: "Stored",
      bin: "C-02",
      stack: "S-07",
      shelf: "Level 3",
      storageCondition: "Dry & Ventilated",
      inventoryStatus: "Active",
    },

    batch: {
      batchNumber: "BCH-2024-1198",
      batchStatus: "Active",
      batchCreationDate: "2024-06-02",
      currentWarehouse: "Kasungu Silo",
      commodity: "Soybeans",
      quantity: 250,
      qualityStatus: "Passed",
    },

    bags: [
      { bagNumber: "BAG-9201", weight: 50, location: "Bin C-02", batch: "BCH-2024-1198", status: "Stored" },
      { bagNumber: "BAG-9202", weight: 50, location: "Bin C-02", batch: "BCH-2024-1198", status: "Stored" },
      { bagNumber: "BAG-9203", weight: 50, location: "Bin C-02", batch: "BCH-2024-1198", status: "Stored" },
      { bagNumber: "BAG-9204", weight: 50, location: "Bin C-02", batch: "BCH-2024-1198", status: "Stored" },
      { bagNumber: "BAG-9205", weight: 50, location: "Bin C-02", batch: "BCH-2024-1198", status: "Stored" },
    ],

    documents: [
      { id: "PDOC-007", name: "Signed Purchase Form", type: "Purchase Form", uploadDate: "2024-06-01", uploadedBy: "Peter Zimba", status: "Verified" },
      { id: "PDOC-008", name: "Weight Ticket — WH-KSG-001", type: "Weight Ticket", uploadDate: "2024-06-01", uploadedBy: "Alice Mbewe", status: "Pending" },
    ],

    timeline: [
      { id: 1, activity: "Purchase Created", date: "2024-06-01", time: "10:00 AM", performedBy: "Peter Zimba", details: "Purchase record initiated at Kasungu Boma Buying Centre.", icon: "create" },
      { id: 2, activity: "Commodity Weighed", date: "2024-06-01", time: "10:20 AM", performedBy: "Alice Mbewe", details: "5 bags weighed at 50 kg each. Total: 250 kg.", icon: "scale" },
      { id: 3, activity: "Purchase Approved", date: "2024-06-01", time: "11:00 AM", performedBy: "Alice Mbewe", details: "Purchase approved by IPC Manager.", icon: "approve" },
      { id: 4, activity: "Goods Received", date: "2024-06-01", time: "11:30 AM", performedBy: "Alice Mbewe", details: "GRN-2024-0503 issued. All 250 kg accepted.", icon: "receive" },
    ],
  },

  {
    id: "PUR-2024-0004",
    receiptNumber: "RCP-2024-8804",
    status: "Draft",
    purchaseDate: "2024-06-10",
    buyingCentre: "Mzimba North Buying Centre",
    ipc: "Mzimba IPC",
    purchasingOfficer: "James Tembo",
    approvedBy: null,

    farmerId: "FMR-2024-0004",
    farmerName: "Elias Zimba",
    farmerPhone: "+265 888 111 222",
    farmerAssociation: "Mzimba Farmers Trust",
    farmerClub: "Umodzi Club",
    farmerGroup: "Umodzi Group D",
    farmerVillage: "Edingeni",
    farmerDistrict: "Mzimba",
    farmerStatus: "Inactive",

    commodity: "Maize",
    variety: "SC403",
    grade: "Grade 2",
    qualityGrade: "Standard",
    numberOfBags: 8,
    bagWeight: 50,
    totalWeight: 400,
    unitPrice: 70,
    grossAmount: 28000,
    purchaseNotes: "Pending re-inspection.",
    commodityStatus: "Under Review",

    seedLoanDeduction: 0,
    otherDeductions: 0,
    netPayable: 28000,
    paymentStatus: "Not Started",
    paymentMethod: "—",
    paymentDate: null,
    paymentReference: null,

    grn: {
      grnNumber: "—",
      warehouse: "Mzimba Depot",
      warehouseCode: "WH-MZB-001",
      receivingOfficer: "—",
      receivingDate: "—",
      acceptedQuantity: 0,
      rejectedQuantity: 0,
      grnStatus: "Pending",
    },

    warehouse: {
      name: "Mzimba Depot",
      location: "Mzimba Boma",
      currentStockStatus: "Not Yet Received",
      bin: "—",
      stack: "—",
      shelf: "—",
      storageCondition: "—",
      inventoryStatus: "Pending",
    },

    batch: {
      batchNumber: "—",
      batchStatus: "Not Created",
      batchCreationDate: "—",
      currentWarehouse: "—",
      commodity: "Maize",
      quantity: 0,
      qualityStatus: "Pending Inspection",
    },

    bags: [],

    documents: [
      { id: "PDOC-009", name: "Draft Purchase Form", type: "Purchase Form", uploadDate: "2024-06-10", uploadedBy: "James Tembo", status: "Draft" },
    ],

    timeline: [
      { id: 1, activity: "Purchase Created (Draft)", date: "2024-06-10", time: "14:00 PM", performedBy: "James Tembo", details: "Draft purchase record created. Pending quality re-inspection.", icon: "create" },
    ],
  },

  {
    id: "PUR-2024-0005",
    receiptNumber: "RCP-2024-8805",
    status: "Completed",
    purchaseDate: "2024-06-15",
    buyingCentre: "Lilongwe North Buying Centre",
    ipc: "Lilongwe IPC",
    purchasingOfficer: "John Phiri",
    approvedBy: "Mary Zgambo",

    farmerId: "FMR-2024-0005",
    farmerName: "Luka Kamwendo",
    farmerPhone: "+265 999 888 777",
    farmerAssociation: "Lilongwe North Association",
    farmerClub: "Tiyanjane Club",
    farmerGroup: "Tiyanjane Group A",
    farmerVillage: "Mphande 2",
    farmerDistrict: "Lilongwe",
    farmerStatus: "Active",

    commodity: "Groundnuts",
    variety: "CG7",
    grade: "Grade 1",
    qualityGrade: "Premium",
    moistureContent: "7.8%",
    numberOfBags: 2,
    bagWeight: 50,
    totalWeight: 100,
    unitPrice: 215,
    grossAmount: 21500,
    purchaseNotes: "Very dry, excellent quality.",
    commodityStatus: "Accepted",

    seedLoanDeduction: 1500,
    otherDeductions: 0,
    netPayable: 20000,
    paymentStatus: "Paid",
    paymentMethod: "Airtel Money",
    paymentDate: "2024-06-16",
    paymentReference: "ATL-20240616-55609",

    grn: {
      grnNumber: "GRN-2024-0588",
      warehouse: "Lilongwe Main Silo",
      warehouseCode: "WH-LLW-001",
      receivingOfficer: "Peter Zimba",
      receivingDate: "2024-06-15",
      acceptedQuantity: 100,
      rejectedQuantity: 0,
      grnStatus: "Verified",
    },

    warehouse: {
      name: "Lilongwe Main Silo",
      location: "Area 23, Lilongwe",
      currentStockStatus: "Stored",
      bin: "B-09",
      stack: "S-01",
      shelf: "Level 1",
      storageCondition: "Dry & Ventilated",
      inventoryStatus: "Active",
    },

    batch: {
      batchNumber: "BCH-2024-1250",
      batchStatus: "Active",
      batchCreationDate: "2024-06-16",
      currentWarehouse: "Lilongwe Main Silo",
      commodity: "Groundnuts",
      quantity: 100,
      qualityStatus: "Passed",
    },

    bags: [
      { bagNumber: "BAG-9401", weight: 50, location: "Bin B-09", batch: "BCH-2024-1250", status: "Stored" },
      { bagNumber: "BAG-9402", weight: 50, location: "Bin B-09", batch: "BCH-2024-1250", status: "Stored" },
    ],

    documents: [
      { id: "PDOC-010", name: "Signed Purchase Form", type: "Purchase Form", uploadDate: "2024-06-15", uploadedBy: "John Phiri", status: "Verified" },
      { id: "PDOC-011", name: "Weight Ticket — WH-LLW-001", type: "Weight Ticket", uploadDate: "2024-06-15", uploadedBy: "Peter Zimba", status: "Verified" },
      { id: "PDOC-012", name: "Quality Inspection Report", type: "Quality Certificate", uploadDate: "2024-06-15", uploadedBy: "Peter Zimba", status: "Verified" },
    ],

    timeline: [
      { id: 1, activity: "Purchase Created", date: "2024-06-15", time: "07:50 AM", performedBy: "John Phiri", details: "Purchase record initiated.", icon: "create" },
      { id: 2, activity: "Commodity Weighed", date: "2024-06-15", time: "08:10 AM", performedBy: "Peter Zimba", details: "2 bags at 50 kg each. Total: 100 kg.", icon: "scale" },
      { id: 3, activity: "Purchase Approved", date: "2024-06-15", time: "08:35 AM", performedBy: "Mary Zgambo", details: "Approved by IPC Manager.", icon: "approve" },
      { id: 4, activity: "Goods Received", date: "2024-06-15", time: "09:00 AM", performedBy: "Peter Zimba", details: "GRN-2024-0588 issued.", icon: "receive" },
      { id: 5, activity: "Payment Processed", date: "2024-06-16", time: "08:00 AM", performedBy: "System", details: "MWK 20,000 via Airtel Money.", icon: "payment" },
    ],
  },

  {
    id: "PUR-2024-0006",
    receiptNumber: "RCP-2024-8806",
    status: "Rejected",
    purchaseDate: "2024-06-20",
    buyingCentre: "Kasungu Boma Buying Centre",
    ipc: "Kasungu IPC",
    purchasingOfficer: "Peter Zimba",
    approvedBy: null,

    farmerId: "FMR-2024-0003",
    farmerName: "Grace Mwale",
    farmerPhone: "+265 995 555 123",
    farmerAssociation: "Kasungu Central Association",
    farmerClub: "Mtendere Club",
    farmerGroup: "Mtendere Group C",
    farmerVillage: "Kavala",
    farmerDistrict: "Kasungu",
    farmerStatus: "Active",

    commodity: "Beans",
    variety: "Napilira",
    grade: "Grade 3",
    qualityGrade: "Below Standard",
    numberOfBags: 2,
    bagWeight: 50,
    totalWeight: 100,
    unitPrice: 85,
    grossAmount: 8500,
    purchaseNotes: "Rejected due to quality non-compliance.",
    commodityStatus: "Rejected",

    seedLoanDeduction: 0,
    otherDeductions: 0,
    netPayable: 0,
    paymentStatus: "Not Applicable",
    paymentMethod: "—",
    paymentDate: null,
    paymentReference: null,

    grn: {
      grnNumber: "—",
      warehouse: "Kasungu Silo",
      warehouseCode: "WH-KSG-001",
      receivingOfficer: "Alice Mbewe",
      receivingDate: "2024-06-20",
      acceptedQuantity: 0,
      rejectedQuantity: 100,
      grnStatus: "Rejected",
    },

    warehouse: {
      name: "Kasungu Silo",
      location: "Kasungu Industrial Area",
      currentStockStatus: "Not Received",
      bin: "—",
      stack: "—",
      shelf: "—",
      storageCondition: "—",
      inventoryStatus: "Not Applicable",
    },

    batch: {
      batchNumber: "—",
      batchStatus: "Not Created",
      batchCreationDate: "—",
      currentWarehouse: "—",
      commodity: "Beans",
      quantity: 0,
      qualityStatus: "Failed",
    },

    bags: [],

    documents: [
      { id: "PDOC-013", name: "Rejection Notice", type: "Rejection Notice", uploadDate: "2024-06-20", uploadedBy: "Alice Mbewe", status: "Issued" },
    ],

    timeline: [
      { id: 1, activity: "Purchase Created", date: "2024-06-20", time: "13:00 PM", performedBy: "Peter Zimba", details: "Purchase record initiated.", icon: "create" },
      { id: 2, activity: "Commodity Weighed", date: "2024-06-20", time: "13:20 PM", performedBy: "Alice Mbewe", details: "2 bags at 50 kg each. Total: 100 kg.", icon: "scale" },
      { id: 3, activity: "Quality Inspection Failed", date: "2024-06-20", time: "13:45 PM", performedBy: "Alice Mbewe", details: "Quality inspection failed — non-compliant.", icon: "inspect" },
      { id: 4, activity: "Purchase Rejected", date: "2024-06-20", time: "14:00 PM", performedBy: "Alice Mbewe", details: "Commodity returned to farmer. Rejection notice issued.", icon: "reject" },
    ],
  },
];
