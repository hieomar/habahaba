# Website Backend Requirements Specification
**System**: Grain Traceability Management System (GTMS) - Website Frontend Reverse-Engineering  
**Version**: 1.0.0  
**Target Architecture**: Single Point of Truth Node.js/Express REST API backend with Prisma ORM & PostgreSQL.

---

## 1. Executive Summary & Architecture Overview

This specification details the backend requirements reverse-engineered strictly from the GTMS Website Frontend UI (`GTMS-Grain_Traceability_Management_System`). The GTMS platform is a multi-tier agricultural traceability and warehouse management system designed to track grain commodities from primary producers (farmers and farms) through Innovation & Productivity Centres (IPCs), marketing buying centers, warehouse receiving (GRNs), batch aggregation, inventory management, and eventual customer dispatch.

---

## 2. User Roles & Permission Matrix (RBAC)

The system defines 4 primary system roles and a granular permission model:

### System Roles
1. **System Administrator (`role-sysadmin`)**: Full unrestrictive administrative access across all modules, configuration, security, audit logs, and master data.
2. **Warehouse Officer (`role-warehouse-officer`)**: Operationally restricted to local warehouse management: Commodity Purchases, Warehouse Stock, GRNs, Batch Management, Inventory, Dispatch, Traceability, Reports, and Notifications.
3. **IPC Manager (`role-ipc-manager`)**: Supervisory role covering regional IPC operations: Farmer Management, Farm Management, Commodity Purchases, Warehouse Inventory, Traceability, Reports, and Notifications.
4. **Head Office Manager (`role-head-office`)**: Executive oversight across all IPCs: Farmer Management, Commodity Purchases, Inventory, Traceability, Reports, and Notifications.

### Module Access Matrix

| Module | System Admin | Warehouse Officer | IPC Manager | Head Office Manager |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Farmer Management** | ✅ | ❌ | ✅ | ✅ |
| **Farm Management** | ✅ | ❌ | ✅ | ❌ |
| **Commodity Purchases** | ✅ | ✅ | ✅ | ✅ |
| **Warehouse Operations** | ✅ | ✅ | ✅ | ❌ |
| **GRN Management** | ✅ | ✅ | ❌ | ❌ |
| **Batch Management** | ✅ | ✅ | ❌ | ❌ |
| **Inventory** | ✅ | ✅ | ✅ | ✅ |
| **Dispatch** | ✅ | ✅ | ❌ | ❌ |
| **Traceability** | ✅ | ✅ | ✅ | ✅ |
| **Reports** | ✅ | ✅ | ✅ | ✅ |
| **IPC Management** | ✅ | ❌ | ❌ | ❌ |
| **Warehouse Management** | ✅ | ❌ | ❌ | ❌ |
| **Marketing Centre Mgmt** | ✅ | ❌ | ❌ | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ |
| **Role Management** | ✅ | ❌ | ❌ | ❌ |
| **Permission Management** | ✅ | ❌ | ❌ | ❌ |
| **Master Data** | ✅ | ❌ | ❌ | ❌ |
| **Mobile Data Sync** | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** | ✅ | ❌ | ❌ | ❌ |
| **Notifications** | ✅ | ✅ | ✅ | ✅ |
| **Settings** | ✅ | ❌ | ❌ | ❌ |

---

## 3. Detailed Frontend Modules, Pages, Forms & Tables

### Module 1: Authentication & User Profile
- **Pages**:
  - `/login`: User authentication page.
  - `/dashboard/profile`: Personal profile management page.
- **Forms**:
  - *Login Form*: `email` (string, required, email format), `password` (string, required).
  - *Profile Update Form*: `name` (string, required), `email` (string, required), `phone` (string, required), `currentPassword` (string, optional), `newPassword` (string, optional).
- **Validation Rules**:
  - Email must be valid domain user.
  - Password required minimum 6 characters.

### Module 2: Farmer Management
- **Pages**:
  - `/dashboard/farmers/registration`: Farmer creation form.
  - `/dashboard/farmers/profiles`: Paginated/Searchable list of all registered farmers.
  - `/dashboard/farmers/profiles/[id]`: Farmer detailed profile & linked records.
  - `/dashboard/farmers/history`: Farmer transaction, purchase, and delivery timeline.
  - `/dashboard/farmers/groups`: Farmer Associations, Clubs, and GACs registry.
- **Forms**:
  - *Farmer Registration Form*:
    - Personal: `fullName` (required), `gender` (`Male` | `Female`), `dob` (date), `nationalId` (required, unique format `PXXXXXXX`), `phone` (phone format), `altPhone` (optional), `photo` (file upload).
    - Location: `district` (required), `ta` (Traditional Authority), `epa` (Extension Planning Area), `section`, `village` (required), `gps` (latitude/longitude coordinates).
    - Organization: `association` (required), `club` (required), `group`, `memberNo` (unique code).
    - Farm Specs: `farmSize` (number, >0), `unit` (`Hectares` | `Acres`), `primaryCrops` (multi-select), `secondaryCrops` (multi-select), `productionSeason`.
- **Tables**:
  - *Farmers List Table*: `ID`, `Full Name`, `National ID`, `Phone`, `District`, `Association`, `Club`, `Farm Size`, `Status`, `Actions`.
  - *Farmer Groups Table*: `Association ID`, `Association Name`, `District`, `Clubs Count`, `Total Farmers`, `Chairperson`, `Status`.
- **Search & Filters**: Search by Farmer Name, National ID, Phone, Member No; Filter by District, Association, Club, Status (`Active`, `Pending Verification`, `Suspended`).

### Module 3: Farm Management
- **Pages**:
  - `/dashboard/farms`: Farm polygon/location registry and harvest estimator.
- **Forms**:
  - *Farm Registration/Edit Form*: `farmerId` (required dropdown), `district` (required), `village` (required), `ipc` (required), `association`, `club`, `sizeHectares` (decimal, required), `gpsLat` (float), `gpsLng` (float), `primaryCrop` (required), `secondaryCrop`, `season` (e.g. `2025/2026`), `productionEstimateKg` (number), `soilType` (`Sandy Loam`, `Clay`, `Loam`, etc.), `irrigated` (boolean), `extensionNotes` (text).
- **Tables**:
  - *Farms Table*: `Farm ID`, `Farmer Name`, `District`, `IPC`, `Size (Ha)`, `GPS Coordinates`, `Primary Crop`, `Est. Production (Kg)`, `Last Visit Date`, `Status`.

### Module 4: Commodity Purchasing
- **Pages**:
  - `/dashboard/purchasing`: Purchase transactions list & record purchase modal.
  - `/dashboard/purchasing/[id]`: Purchase receipt printout & audit detail.
- **Forms**:
  - *Purchase Entry Form*:
    - Context: `buyingCentre` (required), `ipc` (required), `purchaseDate` (date, default today).
    - Farmer: `farmerId` (required lookup). Auto-populates `farmerName`, `farmerPhone`, `association`, `club`, `village`, `district`.
    - Commodity details: `commodity` (required), `variety`, `grade` (`Grade 1`, `Grade 2`), `qualityGrade` (`Premium`, `Standard`, `Substandard`), `numberOfBags` (integer, >0), `bagWeight` (kg, default 50), `unitPrice` (MWK/kg, >0).
    - Auto-Calculations: `totalWeight = numberOfBags * bagWeight`, `grossAmount = totalWeight * unitPrice`.
    - Financial Deductions: `seedLoanDeduction` (decimal, default 0), `otherDeductions` (decimal, default 0).
    - Net Payable: `netPayable = grossAmount - (seedLoanDeduction + otherDeductions)`.
    - Payment Info: `paymentStatus` (`Pending`, `Paid`), `paymentMethod` (`Mobile Money (TNM Mpamba)`, `Airtel Money`, `Bank Transfer`, `Cash`), `paymentReference` (string).
- **Tables**:
  - *Purchases Table*: `Receipt #`, `Date`, `Farmer Name`, `Commodity`, `Total Weight (Kg)`, `Gross Amount`, `Deductions`, `Net Payable`, `Payment Status`, `GRN Status`, `Actions`.

### Module 5: Goods Received Note (GRN) Management
- **Pages**:
  - `/dashboard/grn`: Intake receiving notes list & GRN issuing modal.
- **Forms**:
  - *GRN Creation Form*: `grnNumber` (auto-generated `GRN-YYYY-XXXX`), `purchaseId` or `purchaseReceiptNumber` (required lookup), `warehouseId` (required), `receivingOfficer` (required), `receivingDate` (date), `grossWeight` (kg), `tareWeight` (kg), `netWeight` (kg), `moistureContentPercent` (decimal, e.g. 12.5%), `acceptedQuantity` (kg), `rejectedQuantity` (kg), `rejectionReason` (text), `transporterName`, `vehicleReg`, `driverPhone`, `inspectorSignOff` (boolean/string).
- **Tables**:
  - *GRN List Table*: `GRN Ref`, `Date`, `Warehouse`, `Farmer / Source`, `Commodity`, `Gross Weight`, `Tare Weight`, `Net Accepted (Kg)`, `Moisture %`, `Receiving Officer`, `Status`.

### Module 6: Batch Management
- **Pages**:
  - `/dashboard/batches`: Aggregated lot and batch allocation page.
- **Forms**:
  - *Batch Creation Form*: `batchNumber` (auto-generated `BATCH-YYYY-XXX`), `warehouseId` (required), `ipc` (required), `commodity` (required), `grnIds` (multi-select linked GRNs), `numberOfBags` (integer), `totalWeightKg` (decimal), `storageLocation` (e.g. `Section A, Row 1`), `notes` (text).
- **Tables**:
  - *Batches Table*: `Batch Code`, `Warehouse`, `IPC`, `Commodity`, `Bags Count`, `Total Weight (Kg)`, `Storage Location`, `Linked GRNs`, `Created By`, `Status` (`Active`, `Processing`, `Stored`, `Dispatched`).

### Module 7: Inventory Management
- **Pages**:
  - `/dashboard/inventory`: Stock level overview, utilization metrics, and stock movement ledger.
- **Tables**:
  - *Stock Summary Table*: `Warehouse`, `IPC`, `Commodity`, `Current Stock (Kg)`, `Bag Count`, `Capacity (Kg)`, `Utilization %`, `Stock Status` (`Normal`, `Low Stock`, `Over Capacity`, `Empty`), `Last Updated`.
  - *Stock Movements Table*: `Movement ID`, `Type` (`Inward` | `Outward` | `Adjustment`), `Warehouse`, `Commodity`, `Quantity (Kg)`, `Reference (GRN/Dispatch Code)`, `Date`, `Officer`.

### Module 8: Dispatch Management
- **Pages**:
  - `/dashboard/dispatch`: Customer & inter-warehouse outward transport dispatches.
- **Forms**:
  - *Dispatch Entry Form*: `dispatchNumber` (auto-generated `DSP-YYYY-XXX`), `customerId` / `destinationWarehouseId` (required), `warehouseId` (source), `batchId` (required dropdown), `commodity`, `numberOfBags` (integer), `quantityKg` (decimal), `dispatchDate` (date), `deliveryAddress` (text), `vehicleReg` (required), `driverName` (required), `notes`.
- **Tables**:
  - *Dispatch Table*: `Waybill #`, `Dispatch Date`, `Source Warehouse`, `Destination / Customer`, `Commodity`, `Batch Code`, `Bags`, `Quantity (Kg)`, `Vehicle Reg`, `Driver`, `Status` (`In Transit`, `Delivered`, `Cancelled`).

### Module 9: Traceability Intelligence
- **Pages**:
  - `/dashboard/traceability`: End-to-end audit lookup and geographical chain-of-custody.
- **Inputs**: Search query by QR Code, Batch ID, GRN Ref, or Purchase Receipt Number.
- **Display Components**:
  - Timeline graph: Farmer Registration ➔ Farm Harvest ➔ Purchase Receipt ➔ GRN Warehouse Receiving ➔ Batch Processing ➔ Customer Dispatch.
  - Geographical Map nodes: Farm GPS coordinates ➔ IPC Marketing Centre ➔ Warehouse Storage Siding ➔ Buyer Delivery Depot.

### Module 10: Administrative Management
- **Pages**:
  - `/dashboard/admin/ipc-management`: IPC creation and manager assignment.
  - `/dashboard/admin/warehouse-management`: Warehouse facility setup (`WH-XXX`), capacity limit (MT), manager assignment.
  - `/dashboard/admin/marketing-centre-management`: Marketing buying center setup.
  - `/dashboard/admin/users`: User provisioning & status control (`Active`, `Inactive`, `Locked`).
  - `/dashboard/admin/roles`: Custom role definition.
  - `/dashboard/admin/permissions`: Module-level action rights (`Create`, `Read`, `Update`, `Delete`, `Export`, `Approve`).
  - `/dashboard/admin/master-data`: Commodities, Grades, Districts, TAs, EPAs, Deductions.
  - `/dashboard/admin/mobile-sync`: Mobile device sync log, queue status, conflict resolution.
  - `/dashboard/admin/audit-logs`: System transaction audit trail.
  - `/dashboard/admin/settings`: System parameters (default currency `MWK`, weight unit `kg`, backup frequencies, threshold limits).

### Module 11: Reports & Analytics
- **Pages**:
  - `/dashboard/reports`: Analytics dashboard.
  - `/dashboard/reports/farmer-statistics`: Farmer demographic & production reports.
  - `/dashboard/reports/warehouse-statistics`: Stock intake, capacity utilization & turnover.
  - `/dashboard/reports/ipc-performance`: Regional collection targets vs actuals.
  - `/dashboard/reports/traceability-reports`: Chain of custody audit compliance logs.
  - `/dashboard/reports/user-reports`: Active user activity breakdown.
  - `/dashboard/reports/audit-reports`: Security & system modification logs.
  - `/dashboard/reports/notification-reports`: Broadcast & alert history.
  - `/dashboard/reports/system-health`: System uptime & mobile sync errors.
  - `/dashboard/reports/national`: Aggregated national grain yield & inventory metrics.

---

## 4. Business Workflows & Data Flows

```
[ Farmer Registration ] ──> [ Farm Association & Coordinates ]
                                     │
                                     ▼
                           [ Commodity Purchase ] (Receipt Generated, Payout calculated)
                                     │
                                     ▼
                         [ Warehouse Intake (GRN) ] (Moisture & Weight Verified)
                                     │
                                     ▼
                          [ Batch Aggregation ] (Stored in Warehouse Section/Row)
                                     │
                                     ▼
                            [ Customer Dispatch ] (Waybill Generated, Stock Decremented)
                                     │
                                     ▼
                          [ Full Lineage Traceability ]
```

---

## 5. Suggested Prisma Database Schema (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum RoleType {
  SYSADMIN
  WAREHOUSE_OFFICER
  IPC_MANAGER
  HEAD_OFFICE
}

enum Gender {
  MALE
  FEMALE
}

enum Status {
  ACTIVE
  PENDING
  SUSPENDED
  INACTIVE
}

enum PaymentStatus {
  PENDING
  PAID
  CANCELLED
}

enum PaymentMethod {
  MOBILE_MONEY_TNMPAMBA
  AIRTEL_MONEY
  BANK_TRANSFER
  CASH
}

enum BatchStatus {
  ACTIVE
  PROCESSING
  STORED
  DISPATCHED
}

enum DispatchStatus {
  IN_TRANSIT
  DELIVERED
  CANCELLED
}

model User {
  id           String      @id @default(uuid())
  name         String
  email        String      @unique
  phone        String?
  passwordHash String
  roleId       String
  role         Role        @relation(fields: [roleId], references: [id])
  assignedIpcId String?
  assignedIpc  IPC?        @relation(fields: [assignedIpcId], references: [id])
  status       Status      @default(ACTIVE)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  purchases    Purchase[]  @relation("PurchasingOfficer")
  grns         GRN[]       @relation("ReceivingOfficer")
  dispatches   Dispatch[]  @relation("DispatchedByOfficer")
  auditLogs    AuditLog[]
}

model Role {
  id          String       @id @default(uuid())
  name        String       @unique
  code        RoleType     @unique
  description String?
  users       User[]
  permissions Permission[]
}

model Permission {
  id         String   @id @default(uuid())
  roleId     String
  role       Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  moduleName String
  canCreate  Boolean  @default(false)
  canRead    Boolean  @default(true)
  canUpdate  Boolean  @default(false)
  canDelete  Boolean  @default(false)
  canExport  Boolean  @default(false)
  canApprove Boolean  @default(false)

  @@unique([roleId, moduleName])
}

model IPC {
  id               String            @id @default(uuid())
  code             String            @unique
  name             String
  district         String
  region           String
  status           Status            @default(ACTIVE)
  establishedDate  DateTime?
  users            User[]
  warehouses       Warehouse[]
  marketingCentres MarketingCentre[]
  associations     Association[]
  farmers          Farmer[]
  purchases        Purchase[]
  batches          Batch[]
}

model Warehouse {
  id             String       @id @default(uuid())
  code           String       @unique
  name           String
  ipcId          String
  ipc            IPC          @relation(fields: [ipcId], references: [id])
  district       String
  location       String
  capacityMT     Float
  status         Status       @default(ACTIVE)
  gpsLat         Float?
  gpsLng         Float?
  inventories    Inventory[]
  batches        Batch[]
  grns           GRN[]
  dispatchesFrom Dispatch[]   @relation("SourceWarehouse")
}

model MarketingCentre {
  id            String      @id @default(uuid())
  code          String      @unique
  name          String
  district      String
  ipcId         String
  ipc           IPC         @relation(fields: [ipcId], references: [id])
  associationId String?
  association   Association? @relation(fields: [associationId], references: [id])
  gpsLat        Float?
  gpsLng        Float?
  status        Status      @default(ACTIVE)
}

model Association {
  id               String            @id @default(uuid())
  code             String            @unique
  name             String
  ipcId            String
  ipc              IPC               @relation(fields: [ipcId], references: [id])
  district         String
  chairperson      String?
  clubs            Club[]
  farmers          Farmer[]
  marketingCentres MarketingCentre[]
}

model Club {
  id            String      @id @default(uuid())
  code          String      @unique
  name          String
  associationId String
  association   Association @relation(fields: [associationId], references: [id])
  secretary     String?
  farmers       Farmer[]
}

model Farmer {
  id                 String       @id @default(uuid())
  farmerCode         String       @unique // e.g. FMR-2024-0001
  fullName           String
  gender             Gender
  dob                DateTime?
  phone              String?
  altPhone           String?
  nationalId         String       @unique
  district           String
  ta                 String?
  epa                String?
  section            String?
  village            String
  gps                String?
  ipcId              String?
  ipc                IPC?         @relation(fields: [ipcId], references: [id])
  associationId      String?
  association        Association? @relation(fields: [associationId], references: [id])
  clubId             String?
  club               Club?        @relation(fields: [clubId], references: [id])
  group              String?
  memberNo           String?
  farmSize           Float
  unit               String       @default("Hectares")
  primaryCrops       String[]
  secondaryCrops     String[]
  productionSeason   String
  registrationDate   DateTime     @default(now())
  registrationOfficer String?
  status             Status       @default(ACTIVE)
  photoUrl           String?
  farms              Farm[]
  purchases          Purchase[]
}

model Farm {
  id                   String   @id @default(uuid())
  farmerId             String
  farmer               Farmer   @relation(fields: [farmerId], references: [id], onDelete: Cascade)
  district             String
  village              String
  sizeHectares         Float
  gpsLat               Float?
  gpsLng               Float?
  primaryCrop          String
  secondaryCrop        String?
  season               String
  productionEstimateKg Float?
  soilType             String?
  irrigated            Boolean  @default(false)
  lastVisit            DateTime?
  extensionNotes       String?
  status               Status   @default(ACTIVE)
}

model Commodity {
  id          String     @id @default(uuid())
  code        String     @unique
  name        String
  unit        String     @default("kg")
  minGradeKg  Float?
  maxGradeKg  Float?
  status      Status     @default(ACTIVE)
  purchases   Purchase[]
  batches     Batch[]
  inventories Inventory[]
}

model Purchase {
  id                 String        @id @default(uuid())
  receiptNumber      String        @unique // e.g. RCP-2024-8801
  purchaseDate       DateTime      @default(now())
  buyingCentre       String
  ipcId              String
  ipc                IPC           @relation(fields: [ipcId], references: [id])
  purchasingOfficerId String
  purchasingOfficer  User          @relation("PurchasingOfficer", fields: [purchasingOfficerId], references: [id])
  farmerId           String
  farmer             Farmer        @relation(fields: [farmerId], references: [id])
  commodityId        String
  commodity          Commodity     @relation(fields: [commodityId], references: [id])
  variety            String?
  grade              String
  qualityGrade       String
  numberOfBags       Int
  bagWeight          Float         @default(50)
  totalWeight        Float
  unitPrice          Float
  grossAmount        Float
  seedLoanDeduction  Float         @default(0)
  otherDeductions    Float         @default(0)
  netPayable         Float
  paymentStatus      PaymentStatus @default(PENDING)
  paymentMethod      PaymentMethod?
  paymentDate        DateTime?
  paymentReference   String?
  purchaseNotes      String?
  grns               GRN[]
}

model GRN {
  id                     String     @id @default(uuid())
  grnNumber              String     @unique // e.g. GRN-2024-0441
  purchaseId             String?
  purchase               Purchase?  @relation(fields: [purchaseId], references: [id])
  warehouseId            String
  warehouse              Warehouse  @relation(fields: [warehouseId], references: [id])
  receivingOfficerId     String
  receivingOfficer       User       @relation("ReceivingOfficer", fields: [receivingOfficerId], references: [id])
  receivingDate          DateTime   @default(now())
  grossWeight            Float
  tareWeight             Float
  netWeight              Float
  moistureContentPercent Float?
  acceptedQuantity       Float
  rejectedQuantity       Float      @default(0)
  rejectionReason        String?
  batchGRNs              BatchGRN[]
}

model Batch {
  id              String      @id @default(uuid())
  batchNumber     String      @unique // e.g. BATCH-2026-001
  warehouseId     String
  warehouse       Warehouse   @relation(fields: [warehouseId], references: [id])
  ipcId           String
  ipc             IPC         @relation(fields: [ipcId], references: [id])
  commodityId     String
  commodity       Commodity   @relation(fields: [commodityId], references: [id])
  numberOfBags    Int
  totalWeightKg   Float
  storageLocation String
  status          BatchStatus @default(ACTIVE)
  notes           String?
  createdAt       DateTime    @default(now())
  createdBy       String
  batchGRNs       BatchGRN[]
  dispatches      Dispatch[]
}

model BatchGRN {
  batchId String
  batch   Batch  @relation(fields: [batchId], references: [id], onDelete: Cascade)
  grnId   String
  grn     GRN    @relation(fields: [grnId], references: [id], onDelete: Cascade)

  @@id([batchId, grnId])
}

model Inventory {
  id                 String    @id @default(uuid())
  warehouseId        String
  warehouse          Warehouse @relation(fields: [warehouseId], references: [id])
  commodityId        String
  commodity          Commodity @relation(fields: [commodityId], references: [id])
  currentStockKg     Float     @default(0)
  numberOfBags       Int       @default(0)
  capacityKg         Float
  utilizationPercent Float     @default(0)
  lastUpdated        DateTime  @updatedAt

  @@unique([warehouseId, commodityId])
}

model Customer {
  id         String     @id @default(uuid())
  code       String     @unique
  name       String
  type       String     // Government / Private
  contact    String
  address    String
  status     Status     @default(ACTIVE)
  dispatches Dispatch[]
}

model Dispatch {
  id              String         @id @default(uuid())
  dispatchNumber  String         @unique // e.g. DSP-2026-001
  customerId      String?
  customer        Customer?      @relation(fields: [customerId], references: [id])
  warehouseId     String
  warehouse       Warehouse      @relation("SourceWarehouse", fields: [warehouseId], references: [id])
  batchId         String
  batch           Batch          @relation(fields: [batchId], references: [id])
  numberOfBags    Int
  quantityKg      Float
  dispatchDate    DateTime       @default(now())
  deliveryAddress String
  vehicleReg      String
  driverName      String
  dispatchedById  String
  dispatchedBy    User           @relation("DispatchedByOfficer", fields: [dispatchedById], references: [id])
  status          DispatchStatus @default(IN_TRANSIT)
  receivedBy      String?
  receivedDate    DateTime?
  notes           String?
  createdAt       DateTime       @default(now())
}

model MobileSyncLog {
  id           String   @id @default(uuid())
  deviceId     String
  userId       String
  syncType     String   // Farmers / Purchases / Stock
  recordsCount Int
  status       String   // Pending / Synced / Failed
  errorMessage String?
  createdAt    DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  timestamp DateTime @default(now())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  userName  String
  action    String   // CREATE, UPDATE, DELETE, LOGIN, EXPORT
  module    String
  recordId  String?
  ipAddress String?
  details   String?
}

model Notification {
  id        String   @id @default(uuid())
  userId    String?
  title     String
  message   String
  type      String   // INFO, WARNING, SUCCESS, ERROR
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model SystemSetting {
  id    String @id @default(uuid())
  key   String @unique
  value String
}
```

---

## 6. Suggested Express.js REST API Route Structure

```
/api/v1
│
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh-token
│   └── GET  /me
│
├── /users
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   └── DELETE /:id
│
├── /roles
│   ├── GET  /
│   ├── POST /
│   └── PUT  /:id/permissions
│
├── /farmers
│   ├── GET  /                 (Query params: search, district, association, status, page, limit)
│   ├── POST /                 (Form-data / JSON)
│   ├── GET  /:id
│   ├── PUT  /:id
│   ├── GET  /:id/history
│   └── GET  /groups           (Associations & Clubs)
│
├── /farms
│   ├── GET  /
│   ├── POST /
│   └── GET  /farmer/:farmerId
│
├── /purchases
│   ├── GET  /                 (Query params: date, status, commodity, buyingCentre)
│   ├── POST /                 (Generates receipt & computes financials)
│   ├── GET  /:id
│   └── POST /:id/pay          (Trigger mobile money / payment status update)
│
├── /grns
│   ├── GET  /
│   ├── POST /                 (Generates GRN, updates warehouse inventory)
│   └── GET  /:id
│
├── /batches
│   ├── GET  /
│   ├── POST /                 (Aggregates linked GRNs)
│   └── GET  /:id
│
├── /inventory
│   ├── GET  /                 (Stock levels by warehouse)
│   ├── GET  /movements        (Stock ledger history)
│   └── POST /adjust           (Stock adjustment)
│
├── /dispatches
│   ├── GET  /
│   ├── POST /                 (Creates waybill, decrements inventory stock)
│   └── PUT  /:id/deliver      (Mark status as Delivered)
│
├── /traceability
│   └── GET  /trace            (Query params: code = QR / Batch / GRN / Receipt)
│
├── /ipcs
│   ├── GET  /
│   └── POST /
│
├── /warehouses
│   ├── GET  /
│   └── POST /
│
├── /master-data
│   ├── GET  /commodities
│   ├── GET  /districts
│   ├── GET  /associations
│   └── GET  /marketing-centres
│
├── /sync
│   ├── POST /push             (Mobile device batch upload)
│   └── GET  /logs
│
├── /audit-logs
│   └── GET  /                 (Filtered by module, user, date range)
│
├── /notifications
│   ├── GET  /
│   └── PUT  /:id/read
│
└── /reports
    ├── GET /summary
    ├── GET /farmers/export
    ├── GET /inventory/export
    └── GET /traceability/export
```

---

## 7. Audit Logging, Notifications & System Health

1. **Audit Logs Requirement**:
   - Every state-modifying action (Create, Update, Delete, Status Change, Payment Authorization) MUST asynchronously create an `AuditLog` entry capture.
   - Captured details: `timestamp`, `userId`, `userName`, `action`, `module`, `recordId`, `ipAddress`, `details` (JSON diff of old vs new values).
2. **Notification Requirements**:
   - In-app notification creation on critical events:
     - Low stock thresholds (< 10% capacity).
     - Purchase receipt pending payment.
     - GRN rejection notice.
     - Mobile sync sync failure alert.
3. **Offline Mobile Sync**:
   - Idempotent API endpoint (`/sync/push`) accepting arrays of queued transactions.
   - Transactional processing per record to prevent partial sync corruption.
   - Detailed status logging (`Pending`, `Synced`, `Failed`).

---

## 8. Identified Gaps & Backend Considerations (Not In Frontend Mock UI)

1. **Authentication Security & Refresh Tokens**:
   - The UI currently relies on local storage session persistence. The backend MUST implement HTTP-only secure cookie JWT authentication with access/refresh token rotation.
2. **File Storage Service (S3 / Cloud Storage)**:
   - The UI supports photo uploads for farmer profiles and receipt scans. The backend requires a dedicated S3/MinIO file handler with presigned URLs.
3. **Atomic Financial Transactions**:
   - Purchase creation, GRN issuing, and Dispatch creation mutate multiple domain entities (e.g. Purchase + Inventory Stock + GRN + Audit Log). These endpoints MUST be wrapped in database ACID transactions (`prisma.$transaction`).
4. **Server-side Pagination & Filtering**:
   - The UI currently loads static mock arrays. The API MUST support standard `page`, `limit`, `sort`, `search`, and `filter` query parameters across all endpoints.
5. **Real-time WebSockets / Server-Sent Events (SSE)**:
   - For real-time updates on active warehouse stock levels, receiving queues, and instant notification pushes to logged-in officers.
