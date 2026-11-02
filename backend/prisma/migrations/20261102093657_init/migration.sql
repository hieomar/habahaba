/*
  Warnings:

  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clubs_associations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `commodities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `commodity_varieties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_deliveries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `farmer_crops` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `farmers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goods_received_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ipcs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seed_loans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock_movements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `warehouses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `audit_logs` DROP FOREIGN KEY `audit_logs_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `clubs_associations` DROP FOREIGN KEY `clubs_associations_ipc_id_fkey`;

-- DropForeignKey
ALTER TABLE `commodity_varieties` DROP FOREIGN KEY `commodity_varieties_commodity_id_fkey`;

-- DropForeignKey
ALTER TABLE `customer_deliveries` DROP FOREIGN KEY `customer_deliveries_commodity_id_fkey`;

-- DropForeignKey
ALTER TABLE `customer_deliveries` DROP FOREIGN KEY `customer_deliveries_created_by_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `farmer_crops` DROP FOREIGN KEY `farmer_crops_commodity_id_fkey`;

-- DropForeignKey
ALTER TABLE `farmer_crops` DROP FOREIGN KEY `farmer_crops_farmer_id_fkey`;

-- DropForeignKey
ALTER TABLE `farmers` DROP FOREIGN KEY `farmers_club_id_fkey`;

-- DropForeignKey
ALTER TABLE `farmers` DROP FOREIGN KEY `farmers_registered_by_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `goods_received_notes` DROP FOREIGN KEY `goods_received_notes_commodity_id_fkey`;

-- DropForeignKey
ALTER TABLE `goods_received_notes` DROP FOREIGN KEY `goods_received_notes_purchase_id_fkey`;

-- DropForeignKey
ALTER TABLE `goods_received_notes` DROP FOREIGN KEY `goods_received_notes_received_by_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `goods_received_notes` DROP FOREIGN KEY `goods_received_notes_warehouse_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_commodity_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_warehouse_id_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_farmer_id_fkey`;

-- DropForeignKey
ALTER TABLE `purchases` DROP FOREIGN KEY `purchases_buying_center_ipc_id_fkey`;

-- DropForeignKey
ALTER TABLE `purchases` DROP FOREIGN KEY `purchases_commodity_id_fkey`;

-- DropForeignKey
ALTER TABLE `purchases` DROP FOREIGN KEY `purchases_farmer_id_fkey`;

-- DropForeignKey
ALTER TABLE `purchases` DROP FOREIGN KEY `purchases_officer_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `seed_loans` DROP FOREIGN KEY `seed_loans_commodity_id_fkey`;

-- DropForeignKey
ALTER TABLE `seed_loans` DROP FOREIGN KEY `seed_loans_farmer_id_fkey`;

-- DropForeignKey
ALTER TABLE `stock_movements` DROP FOREIGN KEY `stock_movements_commodity_id_fkey`;

-- DropForeignKey
ALTER TABLE `stock_movements` DROP FOREIGN KEY `stock_movements_created_by_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_ipc_id_fkey`;

-- DropForeignKey
ALTER TABLE `warehouses` DROP FOREIGN KEY `warehouses_ipc_id_fkey`;

-- DropTable
DROP TABLE `audit_logs`;

-- DropTable
DROP TABLE `clubs_associations`;

-- DropTable
DROP TABLE `commodities`;

-- DropTable
DROP TABLE `commodity_varieties`;

-- DropTable
DROP TABLE `customer_deliveries`;

-- DropTable
DROP TABLE `farmer_crops`;

-- DropTable
DROP TABLE `farmers`;

-- DropTable
DROP TABLE `goods_received_notes`;

-- DropTable
DROP TABLE `inventory`;

-- DropTable
DROP TABLE `ipcs`;

-- DropTable
DROP TABLE `notifications`;

-- DropTable
DROP TABLE `purchases`;

-- DropTable
DROP TABLE `seed_loans`;

-- DropTable
DROP TABLE `stock_movements`;

-- DropTable
DROP TABLE `users`;

-- DropTable
DROP TABLE `warehouses`;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `assignedIpcId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` ENUM('SYSADMIN', 'WAREHOUSE_OFFICER', 'IPC_MANAGER', 'HEAD_OFFICE') NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    UNIQUE INDEX `Role_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `moduleName` VARCHAR(191) NOT NULL,
    `canCreate` BOOLEAN NOT NULL DEFAULT false,
    `canRead` BOOLEAN NOT NULL DEFAULT true,
    `canUpdate` BOOLEAN NOT NULL DEFAULT false,
    `canDelete` BOOLEAN NOT NULL DEFAULT false,
    `canExport` BOOLEAN NOT NULL DEFAULT false,
    `canApprove` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Permission_roleId_moduleName_key`(`roleId`, `moduleName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IPC` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `establishedDate` DATETIME(3) NULL,

    UNIQUE INDEX `IPC_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Warehouse` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ipcId` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `capacityMT` DOUBLE NOT NULL,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `gpsLat` DOUBLE NULL,
    `gpsLng` DOUBLE NULL,

    UNIQUE INDEX `Warehouse_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarketingCentre` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `ipcId` VARCHAR(191) NOT NULL,
    `associationId` VARCHAR(191) NULL,
    `gpsLat` DOUBLE NULL,
    `gpsLng` DOUBLE NULL,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `MarketingCentre_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Association` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ipcId` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `chairperson` VARCHAR(191) NULL,

    UNIQUE INDEX `Association_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Club` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `associationId` VARCHAR(191) NOT NULL,
    `secretary` VARCHAR(191) NULL,

    UNIQUE INDEX `Club_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Farmer` (
    `id` VARCHAR(191) NOT NULL,
    `uuid` VARCHAR(191) NULL,
    `farmerCode` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `dob` DATETIME(3) NULL,
    `phone` VARCHAR(191) NULL,
    `altPhone` VARCHAR(191) NULL,
    `nationalId` VARCHAR(191) NULL,
    `district` VARCHAR(191) NOT NULL,
    `ta` VARCHAR(191) NULL,
    `epa` VARCHAR(191) NULL,
    `section` VARCHAR(191) NULL,
    `village` VARCHAR(191) NOT NULL,
    `gps` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `ipcId` VARCHAR(191) NULL,
    `associationId` VARCHAR(191) NULL,
    `clubId` VARCHAR(191) NULL,
    `groupName` VARCHAR(191) NULL,
    `memberNo` VARCHAR(191) NULL,
    `farmSize` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'Hectares',
    `cropsJson` TEXT NULL,
    `productionSeason` VARCHAR(191) NULL,
    `registrationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `registrationOfficer` VARCHAR(191) NULL,
    `seedLoanBalance` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `syncStatus` ENUM('PENDING', 'SYNCED', 'FAILED') NOT NULL DEFAULT 'SYNCED',
    `photoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Farmer_uuid_key`(`uuid`),
    UNIQUE INDEX `Farmer_farmerCode_key`(`farmerCode`),
    UNIQUE INDEX `Farmer_nationalId_key`(`nationalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Farm` (
    `id` VARCHAR(191) NOT NULL,
    `uuid` VARCHAR(191) NULL,
    `farmerId` VARCHAR(191) NOT NULL,
    `farmName` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NULL,
    `village` VARCHAR(191) NULL,
    `sizeHectares` DOUBLE NOT NULL,
    `gpsLat` DOUBLE NULL,
    `gpsLng` DOUBLE NULL,
    `primaryCrop` VARCHAR(191) NOT NULL,
    `secondaryCrop` VARCHAR(191) NULL,
    `season` VARCHAR(191) NULL,
    `productionEstimateKg` DOUBLE NULL,
    `soilType` VARCHAR(191) NULL,
    `irrigated` BOOLEAN NOT NULL DEFAULT false,
    `lastVisit` DATETIME(3) NULL,
    `extensionNotes` TEXT NULL,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `syncStatus` ENUM('PENDING', 'SYNCED', 'FAILED') NOT NULL DEFAULT 'SYNCED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Farm_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commodity` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'kg',
    `minGradeKg` DOUBLE NULL,
    `maxGradeKg` DOUBLE NULL,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `Commodity_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase` (
    `id` VARCHAR(191) NOT NULL,
    `uuid` VARCHAR(191) NULL,
    `receiptNumber` VARCHAR(191) NOT NULL,
    `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `buyingCentre` VARCHAR(191) NOT NULL,
    `ipcId` VARCHAR(191) NOT NULL,
    `purchasingOfficerId` VARCHAR(191) NULL,
    `farmerId` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NOT NULL,
    `variety` VARCHAR(191) NULL,
    `grade` VARCHAR(191) NULL,
    `qualityGrade` VARCHAR(191) NULL,
    `numberOfBags` INTEGER NOT NULL,
    `bagWeight` DOUBLE NOT NULL DEFAULT 50,
    `totalWeight` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `grossAmount` DOUBLE NOT NULL,
    `seedLoanDeduction` DOUBLE NOT NULL DEFAULT 0,
    `otherDeductions` DOUBLE NOT NULL DEFAULT 0,
    `netPayable` DOUBLE NOT NULL,
    `paymentStatus` ENUM('PENDING', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` ENUM('MOBILE_MONEY_TNMPAMBA', 'AIRTEL_MONEY', 'BANK_TRANSFER', 'CASH') NULL,
    `paymentDate` DATETIME(3) NULL,
    `paymentReference` VARCHAR(191) NULL,
    `purchaseNotes` TEXT NULL,
    `bagTagRange` VARCHAR(191) NULL,
    `syncStatus` ENUM('PENDING', 'SYNCED', 'FAILED') NOT NULL DEFAULT 'SYNCED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Purchase_uuid_key`(`uuid`),
    UNIQUE INDEX `Purchase_receiptNumber_key`(`receiptNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GRN` (
    `id` VARCHAR(191) NOT NULL,
    `grnNumber` VARCHAR(191) NOT NULL,
    `purchaseId` VARCHAR(191) NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `receivingOfficerId` VARCHAR(191) NULL,
    `receivingDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `grossWeight` DOUBLE NOT NULL,
    `tareWeight` DOUBLE NOT NULL,
    `netWeight` DOUBLE NOT NULL,
    `moistureContentPercent` DOUBLE NULL,
    `acceptedQuantity` DOUBLE NOT NULL,
    `rejectedQuantity` DOUBLE NOT NULL DEFAULT 0,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GRN_grnNumber_key`(`grnNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Batch` (
    `id` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `ipcId` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NOT NULL,
    `numberOfBags` INTEGER NOT NULL,
    `totalWeightKg` DOUBLE NOT NULL,
    `storageLocation` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PROCESSING', 'STORED', 'DISPATCHED') NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Batch_batchNumber_key`(`batchNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BatchGRN` (
    `batchId` VARCHAR(191) NOT NULL,
    `grnId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`batchId`, `grnId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `commodityId` VARCHAR(191) NOT NULL,
    `currentStockKg` DOUBLE NOT NULL DEFAULT 0,
    `numberOfBags` INTEGER NOT NULL DEFAULT 0,
    `capacityKg` DOUBLE NOT NULL,
    `utilizationPercent` DOUBLE NOT NULL DEFAULT 0,
    `lastUpdated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Inventory_warehouseId_commodityId_key`(`warehouseId`, `commodityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovement` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `commodity` VARCHAR(191) NOT NULL,
    `quantityKg` DOUBLE NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `officer` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `Customer_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dispatch` (
    `id` VARCHAR(191) NOT NULL,
    `dispatchNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `numberOfBags` INTEGER NOT NULL,
    `quantityKg` DOUBLE NOT NULL,
    `dispatchDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deliveryAddress` VARCHAR(191) NOT NULL,
    `vehicleReg` VARCHAR(191) NOT NULL,
    `driverName` VARCHAR(191) NOT NULL,
    `dispatchedById` VARCHAR(191) NULL,
    `status` ENUM('IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'IN_TRANSIT',
    `receivedBy` VARCHAR(191) NULL,
    `receivedDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Dispatch_dispatchNumber_key`(`dispatchNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MobileSyncLog` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `syncType` VARCHAR(191) NOT NULL,
    `recordsCount` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `errorMessage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NULL,
    `userName` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `details` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemSetting` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `SystemSetting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_assignedIpcId_fkey` FOREIGN KEY (`assignedIpcId`) REFERENCES `IPC`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Permission` ADD CONSTRAINT `Permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Warehouse` ADD CONSTRAINT `Warehouse_ipcId_fkey` FOREIGN KEY (`ipcId`) REFERENCES `IPC`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketingCentre` ADD CONSTRAINT `MarketingCentre_ipcId_fkey` FOREIGN KEY (`ipcId`) REFERENCES `IPC`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketingCentre` ADD CONSTRAINT `MarketingCentre_associationId_fkey` FOREIGN KEY (`associationId`) REFERENCES `Association`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Association` ADD CONSTRAINT `Association_ipcId_fkey` FOREIGN KEY (`ipcId`) REFERENCES `IPC`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Club` ADD CONSTRAINT `Club_associationId_fkey` FOREIGN KEY (`associationId`) REFERENCES `Association`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Farmer` ADD CONSTRAINT `Farmer_ipcId_fkey` FOREIGN KEY (`ipcId`) REFERENCES `IPC`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Farmer` ADD CONSTRAINT `Farmer_associationId_fkey` FOREIGN KEY (`associationId`) REFERENCES `Association`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Farmer` ADD CONSTRAINT `Farmer_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Farm` ADD CONSTRAINT `Farm_farmerId_fkey` FOREIGN KEY (`farmerId`) REFERENCES `Farmer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_ipcId_fkey` FOREIGN KEY (`ipcId`) REFERENCES `IPC`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_purchasingOfficerId_fkey` FOREIGN KEY (`purchasingOfficerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_farmerId_fkey` FOREIGN KEY (`farmerId`) REFERENCES `Farmer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `Commodity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRN` ADD CONSTRAINT `GRN_receivingOfficerId_fkey` FOREIGN KEY (`receivingOfficerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_ipcId_fkey` FOREIGN KEY (`ipcId`) REFERENCES `IPC`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `Commodity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchGRN` ADD CONSTRAINT `BatchGRN_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchGRN` ADD CONSTRAINT `BatchGRN_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GRN`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_commodityId_fkey` FOREIGN KEY (`commodityId`) REFERENCES `Commodity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispatch` ADD CONSTRAINT `Dispatch_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispatch` ADD CONSTRAINT `Dispatch_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispatch` ADD CONSTRAINT `Dispatch_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispatch` ADD CONSTRAINT `Dispatch_dispatchedById_fkey` FOREIGN KEY (`dispatchedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
