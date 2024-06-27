import { z } from 'zod';

export const SignInValidtor = z.object({
  email: z.string().email(),
  booking_nbr: z.string().min(4),
});
export const SignUpValidtor = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});

export type TSignInValidator = z.infer<typeof SignInValidtor>;
export type TSignUpValidator = z.infer<typeof SignUpValidtor>;

export type TTrigger = 'fb' | 'be';
export type TSignInAuthTrigger = FBTrigger | GoogleTrigger | BeSignInTrigger;
export type TSignUpAuthTrigger = FBTrigger | GoogleTrigger | BeSignUpTrigger;

interface FBTrigger {
  trigger: 'fb';
}
interface GoogleTrigger {
  trigger: 'google';
}

interface BeSignInTrigger {
  trigger: 'be';
  params: TSignInValidator;
}
interface BeSignUpTrigger {
  trigger: 'be';
  params: TSignUpValidator;
}
