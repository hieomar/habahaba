import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    phone: z.string().optional().nullable(),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    roleId: z.string({ required_error: 'Role ID is required' }).min(1),
    assignedIpcId: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    password: z.string().min(6).optional(),
    roleId: z.string().optional(),
    assignedIpcId: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  }),
});

export const updatePermissionsSchema = z.object({
  body: z.object({
    permissions: z.array(
      z.object({
        moduleName: z.string().min(1),
        canCreate: z.boolean().default(false),
        canRead: z.boolean().default(true),
        canUpdate: z.boolean().default(false),
        canDelete: z.boolean().default(false),
        canExport: z.boolean().default(false),
        canApprove: z.boolean().default(false),
      })
    ).min(1, 'At least one permission object required'),
  }),
});
