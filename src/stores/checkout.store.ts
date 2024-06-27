import { TPickupFormData } from '@/models/pickup';
import { TUserFormData } from '@/models/user_form';
import { createStore } from '@stencil/store';
import { format } from 'date-fns';
export interface ICardProcessing {
  code: string;
  cardNumber: string;
  cardHolderName: string;
  expiry_month: string;
  expiry_year: string;
}
export interface ICardProcessingWithoutCVC extends ICardProcessing {
  code: '004';
}
export interface ICardProcessingWithCVC extends ICardProcessing {
  code: '001';
  cvc: string;
}

export type TPayment = ICardProcessingWithoutCVC | ICardProcessingWithCVC | { code: string };
interface CheckoutStore {
  userFormData: TUserFormData;
  pickup: TPickupFormData;
  modifiedGuestName: boolean;
  payment: TPayment | null;
  agreed_to_services: boolean;
}

const initialState: CheckoutStore = {
  userFormData: {},
  modifiedGuestName: false,
  pickup: {
    arrival_date: format(new Date(), 'yyyy-MM-dd'),
  },
  payment: null,
  agreed_to_services: false,
};

export const { state: checkout_store, onChange: onCheckoutDataChange } = createStore<CheckoutStore>(initialState);

export function updateUserFormData(key: keyof TUserFormData, value: any) {
  checkout_store.userFormData = {
    ...checkout_store.userFormData,
    [key]: value,
  };
}
export function updatePickupFormData(key: keyof TPickupFormData, value: any) {
  if (key === 'location' && value === null) {
    checkout_store.pickup = {
      arrival_date: format(new Date(), 'yyyy-MM-dd'),
      location: null,
    };
  } else {
    checkout_store.pickup = {
      ...checkout_store.pickup,
      [key]: value,
    };
  }
}
export function updatePartialPickupFormData(params: Partial<TPickupFormData>) {
  checkout_store.pickup = {
    ...checkout_store.pickup,
    ...params,
  };
}
