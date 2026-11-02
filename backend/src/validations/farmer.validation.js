import { z } from 'zod';

export const createFarmerSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First name is required' }).min(1, 'First name cannot be empty'),
    lastName: z.string({ required_error: 'Last name is required' }).min(1, 'Last name cannot be empty'),
    phoneNumber: z.string().optional().nullable(),
    altPhone: z.string().optional().nullable(),
    nationalId: z
      .string()
      .regex(/^P\d{8}$/, 'National ID must follow format P12345678')
      .optional()
      .nullable(),
    gender: z.enum(['MALE', 'FEMALE'], { required_error: 'Gender must be MALE or FEMALE' }),
    dob: z.string().optional().nullable(),
    district: z.string({ required_error: 'District is required' }).min(1),
    ta: z.string().optional().nullable(),
    epa: z.string().optional().nullable(),
    section: z.string().optional().nullable(),
    village: z.string({ required_error: 'Village is required' }).min(1),
    gps: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    ipcId: z.string().optional().nullable(),
    associationId: z.string().optional().nullable(),
    clubId: z.string().optional().nullable(),
    groupName: z.string().optional().nullable(),
    memberNo: z.string().optional().nullable(),
    farmSize: z.number({ required_error: 'Farm size is required' }).positive('Farm size must be greater than zero'),
    unit: z.enum(['Hectares', 'Acres']).default('Hectares'),
    primaryCrops: z.array(z.string()).optional().default([]),
    secondaryCrops: z.array(z.string()).optional().default([]),
    productionSeason: z.string().optional().nullable(),
    seedLoanBalance: z.number().min(0, 'Seed loan balance cannot be negative').default(0),
    uuid: z.string().optional().nullable(), // For mobile offline sync
  }),
});

export const updateFarmerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phoneNumber: z.string().optional().nullable(),
    altPhone: z.string().optional().nullable(),
    nationalId: z.string().regex(/^P\d{8}$/).optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    district: z.string().min(1).optional(),
    village: z.string().min(1).optional(),
    farmSize: z.number().positive().optional(),
    seedLoanBalance: z.number().min(0).optional(),
    status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE']).optional(),
  }),
});

export const farmerQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    district: z.string().optional(),
    association: z.string().optional(),
    club: z.string().optional(),
    status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE']).optional(),
  }),
});
