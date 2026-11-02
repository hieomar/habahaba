import { z } from 'zod';

export const createDispatchSchema = z.object({
  body: z.object({
    customerId: z.string().optional().nullable(),
    warehouseId: z.string({ required_error: 'Source warehouse ID is required' }).min(1),
    batchId: z.string({ required_error: 'Batch ID is required' }).min(1),
    numberOfBags: z.number({ required_error: 'Number of bags is required' }).positive('Bags must be > 0'),
    quantityKg: z.number({ required_error: 'Quantity in Kg is required' }).positive('Quantity must be > 0'),
    deliveryAddress: z.string({ required_error: 'Delivery address is required' }).min(1),
    vehicleReg: z.string({ required_error: 'Vehicle registration is required' }).min(1),
    driverName: z.string({ required_error: 'Driver name is required' }).min(1),
    notes: z.string().optional().nullable(),
    dispatchDate: z.string().optional().nullable(),
  }),
});

export const updateDeliverySchema = z.object({
  body: z.object({
    receivedBy: z.string({ required_error: 'Receiver name is required' }).min(1),
    receivedDate: z.string().optional().nullable(),
    status: z.enum(['IN_TRANSIT', 'DELIVERED', 'CANCELLED']).default('DELIVERED'),
  }),
});

export const dispatchQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    warehouseId: z.string().optional(),
    customerId: z.string().optional(),
    status: z.enum(['IN_TRANSIT', 'DELIVERED', 'CANCELLED']).optional(),
  }),
});
