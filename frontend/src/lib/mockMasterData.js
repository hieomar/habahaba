// ─────────────────────────────────────────────────────────────
// NASFAM GTMS — Master Data
// Reference data used across the entire system
// ─────────────────────────────────────────────────────────────

// ── IPCs ─────────────────────────────────────────────────────
export const mockIPCs = [
  { id: "IPC-001", name: "Lilongwe IPC",  district: "Lilongwe",  region: "Central", manager: "IPC Manager - Lilongwe", warehouseCount: 1, farmerCount: 4, status: "Active", establishedDate: "2020-01-15" },
  { id: "IPC-002", name: "Mchinji IPC",   district: "Mchinji",   region: "Central", manager: "IPC Manager - Mchinji",  warehouseCount: 1, farmerCount: 2, status: "Active", establishedDate: "2020-03-01" },
  { id: "IPC-003", name: "Kasungu IPC",   district: "Kasungu",   region: "Central", manager: "IPC Manager - Kasungu",  warehouseCount: 1, farmerCount: 2, status: "Active", establishedDate: "2020-06-10" },
  { id: "IPC-004", name: "Dedza IPC",     district: "Dedza",     region: "Central", manager: "TBD",                   warehouseCount: 0, farmerCount: 0, status: "Pending", establishedDate: "2026-01-01" },
];

// ── Warehouses ────────────────────────────────────────────────
export const mockWarehouses = [
  { id: "WH-001", name: "Lilongwe Warehouse", ipcId: "IPC-001", ipc: "Lilongwe IPC", district: "Lilongwe", location: "Area 25, Lilongwe", capacityMT: 500,  currentStockMT: 0.9, status: "Active", managedBy: "Warehouse Officer - Lilongwe", gpsLat: -13.9626, gpsLng: 33.7741, openedDate: "2020-02-01" },
  { id: "WH-002", name: "Mchinji Warehouse",  ipcId: "IPC-002", ipc: "Mchinji IPC",  district: "Mchinji",  location: "Mchinji Town",    capacityMT: 400,  currentStockMT: 0.4, status: "Active", managedBy: "Warehouse Officer - Mchinji",  gpsLat: -13.7918, gpsLng: 32.8817, openedDate: "2020-03-15" },
  { id: "WH-003", name: "Kasungu Warehouse",  ipcId: "IPC-003", ipc: "Kasungu IPC",  district: "Kasungu",  location: "Kasungu Town",    capacityMT: 400,  currentStockMT: 0.3, status: "Active", managedBy: "Warehouse Officer - Kasungu",  gpsLat: -13.0116, gpsLng: 33.4851, openedDate: "2020-06-20" },
];

// ── Associations ──────────────────────────────────────────────
export const mockAssociations = [
  { id: "ASC-001", name: "Chifunga Association",   ipc: "Lilongwe IPC",  district: "Lilongwe", clubCount: 3, farmerCount: 45, chairperson: "John Chifunga",  status: "Active" },
  { id: "ASC-002", name: "Mbwatalika Association",  ipc: "Lilongwe IPC",  district: "Lilongwe", clubCount: 2, farmerCount: 28, chairperson: "Agnes Mbwatalika",status: "Active" },
  { id: "ASC-003", name: "Kapiri Association",      ipc: "Mchinji IPC",   district: "Mchinji",  clubCount: 4, farmerCount: 60, chairperson: "Steven Kapiri",   status: "Active" },
  { id: "ASC-004", name: "Mkanda Association",      ipc: "Mchinji IPC",   district: "Mchinji",  clubCount: 2, farmerCount: 32, chairperson: "Mary Mkanda",     status: "Active" },
  { id: "ASC-005", name: "Central Association",     ipc: "Kasungu IPC",   district: "Kasungu",  clubCount: 5, farmerCount: 72, chairperson: "Paul Kasungu",    status: "Active" },
  { id: "ASC-006", name: "Nsundwe Association",     ipc: "Lilongwe IPC",  district: "Lilongwe", clubCount: 3, farmerCount: 41, chairperson: "Gift Nsundwe",    status: "Active" },
  { id: "ASC-007", name: "Dzenza Association",      ipc: "Lilongwe IPC",  district: "Lilongwe", clubCount: 2, farmerCount: 25, chairperson: "Ruth Dzenza",     status: "Active" },
  { id: "ASC-008", name: "Chulu Association",       ipc: "Kasungu IPC",   district: "Kasungu",  clubCount: 3, farmerCount: 38, chairperson: "James Chulu",     status: "Active" },
];

// ── Clubs ─────────────────────────────────────────────────────
export const mockClubs = [
  { id: "CLB-001", name: "Sunrise Club",       associationId: "ASC-001", association: "Chifunga Association",   ipc: "Lilongwe IPC",  farmerCount: 15, secretary: "Grace Moyo",   status: "Active" },
  { id: "CLB-002", name: "Green Valley Club",  associationId: "ASC-002", association: "Mbwatalika Association",  ipc: "Lilongwe IPC",  farmerCount: 14, secretary: "Peter Phiri",  status: "Active" },
  { id: "CLB-003", name: "Unity Club",         associationId: "ASC-003", association: "Kapiri Association",      ipc: "Mchinji IPC",   farmerCount: 18, secretary: "Anne Banda",   status: "Active" },
  { id: "CLB-004", name: "Hope Club",          associationId: "ASC-005", association: "Central Association",     ipc: "Kasungu IPC",   farmerCount: 20, secretary: "Isaac Phiri",  status: "Active" },
  { id: "CLB-005", name: "Progress Club",      associationId: "ASC-006", association: "Nsundwe Association",     ipc: "Lilongwe IPC",  farmerCount: 12, secretary: "Mary Mbewe",   status: "Active" },
  { id: "CLB-006", name: "Blue Sky Club",      associationId: "ASC-007", association: "Dzenza Association",      ipc: "Lilongwe IPC",  farmerCount: 10, secretary: "John Mvula",   status: "Active" },
  { id: "CLB-007", name: "Harvest Club",       associationId: "ASC-008", association: "Chulu Association",       ipc: "Kasungu IPC",   farmerCount: 16, secretary: "Ruth Lungu",   status: "Active" },
];

// ── Commodities ───────────────────────────────────────────────
export const mockCommodities = [
  { id: "COM-001", name: "Maize",      code: "MZE", unit: "kg", minGradeKg: 80, maxGradeKg: 95, status: "Active" },
  { id: "COM-002", name: "Soya",       code: "SOY", unit: "kg", minGradeKg: 80, maxGradeKg: 95, status: "Active" },
  { id: "COM-003", name: "Groundnuts", code: "GND", unit: "kg", minGradeKg: 45, maxGradeKg: 55, status: "Active" },
  { id: "COM-004", name: "Pigeon Peas",code: "PGP", unit: "kg", minGradeKg: 80, maxGradeKg: 95, status: "Active" },
  { id: "COM-005", name: "Cotton",     code: "COT", unit: "kg", minGradeKg: 80, maxGradeKg: 95, status: "Active" },
];

// ── Districts ─────────────────────────────────────────────────
export const mockDistricts = [
  { id: "DIS-001", name: "Lilongwe",   region: "Central", ipcCount: 1 },
  { id: "DIS-002", name: "Mchinji",    region: "Central", ipcCount: 1 },
  { id: "DIS-003", name: "Kasungu",    region: "Central", ipcCount: 1 },
  { id: "DIS-004", name: "Dedza",      region: "Central", ipcCount: 1 },
  { id: "DIS-005", name: "Salima",     region: "Central", ipcCount: 0 },
  { id: "DIS-006", name: "Blantyre",   region: "Southern", ipcCount: 0 },
];

// ── Marketing Centres ─────────────────────────────────────────
export const mockMarketingCentres = [
  { id: "MC-001", name: "Chifunga Marketing Centre",   district: "Lilongwe",  ipc: "Lilongwe IPC",  associationId: "ASC-001", gpsLat: -13.9526, gpsLng: 33.7641, status: "Active", marketingOfficer: "Marketing Officer - Lilongwe 1" },
  { id: "MC-002", name: "Mbwatalika Marketing Centre", district: "Lilongwe",  ipc: "Lilongwe IPC",  associationId: "ASC-002", gpsLat: -14.0123, gpsLng: 33.8012, status: "Active", marketingOfficer: "Marketing Officer - Lilongwe 2" },
  { id: "MC-003", name: "Kapiri Marketing Centre",     district: "Mchinji",   ipc: "Mchinji IPC",   associationId: "ASC-003", gpsLat: -13.7818, gpsLng: 32.8717, status: "Active", marketingOfficer: "Marketing Officer - Mchinji 1" },
  { id: "MC-004", name: "Mkanda Marketing Centre",     district: "Mchinji",   ipc: "Mchinji IPC",   associationId: "ASC-004", gpsLat: -13.6101, gpsLng: 32.6818, status: "Active", marketingOfficer: "Marketing Officer - Mchinji 2" },
  { id: "MC-005", name: "Central Marketing Centre",    district: "Kasungu",   ipc: "Kasungu IPC",   associationId: "ASC-005", gpsLat: -13.0016, gpsLng: 33.4751, status: "Active", marketingOfficer: "Marketing Officer - Kasungu 1" },
  { id: "MC-006", name: "Nsundwe Marketing Centre",    district: "Lilongwe",  ipc: "Lilongwe IPC",  associationId: "ASC-006", gpsLat: -13.8841, gpsLng: 33.6421, status: "Active", marketingOfficer: "Marketing Officer - Lilongwe 3" },
];

// ── Customers ─────────────────────────────────────────────────
export const mockCustomers = [
  { id: "CUST-001", name: "ADMARC Kasungu",         type: "Government",  contact: "+265 999 100 001", address: "ADMARC Depot, Kasungu", status: "Active" },
  { id: "CUST-002", name: "ADMARC Lilongwe",         type: "Government",  contact: "+265 999 100 002", address: "ADMARC Depot, Lilongwe", status: "Active" },
  { id: "CUST-003", name: "National Food Reserve",   type: "Government",  contact: "+265 999 100 003", address: "NFR Headquarters, Lilongwe", status: "Active" },
  { id: "CUST-004", name: "Rab Processors Ltd",      type: "Private",     contact: "+265 999 200 001", address: "Lilongwe Industrial Area", status: "Active" },
  { id: "CUST-005", name: "Alliance One Tobacco",    type: "Private",     contact: "+265 999 200 002", address: "Kanengo, Lilongwe", status: "Active" },
  { id: "CUST-006", name: "Eastern Produce Malawi",  type: "Private",     contact: "+265 999 200 003", address: "Blantyre", status: "Active" },
];

// ── Users ─────────────────────────────────────────────────────
export const mockUsers = [
  { id: "USR-001", name: "System Administrator",   email: "admin@nasfam.mw",        role: "System Admin",         assignedIPC: null,             status: "Active", createdAt: "2024-01-15" },
  { id: "USR-002", name: "WH Officer - Lilongwe",  email: "wh.lilongwe@nasfam.mw",  role: "Warehouse Officer",    assignedIPC: "Lilongwe IPC",   status: "Active", createdAt: "2024-02-01" },
  { id: "USR-003", name: "IPC Manager - Lilongwe", email: "ipc.lilongwe@nasfam.mw", role: "IPC Manager",          assignedIPC: "Lilongwe IPC",   status: "Active", createdAt: "2024-02-01" },
  { id: "USR-004", name: "WH Officer - Mchinji",   email: "wh.mchinji@nasfam.mw",   role: "Warehouse Officer",    assignedIPC: "Mchinji IPC",    status: "Active", createdAt: "2024-03-10" },
  { id: "USR-005", name: "IPC Manager - Mchinji",  email: "ipc.mchinji@nasfam.mw",  role: "IPC Manager",          assignedIPC: "Mchinji IPC",    status: "Active", createdAt: "2024-03-10" },
  { id: "USR-006", name: "Head Office Manager",     email: "headoffice@nasfam.mw",   role: "Head Office Manager",  assignedIPC: null,             status: "Active", createdAt: "2024-01-20" },
  { id: "USR-007", name: "WH Officer - Kasungu",   email: "wh.kasungu@nasfam.mw",   role: "Warehouse Officer",    assignedIPC: "Kasungu IPC",    status: "Active", createdAt: "2024-06-15" },
];

// ── Lookup helpers ────────────────────────────────────────────
export const getIPCById          = (id) => mockIPCs.find((x) => x.id === id) ?? null;
export const getWarehouseById    = (id) => mockWarehouses.find((x) => x.id === id) ?? null;
export const getCommodityByName  = (name) => mockCommodities.find((x) => x.name === name) ?? null;
export const getCustomerById     = (id) => mockCustomers.find((x) => x.id === id) ?? null;
export const getUserById         = (id) => mockUsers.find((x) => x.id === id) ?? null;
