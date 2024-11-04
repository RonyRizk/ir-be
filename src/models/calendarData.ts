import { ICountry } from './common';
import { RoomDetail, STATUS } from './IBooking';

export type TAdultChildConstraints = { adult_max_nbr: number | null; child_max_nbr: number | null; child_max_age: number | null };
export interface CalendarDataDetails {
  adultChildConstraints: TAdultChildConstraints;
  allowedBookingSources: IAllowedBookingSources[];
  currency: IPickupCurrency;
  endingDate: number;
  taxes: ITaxes[];
  formattedLegendData: IFormattedLegendData;
  is_vacation_rental: boolean;
  legendData: ILegendData[];
  roomsInfo: RoomDetail[];
  startingDate: number;
  language: string;
  toBeAssignedEvents: [];
  max_nights: number;
  allowed_payment_methods: IAllowedPaymentMethods[];
  pickup_service: IPickupService;
  is_frontdesk_enabled: boolean;
  id: number;
  name: string;
  token: string;
  tax_statement: string;
  country: ICountry;
  is_pms_enabled: boolean;
}
export interface ITaxes {
  is_exlusive: boolean;
  name: string;
  pct: number;
}

export interface IChannel {
  id: number;
  channel: IExposedChannel;
  is_active: boolean;
  map: IMap[];
  title: string;
}
export interface IExposedChannel {
  id: number | string;
  name: string;
  properties: IChannelProperty[];
  property?: IChannelProperty;
}
export interface IChannelProperty {
  id: string;
  name: string;
  room_types: IChannelRoomTypes[];
}
export interface IChannelRoomTypes {
  id: string;
  name: string;
  rate_plans: IChannelRatePlans[];
}
export interface IChannelRatePlans {
  id: string;
  name: string;
}
export interface IMap {
  channel_id: string;
  ir_id: string;
  type: 'room_type' | 'rate_plan' | 'property';
}
export interface IPickupCurrency extends ICurrency {
  symbol: string;
}
export interface IPickupService {
  allowed_locations: IAllowedLocation[];
  allowed_options: IAllowedOptions[];
  allowed_pricing_models: IPriceModel[];
  allowed_vehicle_types: IVehicle[];
  is_enabled: boolean;
  is_not_allowed_on_same_day: boolean;
  pickup_cancelation_prepayment: IPickupCancelationPrepayment;
  pickup_instruction: IPickupInstruction;
}
export interface IPickupInstruction {
  code: string;
  description: string;
}
export interface IPickupCancelationPrepayment {
  code: string;
  description: string;
}
export interface IAllowedOptions {
  amount: number;
  currency: IPickupCurrency;
  id: number;
  location: IAllowedLocation;
  vehicle: IVehicle;
  pricing_model: {
    code: string;
    description: string;
  };
}
export interface IVehicle {
  code: string;
  description: string;
  capacity: number;
}

export interface IPriceModel {
  code: string;
  description: string;
}
export interface IAllowedLocation {
  description: string;
  id: number;
}
export interface IAllowedPaymentMethods {
  code: string;
  description: string;
  icon_class_name: string | null;
  img_url: string | null;
  notes: string | null;
}

export interface IAllowedBookingSources {
  code: string;
  description: string;
  id: string;
  tag: string;
  type: string;
}
export interface ICurrency {
  code: string;
  id: number;
}
export interface IFormattedLegendData {
  legendData: ILegendData[];
  statusId: Record<STATUS, IStatusName>;
}
export interface ILegendData {
  color: string;
  design: string;
  id: string;
  name: string;
}
export interface IStatusName {
  id: number;
  clsName: string;
}

export interface CalendarMonth {
  daysCount: number;
  monthName: string;
}
