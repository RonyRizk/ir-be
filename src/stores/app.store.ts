import { ICurrency, IExposedLanguages, pages, TCurrency, TDirection } from '@/models/common';
import { Affiliate, IEntries, IExposedProperty } from '@/models/property';
import { createStore } from '@stencil/store';
import moment from 'moment/min/moment-with-locales';
export type UserPreference = {
  language_id: string;
  currency_id: string;
};
export type NonBookableNights = {
  night: string;
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
  childrenStartAge?: number;
  nonBookableNights: Record<string, null>;
  currencies: TCurrency[];
  localizedWords: string[];
  dir: TDirection;
  selectedLocale: string;
  userPreferences: UserPreference;
  app_data: {
    view: 'extended' | 'default';
    override_rp?: boolean;
    token: string;
    property_id: number;
    injected: boolean;
    roomtype_id: number | null;
    affiliate: Affiliate;
    tag: string | null;
    source: TSource | null;
    hideGoogleSignIn: boolean;
    isFromGhs: boolean;
    stag: string | null;
    displayMode: 'default' | 'grid';
    isAgentMode?: boolean;
    aName: string;
    perma_link: string;
    origin: string | null;
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
  nonBookableNights: null,
  childrenStartAge: 3,
  currentPage: 'booking',
  dir: 'LTR',
  selectedLocale: 'en',
  localizedWords: [],
  userPreferences: {
    currency_id: 'usd',
    language_id: 'en',
  },
  invoice: null,
  app_data: {
    view: 'default',
    origin: null,
    override_rp: false,
    displayMode: 'default',
    affiliate: null,
    stag: null,
    token: '',
    property_id: null,
    injected: false,
    roomtype_id: null,
    tag: null,
    source: null,
    hideGoogleSignIn: false,
    isFromGhs: false,
    isAgentMode: false,
    aName: null,
    perma_link: null,
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

export function changeLocale(dir: TDirection, locale: string) {
  document.body.dir = dir;
  app_store.dir = dir;
  app_store.selectedLocale = locale;
  moment.locale(locale);
}
export function updateUserPreference(params: Partial<UserPreference>) {
  app_store.userPreferences = {
    ...app_store.userPreferences,
    ...params,
  };
}
export { onAppDataChange };
export default app_store;
