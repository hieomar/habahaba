import { z } from 'zod';

export const createFarmSchema = z.object({
  body: z.object({
    farmerId: z.string({ required_error: 'Farmer ID is required' }).uuid('Invalid farmer ID format'),
    farmName: z.string({ required_error: 'Farm name is required' }).min(1, 'Farm name cannot be empty'),
    location: z.string({ required_error: 'Location is required' }).min(1),
    district: z.string().optional().nullable(),
    village: z.string().optional().nullable(),
    sizeHectares: z.number({ required_error: 'Farm acreage/size is required' }).positive('Size must be greater than zero'),
    gpsLat: z.number().optional().nullable(),
    gpsLng: z.number().optional().nullable(),
    primaryCrop: z.string({ required_error: 'Primary crop is required' }).min(1),
    secondaryCrop: z.string().optional().nullable(),
    season: z.string().optional().nullable(),
    productionEstimateKg: z.number().positive().optional().nullable(),
    soilType: z.string().optional().nullable(),
    irrigated: z.boolean().default(false),
    extensionNotes: z.string().optional().nullable(),
    uuid: z.string().optional().nullable(),
  }),
});
