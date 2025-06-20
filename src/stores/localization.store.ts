import { createStore } from '@stencil/store';

export interface ILocale {
  entries: TLocaleLocalizedWordsEntries;
  direction: 'ltr' | 'rtl';
}
export type TLocaleLocalizedWordsEntries = {
  Lcz_AcceptAndConfirm: string;
  Lcz_AcceptedCreditCards: string;
  Lcz_No: string;
  Lcz_AnyInfant: string;
  Lcz_Activities: string;
  Lcz_Address: string;
  Lcz_Infants: string;
  Lcz_infant: string;
  Lcz_Adult: string;
  Lcz_BookingIsNotAvailable: string;
  Lcz_PriceDrop: string;
  Lcz_enterchildage: string;
  Lcz_GoBack: string;
  Lcz_PayToGuarantee: string;
  Lcz_OnCredit: string;
  Lcz_Bedconfiguration: string;
  Lcz_IfYouCancelNow: string;
  Lcz_Adults: string;
  Lcz_Age: string;
  Lcz_under1: string;
  Lcz_NoAvailability: string;
  Lcz_Ages: string;
  Lcz_AlreadyHaveAnAccount: string;
  Lcz_Amenities: string;
  Lcz_AnEmailHasBeenSent: string;
  Lcz_AnyMessageForUs: string;
  Lcz_Apply: string;
  Lcz_ArrivalDate: string;
  Lcz_ArrivalHour: string;
  Lcz_ArrivalTime: string;
  Lcz_At: string;
  Lcz_Balance: string;
  Lcz_Before: string;
  Lcz_BookedBy: string;
  Lcz_BookedOn: string;
  Lcz_BookingCancellation: string;
  Lcz_BookingCode: string;
  Lcz_BookingDate: string;
  Lcz_BookingDetails: string;
  Lcz_BookingReference: string;
  Lcz_BookNow: string;
  Lcz_Cancel: string;
  Lcz_Cancelation: string;
  Lcz_CancelBooking: string;
  Lcz_CardNumber: string;
  Lcz_CarModel: string;
  Lcz_ChangeDetails: string;
  Lcz_CheckIn: string;
  Lcz_CheckInFromUntil: string;
  Lcz_CheckOut: string;
  Lcz_Child: string;
  Lcz_Children: string;
  Lcz_Clear: string;
  Lcz_Close: string;
  Lcz_CompleteYourAccount: string;
  Lcz_CompleteYourBooking: string;
  Lcz_Conditions: string;
  Lcz_Confirm: string;
  Lcz_ConfirmBooking: string;
  Lcz_Contact: string;
  Lcz_ContactInformation: string;
  Lcz_ContinueWithFacebook: string;
  Lcz_ContinueWithGoogle: string;
  Lcz_Country: string;
  Lcz_CreateAnAccount: string;
  Lcz_Currency: string;
  Lcz_Cvc: string;
  Lcz_Date: string;
  Lcz_Dates: string;
  Lcz_DiscountApplied: string;
  Lcz_DisplaSettings: string;
  Lcz_Done: string;
  Lcz_DontHaveAnAccount: string;
  Lcz_DueAmountNow: string;
  Lcz_Duration: string;
  Lcz_Email: string;
  Lcz_EmailAddress: string;
  Lcz_EnterYourBookingBumber: string;
  Lcz_EnterYourCouponCode: string;
  Lcz_EnterYourEmail: string;
  Lcz_EnterYourFirstName: string;
  Lcz_EnterYourLastName: string;
  Lcz_EnterYourPassword: string;
  Lcz_ExpirationDate: string;
  Lcz_FacilitiesAndServices: string;
  Lcz_FirstName: string;
  Lcz_FlightDetails: string;
  Lcz_FoodAndbeverage: string;
  Lcz_ForgotPassword: string;
  Lcz_FreeCancellation: string;
  Lcz_FreeInternet: string;
  Lcz_From: string;
  Lcz_GetDirections: string;
  Lcz_GetLoyaltyDiscount: string;
  Lcz_Guarantee: string;
  Lcz_GuestFullName: string;
  Lcz_GuestName: string;
  Lcz_Guests: string;
  Lcz_GuestService_ContactUs: string;
  Lcz_HaveAgentorCoporate: string;
  Lcz_HaveCoupon: string;
  Lcz_Home: string;
  Lcz_IAgreePrivacyPolicy: string;
  Lcz_IAgreeToThe: string;
  Lcz_IAmBooklingForSomeoneElse: string;
  Lcz_IfICancel: string;
  Lcz_ImportantInformation: string;
  Lcz_InvalidAgentCode: string;
  Lcz_LastName: string;
  Lcz_Location: string;
  Lcz_LoyaltyApplied: string;
  Lcz_Maximum: string;
  Lcz_MealPlan: string;
  Lcz_MessageProperty: string;
  Lcz_MobileNumber: string;
  Lcz_More: string;
  Lcz_MoreDetails: string;
  Lcz_MyBookings: string;
  Lcz_NameOnCard: string;
  Lcz_NeedPickup: string;
  Lcz_Next: string;
  Lcz_night: string;
  Lcz_Nights: string;
  Lcz_NonRefundable: string;
  Lcz_NoOfVehicles: string;
  Lcz_NoPenalityIsApplied: string;
  Lcz_NotAvailable: string;
  Lcz_NoThankYou: string;
  Lcz_Or: string;
  Lcz_PageOf: string;
  Lcz_PaymentDetails: string;
  Lcz_PayNow: string;
  Lcz_Person: string;
  Lcz_PersonalProfile: string;
  Lcz_Persons: string;
  Lcz_Phone: string;
  Lcz_Pickup: string;
  Lcz_PickupFee: string;
  Lcz_Previous: string;
  Lcz_PrivacyPolicy: string;
  Lcz_PrivacyPolicyText: string;
  Lcz_PropertyFacilities: string;
  Lcz_PublicAreas: string;
  Lcz_RegisterForExclusiveDeals: string;
  Lcz_RequiredCapacity: string;
  Lcz_RetryPayment: string;
  Lcz_Room: string;
  Lcz_Rooms: string;
  Lcz_save: string;
  Lcz_Search: string;
  Lcz_SecurityCode: string;
  Lcz_SecurityCodeHint: string;
  Lcz_Select: string;
  Lcz_SelectYourPaymentMethod: string;
  Lcz_Services: string;
  Lcz_SiginIntToYourAccount: string;
  Lcz_SignIn: string;
  Lcz_SignInOrCreateToBookFaster: string;
  Lcz_SignInToYourBooking: string;
  Lcz_SignOut: string;
  Lcz_SignUp: string;
  Lcz_SomethingWentWrong: string;
  Lcz_SpecialRequest: string;
  Lcz_status: string;
  Lcz_ThisBookingIs: string;
  Lcz_Time: string;
  Lcz_Total: string;
  Lcz_Totalprice: string;
  Lcz_ViewConditions: string;
  Lcz_wifi: string;
  Lcz_YesFrom: string;
  Lcz_YouHavePaid: string;
  Lcz_YouMustAcceptPrivacyPolicy: string;
  Lcz_YourArrivalTime: string;
  Lcz_YourBookingIsConfirmed: string;
  Lcz_YourBookingIsGuaranteed: string;
  Lcz_YourBookingIsNotGuaranteed: string;
  Lcz_YourCardWillBeCharged: string;
  Lcz_YourPaymentIsUnsuccesful: string;
  Lcz_CardPaymentWith: string;
  Lcz_CardTypeNotSupport: string;
  Lcz_MLS_Alert: string;
  Lcz_NoDepositRequired: string;
  Lcz_SecureByCard: string;
  Lcz_PayByCard: string;
  Lcz_PaymentSecurity: string;
};

const initialState: ILocale = {
  entries: null,
  direction: 'ltr',
};
export const { state: localizedWords, onChange: onCalendarDatesChange } = createStore<ILocale>(initialState);

export default localizedWords;
