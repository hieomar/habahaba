import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GTMS Database Seeding...');

  // 1. Seed System Roles
  const rolesData = [
    { code: 'SYSADMIN', name: 'System Administrator', description: 'Full system access across all modules and configurations' },
    { code: 'WAREHOUSE_OFFICER', name: 'Warehouse Officer', description: 'Manages purchasing, receiving, warehouse intake, and dispatches' },
    { code: 'IPC_MANAGER', name: 'IPC Manager', description: 'Supervises regional IPC operations, farmers, and collection statistics' },
    { code: 'HEAD_OFFICE', name: 'Head Office Manager', description: 'Executive oversight, nationwide inventory, and reporting' },
  ];

  const roles = {};
  for (const r of rolesData) {
    roles[r.code] = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r,
    });
  }
  console.log('✅ System Roles seeded.');

  // 2. Seed Permissions Matrix for Modules
  const modules = [
    'Farmer Management',
    'Farm Management',
    'Commodity Purchases',
    'Warehouse Operations',
    'GRN Management',
    'Batch Management',
    'Inventory Management',
    'Dispatch Management',
    'Traceability Intelligence',
    'Reports & Analytics',
    'User Management',
    'Role Management',
    'Permission Management',
    'Master Data',
    'Mobile Data Sync',
    'Audit Logs',
    'Notifications',
    'System Settings',
  ];

  for (const mod of modules) {
    // Sysadmin full permissions
    await prisma.permission.upsert({
      where: { roleId_moduleName: { roleId: roles.SYSADMIN.id, moduleName: mod } },
      update: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true, canApprove: true },
      create: { roleId: roles.SYSADMIN.id, moduleName: mod, canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true, canApprove: true },
    });
  }
  console.log('✅ Module Permissions seeded.');

  // 3. Seed Master IPCs
  const ipcsData = [
    { code: 'IPC-LLW-001', name: 'Lilongwe IPC', district: 'Lilongwe', region: 'Central' },
    { code: 'IPC-MCH-002', name: 'Mchinji IPC', district: 'Mchinji', region: 'Central' },
    { code: 'IPC-KSG-003', name: 'Kasungu IPC', district: 'Kasungu', region: 'Central' },
    { code: 'IPC-DDZ-004', name: 'Dedza IPC', district: 'Dedza', region: 'Central' },
  ];

  const ipcs = {};
  for (const ipc of ipcsData) {
    ipcs[ipc.code] = await prisma.iPC.upsert({
      where: { code: ipc.code },
      update: ipc,
      create: ipc,
    });
  }
  console.log('✅ Master IPCs seeded.');

  // 4. Seed Default Administrator User
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const sysAdminUser = await prisma.user.upsert({
    where: { email: 'admin@nasfam.mw' },
    update: {
      name: 'System Administrator',
      phone: '+265 999 000 001',
      passwordHash: adminPasswordHash,
      roleId: roles.SYSADMIN.id,
      status: 'ACTIVE',
    },
    create: {
      name: 'System Administrator',
      email: 'admin@nasfam.mw',
      phone: '+265 999 000 001',
      passwordHash: adminPasswordHash,
      roleId: roles.SYSADMIN.id,
      assignedIpcId: ipcs['IPC-LLW-001'].id,
      status: 'ACTIVE',
    },
  });
  console.log(`✅ System Administrator seeded (Email: admin@nasfam.mw, Pass: Admin@123)`);

  // 5. Seed Master Commodities
  const commoditiesData = [
    { code: 'MZE', name: 'Maize', unit: 'kg', minGradeKg: 80, maxGradeKg: 95 },
    { code: 'SOY', name: 'Soya', unit: 'kg', minGradeKg: 80, maxGradeKg: 95 },
    { code: 'GND', name: 'Groundnuts', unit: 'kg', minGradeKg: 45, maxGradeKg: 55 },
    { code: 'PGP', name: 'Pigeon Peas', unit: 'kg', minGradeKg: 80, maxGradeKg: 95 },
    { code: 'COT', name: 'Cotton', unit: 'kg', minGradeKg: 80, maxGradeKg: 95 },
  ];

  for (const comm of commoditiesData) {
    await prisma.commodity.upsert({
      where: { code: comm.code },
      update: comm,
      create: comm,
    });
  }
  console.log('✅ Master Commodities seeded.');

  // 6. Seed Warehouses
  const warehousesData = [
    { code: 'WH-LLW-001', name: 'Lilongwe Warehouse', ipcId: ipcs['IPC-LLW-001'].id, district: 'Lilongwe', location: 'Area 25, Lilongwe', capacityMT: 500 },
    { code: 'WH-MCH-002', name: 'Mchinji Warehouse', ipcId: ipcs['IPC-MCH-002'].id, district: 'Mchinji', location: 'Mchinji Town', capacityMT: 400 },
    { code: 'WH-KSG-003', name: 'Kasungu Warehouse', ipcId: ipcs['IPC-KSG-003'].id, district: 'Kasungu', location: 'Kasungu Town', capacityMT: 400 },
  ];

  for (const wh of warehousesData) {
    await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: wh,
      create: wh,
    });
  }
  console.log('✅ Regional Warehouses seeded.');

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
