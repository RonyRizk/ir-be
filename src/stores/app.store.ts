import { ICurrency, IExposedLanguages, pages, TCurrency, TDirection } from '@/models/common';
import { Affiliate, IEntries, IExposedProperty } from '@/models/property';
import { createStore } from '@stencil/store';
import { enUS, Locale } from 'date-fns/locale';
export type UserPreference = {
  language_id: string;
  currency_id: string;
};
interface IUserDefaultCountry {
  cities: [];
  currency: ICurrency;
  flag: string;
  id: number;
  name: string;
  phone_prefix: string;
}
export type TSource = {
  code: string;
  description: string;
};

export interface IAppStore {
  currencies: TCurrency[];
  localizedWords: string[];
  dir: TDirection;
  selectedLocale: Locale;
  userPreferences: UserPreference;
  app_data: {
    token: string;
    property_id: number;
    injected: boolean;
    roomtype_id: number | null;
    redirect_url: string;
    affiliate: Affiliate;
    tag: string | null;
    source: TSource | null;
  };
  property: IExposedProperty;
  setup_entries: {
    arrivalTime: IEntries[];
    ratePricingMode: IEntries[];
    bedPreferenceType: IEntries[];
  };
  userDefaultCountry: IUserDefaultCountry;
  fetchedBooking: boolean;
  currentPage: pages;
  languages: IExposedLanguages[];
  is_signed_in: boolean;
  email: string | null;
  invoice: {
    booking_number: string;
    email: string;
  } | null;
}

const initialState: IAppStore = {
  currentPage: 'booking',
  dir: 'LTR',
  selectedLocale: enUS,
  localizedWords: [],
  userPreferences: {
    currency_id: 'usd',
    language_id: 'en',
  },
  invoice: null,
  app_data: {
    affiliate: null,
    token: '',
    property_id: null,
    injected: false,
    roomtype_id: null,
    redirect_url: null,
    tag: null,
    source: null,
  },
  property: undefined,
  setup_entries: undefined,
  currencies: [],
  userDefaultCountry: undefined,
  fetchedBooking: false,
  languages: [],
  is_signed_in: false,
  email: null,
};
const { state: app_store, onChange: onAppDataChange } = createStore<IAppStore>(initialState);

export function changeLocale(dir: TDirection, locale: Locale) {
  document.body.dir = dir;
  app_store.dir = dir;
  app_store.selectedLocale = locale;
}
export function updateUserPreference(params: Partial<UserPreference>) {
  app_store.userPreferences = {
    ...app_store.userPreferences,
    ...params,
  };
}
export { onAppDataChange };
export default app_store;
