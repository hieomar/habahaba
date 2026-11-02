import { z } from 'zod';

export const traceQuerySchema = z.object({
  query: z.object({
    code: z.string({ required_error: 'Traceability code or receipt/bag number is required' }).min(1),
  }),
});
