import { z } from 'zod';

export const createBatchSchema = z.object({
  body: z.object({
    warehouseId: z.string({ required_error: 'Warehouse ID is required' }).min(1),
    ipcId: z.string({ required_error: 'IPC ID is required' }).min(1),
    commodityId: z.string({ required_error: 'Commodity ID is required' }).min(1),
    grnIds: z.array(z.string()).min(1, 'At least one GRN must be linked to the batch'),
    numberOfBags: z.number().positive('Number of bags must be > 0'),
    totalWeightKg: z.number().positive('Total weight in Kg must be > 0'),
    storageLocation: z.string({ required_error: 'Storage location (e.g. Section A, Row 1) is required' }).min(1),
    notes: z.string().optional().nullable(),
  }),
});

export const batchQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    warehouseId: z.string().optional(),
    ipcId: z.string().optional(),
    commodityId: z.string().optional(),
    status: z.enum(['ACTIVE', 'PROCESSING', 'STORED', 'DISPATCHED']).optional(),
  }),
});
