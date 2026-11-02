import { prisma } from '../config/database.js';
import { ConflictError } from '../utils/errors.js';

export const createCustomer = async (customerData, officerUser) => {
  const existing = await prisma.customer.findUnique({
    where: { code: customerData.code },
  });

  if (existing) {
    throw new ConflictError(`Customer with code '${customerData.code}' already exists`);
  }

  const customer = await prisma.customer.create({
    data: {
      code: customerData.code.trim().toUpperCase(),
      name: customerData.name.trim(),
      type: customerData.type || 'Government',
      contact: customerData.contact.trim(),
      address: customerData.address.trim(),
      status: 'ACTIVE',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: officerUser ? officerUser.id : null,
      userName: officerUser ? officerUser.name : 'System',
      action: 'CREATE',
      module: 'Customer Management',
      recordId: customer.id,
      details: `Registered commercial buyer '${customer.name}' (${customer.code})`,
    },
  });

  return customer;
};

export const getCustomers = async () => {
  return await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  });
};
