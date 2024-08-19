import { z } from 'zod';

export const IrUserFormData = z.object({
  firstName: z.string().min(2, {
    message: 'FullNameCannotBeEmpty',
  }),
  lastName: z.string().min(2, {
    message: 'LastNameCannotBeEmpty',
  }),
  email: z.string().email({ message: 'InvalidEmail' }),
  mobile_number: z.coerce.number().min(5),
  arrival_time: z.string(),
  message: z.string().optional(),
  bookingForSomeoneElse: z.boolean().default(false),
  country_id: z.coerce.number(),
  country_phone_prefix: z.coerce.string().min(1),
  id: z.coerce.number().nullable().default(null),
});
export type TUserFormData = z.infer<typeof IrUserFormData>;

export const IrGuest = z.object({
  address: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  country_id: z.coerce.number().min(1),
  dob: z.string().nullable().default(null),
  email: z.string().email(),
  first_name: z.string().min(2, {
    message: 'FullNameCannotBeEmpty',
  }),
  id: z.coerce.number().nullable().default(null),
  last_name: z.string().min(3),
  mobile: z.coerce.number().min(5),
  subscribe_to_news_letter: z.boolean().default(false),
  country_phone_prefix: z.string().min(1), // cci?: ICCI | null;
  alternative_email: z.string().email().optional().nullable(),
});
export type TGuest = z.infer<typeof IrGuest>;
