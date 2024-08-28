import { ICurrency } from './commun';

export interface IExposedProperty {
  adult_child_constraints: AdultChildConstraints;
  affiliates: Affiliate[];
  agents: Agent[];
  allowed_booking_sources: AllowedBookingSource[];
  allowed_cards: AllowedCard[];
  allowed_payment_methods: AllowedPaymentMethod[];
  area: string;
  amenities: Amenity[];
  address: string;
  baby_cot_offering: BabyCotOffering;
  calendar_legends: CalendarLegend[];
  city: City;
  country: Country;
  currency: ICurrency;
  description: Description;
  id: number;
  images: Image[];
  internet_offering: InternetOffering;
  is_frontdesk_enabled: boolean;
  is_vacation_rental: boolean;
  location: Location;
  promotions: LoyaltyPromotion[];
  max_nights: number;
  name: string;
  parking_offering: ParkingOffering;
  be_listing_mode: 'list' | 'grid';
  pets_acceptance: PetsAcceptance;
  phone: string;
  postal: string;
  perma_link: string;
  pickup_service: PickupService;
  roomtypes: RoomType[];
  social_media: SocialMedia[];
  space_theme: SpaceTheme;
  tax_statement: string;
  tags: { key: string; value: string | null }[];
  taxes: Tax[];
  time_constraints: TimeConstraints;
  privacy_policy: string;
  contacts: IPropertyContact[];
}
export interface Affiliate {
  address: string;
  afname: string;
  city: string;
  contact_name: string;
  country: Country;
  currency: ICurrency;
  id: number;
  name: string;
  phone: string;
  sites: Site[];
  email: string;
}
interface Site {
  button_bg_color: string;
  heading_bar_color: string;
  heading_bar_font_color: string;
  is_apply_theme: boolean;
  logo: string;
  url: string;
}
interface IPropertyContact {
  email: string;
  mobile: null;
  name: string;
  phone: string;
  type: string;
}

export interface AdultChildConstraints {
  adult_max_nbr: number;
  child_max_age: number;
  child_max_nbr: number;
}

export interface Agent {
  code: string;
  id: number;
  name: string;
  verification_mode: string;
}

export interface AllowedBookingSource {
  code: string;
  description: string;
  id: string;
  tag: string;
  type: string;
}

export interface AllowedCard {
  id: number;
  name: string;
}

export interface AllowedPaymentMethod {
  code: string;
  description: string;
  icon_class_name: any;
  img_url: any;
  notes: any;
  data: { key: string; value: string }[];
  is_payment_gateway: boolean;
  id: number;
}

export interface Amenity {
  amenity_type: string;
  code: string;
  description: string;
}

export interface BabyCotOffering {
  rate_per_night: number;
  title: string;
}

export interface CalendarLegend {
  color: string;
  design: string;
  id: string;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

export interface Country {
  cities: any; // Specify if more detail is known
  flag: any; // More specific type if known
  id: number;
  name: string;
  phone_prefix: any; // More specific type if known
}
export interface Description {
  food_and_beverage: string;
  important_info: string;
  location_and_intro: string;
  non_standard_conditions: string;
  rooming: string;
}

export interface Image {
  tooltip: any; // More specific type if known
  url: string;
}

export interface InternetOffering {
  is_public_internet_free: boolean;
  is_room_internet_free: boolean;
  public_internet_statement: string;
  room_internet_statement: string;
  room_rate_per_24_hour: number;
  room_rate_per_hour: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface LoyaltyPromotion {
  from: string;
  id: number;
  is_loyalty: boolean;
  key: string;
  to: string;
}

export interface ParkingOffering {
  pricing: number;
  schedule: string;
  title: string;
}

export interface PetsAcceptance {
  title: string;
}

export interface PickupService {
  allowed_locations: AllowedLocation[];
  allowed_options: AllowedOption[];
  allowed_pricing_models: AllowedPricingModel[];
  allowed_vehicle_types: AllowedVehicleType[];
  is_enabled: boolean;
  is_not_allowed_on_same_day: boolean;
  pickup_cancelation_prepayment: PickupCancelationPrepayment;
  pickup_instruction: PickupInstruction;
}

export interface AllowedPricingModel {
  code: string;
  description: string;
}

export interface AllowedVehicleType {
  capacity: number;
  code: string;
  description: string;
}

export interface AllowedLocation {
  description: string;
  id: number;
}

export interface AllowedOption {
  amount: number;
  currency: ICurrency;
  id: number;
  location: AllowedLocation;
  pricing_model: PricingModel;
  vehicle: Vehicle;
}

export interface PricingModel {
  code: string;
  description: string;
}

export interface Vehicle {
  capacity: number;
  code: string;
  description: string;
}

export interface PickupCancelationPrepayment {
  code: string;
  description: string;
}

export interface PickupInstruction {
  code: string;
  description: string;
}

export interface RoomType {
  amenities: Amenity[];
  availabilities: any;
  bedding_setup: BeddingSetup[];
  description: string;
  exposed_inventory: any;
  id: number;
  images: Image[];
  inventory: number;
  is_active: boolean;
  is_bed_configuration_enabled: boolean;
  main_image: Image | null;
  name: string;
  occupancy_default: Occupancy;
  occupancy_max: Occupancy;
  physicalrooms: PhysicalRoom[];
  rate: any;
  rateplans: RatePlan[];
  size: number;
  smoking_option: ISmokingOption;
  pre_payment_amount: number;
}

export interface AllowedSmokingOptions {
  code: string;
  description: string;
}
export interface ISmokingOption {
  allowed_smoking_options: AllowedSmokingOptions[];
  code: string;
  description: string;
}

export interface BeddingSetup {
  code: string;
  count: number;
  name: string;
}

export interface Occupancy {
  adult_nbr: number;
  children_nbr: number;
  infant_nbr: number | null;
}

export interface PhysicalRoom {
  calendar_cell: any;
  housekeeper: Housekeeper | null;
  id: number;
  name: string;
}

export interface Housekeeper {
  assigned_units: any;
  id: number;
  is_active: boolean;
  is_soft_deleted: boolean;
  mobile: any;
  name: string;
  note: any;
  password: any;
  phone_prefix: any;
  property_id: number;
  username: any;
}

export interface RatePlan {
  assignable_units: Assignableunit[];
  cancelation: string;
  custom_text?: any;
  guarantee: string;
  id: number;
  is_active: boolean;
  is_booking_engine_enabled: boolean;
  is_channel_enabled: boolean;
  is_closed: boolean;
  is_non_refundable: boolean;
  is_targeting_travel_agency: boolean;
  name: string;
  rate_restrictions?: any;
  selected_variation?: any;
  sell_mode: SellMode;
  variations: Variation[];
  short_name: string;
  pre_payment_amount: number;
  pre_payment_amount_gross: number;
}
export interface Variation {
  adult_child_offering: string;
  adult_nbr: number;
  amount: number;
  child_nbr: number;
  amount_per_night: string;
  discount_pct: number;
  is_lmd: boolean;
  nights_nbr: number;
  total_before_discount: number;
  is_calculated?: boolean;
  IS_MLS_VIOLATED?: boolean;
  MLS_ALERT?: string;
  amount_gross: number;
}
export interface Assignableunit {
  Is_Fully_Available: boolean;
  Is_Not_Available: boolean;
  Is_Partially_Available: boolean;
  from_date: string;
  name: string;
  pr_id: number;
  prs_entries: Prsentry[];
  to_date: string;
}

export interface Prsentry {
  BLOCKED_TILL_DATE?: any;
  BLOCKED_TILL_HOUR?: any;
  BLOCKED_TILL_MINUTE?: any;
  BOOK_NBR?: any;
  BSA_REF?: any;
  DESCRIPTION?: any;
  ENTRY_DATE?: any;
  ENTRY_USER_ID?: any;
  EXTRA_DATA?: any;
  EXTRA_DATA_TYPE?: any;
  IS_CONTINUITY?: any;
  My_Pr?: any;
  NOTES?: any;
  OWNER_ID?: any;
  POOL?: any;
  PRS_DATE: string;
  PRS_ID?: any;
  PR_ID: number;
  STAY_SHIFT_CODE: string;
  STAY_STATUS_CODE?: any;
}
export interface SellMode {
  code: string;
  description: string;
}

export interface SocialMedia {
  code: string;
  link: string;
  name: string;
}

export interface SpaceTheme {
  background_image: string;
  button_bg_color: string;
  heading_bar_color: string;
  heading_font_color: string;
  logo: string;
  website: string;
  button_border_radius: string;
}

export interface Tax {
  is_exlusive: boolean;
  name: string;
  pct: number;
}

export interface TimeConstraints {
  booking_cutoff: string;
  check_in_from: string;
  check_in_till: string;
  check_out_till: string;
}
export interface IEntries {
  CODE_NAME: string;
  CODE_VALUE_AR: string;
  CODE_VALUE_DE: string;
  CODE_VALUE_EL: string;
  CODE_VALUE_EN: string;
  CODE_VALUE_FR: string;
  CODE_VALUE_HE: string;
  CODE_VALUE_PL: string;
  CODE_VALUE_RU: string;
  CODE_VALUE_UA: string;
  DISPLAY_ORDER: number;
  ENTRY_DATE: string;
  ENTRY_USER_ID: number;
  INVARIANT_VALUE: null;
  ISDELETEABLE: boolean;
  ISDELETED: boolean;
  ISSYSTEM: boolean;
  ISUPDATEABLE: boolean;
  ISVISIBLE: boolean;
  NOTES: string;
  OWNER_ID: number;
  TBL_NAME: string;
}
export interface ISetupEntries {
  arrivalTime: IEntries[];
  ratePricingMode: IEntries[];
  bedPreferenceType: IEntries[];
}
export interface IExposedApplicablePolicies {
  type: 'guarantee' | 'cancelation';
  brackets: IBrackets[];
  combined_statement: string;
}
export interface IBrackets {
  due_on: string;
  code: string;
  statement: string;
  amount: number;
  currency_id: number;
  gross_amount: number;
}
