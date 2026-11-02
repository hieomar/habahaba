import { z } from 'zod';

export const createGRNSchema = z.object({
  body: z.object({
    purchaseId: z.string().optional().nullable(),
    warehouseId: z.string({ required_error: 'Warehouse ID is required' }).min(1),
    grossWeight: z.number({ required_error: 'Gross weight is required' }).positive('Gross weight must be > 0'),
    tareWeight: z.number({ required_error: 'Tare weight is required' }).min(0, 'Tare weight cannot be negative'),
    netWeight: z.number({ required_error: 'Net weight is required' }).positive('Net weight must be > 0'),
    moistureContentPercent: z.number().min(0).max(100).optional().nullable(),
    acceptedQuantity: z.number({ required_error: 'Accepted quantity is required' }).positive('Accepted quantity must be > 0'),
    rejectedQuantity: z.number().min(0).default(0),
    rejectionReason: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const grnQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    warehouseId: z.string().optional(),
    purchaseId: z.string().optional(),
    search: z.string().optional(),
  }),
});
