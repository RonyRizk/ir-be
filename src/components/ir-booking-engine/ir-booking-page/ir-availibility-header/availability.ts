import { z } from 'zod';

export const ExposedBookingAvailability = z.object({
  propertyid: z.coerce.number(),
  from_date: z.string().min(2),
  to_date: z.string().min(2),
  room_type_ids: z.string().array().optional().default([]),
  adult_nbr: z.number().min(1),
  child_nbr: z.number().min(0),
  infant_nbr: z.number().min(0),
  language: z.string().default('en'),
  currency_ref: z.string(),
  is_in_loyalty_mode: z.boolean().default(false),
  promo_key: z.string(),
  is_in_agent_mode: z.boolean().default(false),
  agent_id: z.number().default(0).optional(),
  is_in_affiliate_mode: z.boolean().default(false),
  affiliate_id: z.number().default(0).optional(),
});

export type TExposedBookingAvailability = z.infer<typeof ExposedBookingAvailability>;
