import { z } from 'zod';

export const ZCurrency = z.object({
  code: z.string(),
  name: z.string().optional(),
  symbol: z.string(),
  id: z.coerce.number().optional(),
});
export type TCurrency = z.infer<typeof ZCurrency>;
export interface ICurrency {
  id: number;
  name: string;
  symbol: string;
  code: string;
}
export interface ICountry {
  cities: string[];
  id: number;
  name: string;
  phone_prefix: string;
  flag: string;
  code: string;
  currency: {
    code: string;
    id: number;
    symbol: string;
  };
}
export type TDirection = 'LTR' | 'RTL';
export interface IExposedLanguages {
  code: string;
  culture: string;
  description: string;
  direction: TDirection;
  entries: null;
  id: number;
  flag: string;
}
export interface DataStructure {
  ExceptionCode: any;
  ExceptionMsg: string;
  My_Params_Get_Exposed_Property: any;
  My_Result: any;
}
export type pages = 'booking' | 'checkout' | 'invoice' | 'booking-listing' | 'user-profile';
export class Identifier {
  code: string;
  name: string;
}
