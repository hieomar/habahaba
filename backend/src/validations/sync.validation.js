import { z } from 'zod';

export const syncPushSchema = z.object({
  body: z.object({
    deviceId: z.string({ required_error: 'Device ID is required' }).min(1),
    farmers: z.array(
      z.object({
        uuid: z.string({ required_error: 'Farmer UUID is required' }),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phoneNumber: z.string().optional().nullable(),
        nationalId: z.string().optional().nullable(),
        village: z.string().optional().nullable(),
        district: z.string().optional().nullable(),
        club: z.string().optional().nullable(),
        association: z.string().optional().nullable(),
        crops: z.array(z.string()).optional().default([]),
        latitude: z.number().optional().nullable(),
        longitude: z.number().optional().nullable(),
        seedLoanBalance: z.number().optional().default(0),
        registeredAt: z.string().optional().nullable(),
      })
    ).optional().default([]),
    farms: z.array(
      z.object({
        uuid: z.string({ required_error: 'Farm UUID is required' }),
        farmerUuid: z.string({ required_error: 'Farmer UUID link is required' }),
        farmName: z.string().min(1),
        location: z.string().optional().nullable(),
        acreage: z.number().optional().nullable(),
        primaryCrop: z.string().optional().nullable(),
      })
    ).optional().default([]),
    purchases: z.array(
      z.object({
        uuid: z.string({ required_error: 'Purchase UUID is required' }),
        farmerUuid: z.string({ required_error: 'Farmer UUID is required' }),
        commodity: z.string().min(1),
        variety: z.string().optional().nullable(),
        quantityKg: z.number().positive(),
        pricePerKg: z.number().positive(),
        totalPrice: z.number().positive(),
        loanRecovered: z.number().optional().default(0),
        netPayment: z.number().optional().default(0),
        receiptNumber: z.string().min(1),
        buyingCenter: z.string().optional().nullable(),
        numberOfBags: z.number().optional().default(1),
        bagTagRange: z.string().optional().nullable(),
        purchaseDate: z.string().optional().nullable(),
      })
    ).optional().default([]),
  }),
});
