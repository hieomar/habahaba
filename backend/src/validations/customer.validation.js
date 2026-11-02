import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    code: z.string({ required_error: 'Customer code is required' }).min(1),
    name: z.string({ required_error: 'Customer name is required' }).min(1),
    type: z.enum(['Government', 'Private']).default('Government'),
    contact: z.string({ required_error: 'Contact phone/email is required' }).min(1),
    address: z.string({ required_error: 'Address is required' }).min(1),
  }),
});
