import { z } from 'zod';

export const createPurchaseSchema = z.object({
  body: z.object({
    farmerId: z.string({ required_error: 'Farmer ID is required' }).min(1),
    commodityId: z.string({ required_error: 'Commodity ID is required' }).min(1),
    buyingCentre: z.string({ required_error: 'Buying Centre is required' }).min(1),
    variety: z.string().optional().nullable(),
    grade: z.string().optional().default('Grade 1'),
    qualityGrade: z.string().optional().default('Standard'),
    quantityKg: z.number({ required_error: 'Quantity in Kg is required' }).positive('Quantity must be greater than zero'),
    pricePerKg: z.number({ required_error: 'Unit price per Kg is required' }).positive('Unit price must be greater than zero'),
    bagWeight: z.number().positive().default(50),
    otherDeductions: z.number().min(0, 'Other deductions cannot be negative').default(0),
    paymentStatus: z.enum(['PENDING', 'PAID', 'CANCELLED']).default('PAID'),
    paymentMethod: z.enum(['MOBILE_MONEY_TNMPAMBA', 'AIRTEL_MONEY', 'BANK_TRANSFER', 'CASH']).optional().nullable(),
    paymentReference: z.string().optional().nullable(),
    purchaseNotes: z.string().optional().nullable(),
    purchaseDate: z.string().optional().nullable(),
    uuid: z.string().optional().nullable(),
  }),
});

export const purchaseQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    status: z.enum(['PENDING', 'PAID', 'CANCELLED']).optional(),
    commodityId: z.string().optional(),
    farmerId: z.string().optional(),
    buyingCentre: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(['PENDING', 'PAID', 'CANCELLED'], { required_error: 'Payment status is required' }),
    paymentMethod: z.enum(['MOBILE_MONEY_TNMPAMBA', 'AIRTEL_MONEY', 'BANK_TRANSFER', 'CASH']).optional().nullable(),
    paymentReference: z.string().optional().nullable(),
  }),
});
