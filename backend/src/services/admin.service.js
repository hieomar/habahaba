import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { sendUserCredentialsEmail } from './email.service.js';

export const getUsers = async (queryFilters = {}) => {
  const page = Math.max(1, parseInt(queryFilters.page || '1', 10));
  const limit = Math.max(1, parseInt(queryFilters.limit || '10', 10));
  const skip = (page - 1) * limit;

  const where = {};
  if (queryFilters.search) {
    const s = queryFilters.search.trim();
    where.OR = [
      { name: { contains: s } },
      { email: { contains: s } },
      { phone: { contains: s } },
    ];
  }
  if (queryFilters.roleId) where.roleId = queryFilters.roleId;
  if (queryFilters.status) where.status = queryFilters.status;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        role: { select: { id: true, name: true, code: true } },
        assignedIpc: { select: { id: true, name: true } },
      },
    }),
  ]);

  return { users, total, page, limit };
};

export const createUser = async (userData, officerUser) => {
  const existing = await prisma.user.findUnique({
    where: { email: userData.email.trim().toLowerCase() },
  });

  if (existing) {
    throw new ConflictError(`User with email '${userData.email}' already exists`);
  }

  const role = await prisma.role.findUnique({ where: { id: userData.roleId } });
  if (!role) throw new NotFoundError(`Role '${userData.roleId}' not found`);

  const passwordHash = await hashPassword(userData.password);

  const user = await prisma.user.create({
    data: {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone || null,
      passwordHash,
      roleId: role.id,
      assignedIpcId: userData.assignedIpcId || null,
      status: userData.status || 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      role: true,
      assignedIpc: true,
    },
  });

  // Record Audit Trail
  await prisma.auditLog.create({
    data: {
      userId: officerUser ? officerUser.id : null,
      userName: officerUser ? officerUser.name : 'System',
      action: 'CREATE',
      module: 'User Management',
      recordId: user.id,
      details: `Provisioned user account ${user.email} (${user.role.name})`,
    },
  });

  // Automatically Dispatch Welcome Email with Credentials
  sendUserCredentialsEmail({
    toEmail: user.email,
    userName: user.name,
    tempPassword: userData.password,
    roleName: role.name,
  }).catch(() => {}); // Non-blocking async background send

  return user;
};

export const updateUser = async (id, userData, officerUser) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError(`User '${id}' not found`);

  const dataToUpdate = { ...userData };
  if (userData.password) {
    dataToUpdate.passwordHash = await hashPassword(userData.password);
    delete dataToUpdate.password;
  }
  if (userData.email) {
    dataToUpdate.email = userData.email.trim().toLowerCase();
  }

  const updated = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      role: true,
      assignedIpc: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: officerUser ? officerUser.id : null,
      userName: officerUser ? officerUser.name : 'System',
      action: 'UPDATE',
      module: 'User Management',
      recordId: user.id,
      details: `Updated user account ${updated.email}`,
    },
  });

  return updated;
};

export const getRoles = async () => {
  return await prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
  });
};

export const updateRolePermissions = async (roleId, permissionsArray, officerUser) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new NotFoundError(`Role '${roleId}' not found`);

  await prisma.$transaction(async (tx) => {
    for (const perm of permissionsArray) {
      await tx.permission.upsert({
        where: {
          roleId_moduleName: {
            roleId: role.id,
            moduleName: perm.moduleName,
          },
        },
        update: {
          canCreate: perm.canCreate ?? false,
          canRead: perm.canRead ?? true,
          canUpdate: perm.canUpdate ?? false,
          canDelete: perm.canDelete ?? false,
          canExport: perm.canExport ?? false,
          canApprove: perm.canApprove ?? false,
        },
        create: {
          roleId: role.id,
          moduleName: perm.moduleName,
          canCreate: perm.canCreate ?? false,
          canRead: perm.canRead ?? true,
          canUpdate: perm.canUpdate ?? false,
          canDelete: perm.canDelete ?? false,
          canExport: perm.canExport ?? false,
          canApprove: perm.canApprove ?? false,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: officerUser ? officerUser.id : null,
        userName: officerUser ? officerUser.name : 'System',
        action: 'UPDATE',
        module: 'Permission Management',
        recordId: role.id,
        details: `Updated permission matrix for role ${role.name}`,
      },
    });
  });

  return await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: true },
  });
};
