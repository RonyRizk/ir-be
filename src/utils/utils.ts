import { ICurrency } from '@/components';
import { Assignableunit, IExposedProperty } from '@/models/property';
import app_store, { changeLocale, updateUserPreference } from '@/stores/app.store';
import booking_store, { modifyBookingStore } from '@/stores/booking';
import clsx, { ClassValue } from 'clsx';
import { addDays, differenceInCalendarDays, format, isBefore, Locale } from 'date-fns';
import { ar, es, fr, de, pl, uk, ru, el, enUS } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';
// import DOMPurify from 'dompurify';
const localeMap: { [key: string]: Locale } = {
  en: enUS,
  ar: ar,
  fr: fr,
  es: es,
  de: de,
  pl: pl,
  ua: uk,
  ru: ru,
  el: el,
};
export function matchLocale(locale: string): Locale {
  return localeMap[locale.toLowerCase()] || enUS;
}
export function getAbbreviatedWeekdays(locale: Locale) {
  const baseDate = new Date(2020, 5, 7);
  let weekdays = [];
  for (let i = 0; i < 7; i++) {
    const weekday = format(addDays(baseDate, i), 'eee', { locale });
    weekdays.push(weekday);
  }
  return weekdays.slice(1, 7).concat(weekdays.slice(0, 1));
}

export function setLanguagePreference(language: string): void {
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 10);
  const cookieValue = `language=${language}; expires=${expiryDate.toUTCString()}; path=/; Secure; SameSite=Lax`;
  document.cookie = cookieValue;
}

export function getLanguagePreference(): string | null {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith('language=')) {
      return cookie.substring('language='.length);
    }
  }
  return null;
}
export function getAvailableRooms(assignable_units: Assignableunit[]) {
  let result = [];
  assignable_units.map(unit => {
    if (unit.Is_Fully_Available) {
      result.push({ name: unit.name, id: unit.pr_id });
    }
  });
  return result;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatAmount = (amount: any, currency: string = 'USD', decimals = 2) => {
  const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return numberFormatter.format(amount);
};
export function getDateDifference(date1: Date, date2: Date) {
  return differenceInCalendarDays(date2, date1);
}
export function renderTime(time: number) {
  return time < 10 ? time.toString().padStart(2, '0') : time.toString();
}
export function getUserPrefernce(lang: string | undefined = undefined) {
  const p = JSON.parse(localStorage.getItem('user_preference'));
  if (p) {
    const { direction, currency_id } = p;
    changeLocale(direction, matchLocale(p.language_id));
    updateUserPreference({
      currency_id,
      language_id: p.language_id,
    });
  } else {
    updateUserPreference({
      language_id: lang || 'en',
    });
  }
}
export function runScriptAndRemove(scriptContent: string): void {
  const script = document.createElement('script');
  script.textContent = scriptContent;
  document.body.appendChild(script);
  document.body.removeChild(script);
}

export function setDefaultLocale({ currency }: { currency: ICurrency }) {
  app_store.userPreferences = {
    ...app_store.userPreferences,
    currency_id: currency.code.toString(),
  };
  // matchLocale(language_id)
}

export function getCookies(): { [key: string]: string } {
  const cookies: { [key: string]: string } = {};
  const cookiesArray: string[] = document.cookie.split('; ');

  cookiesArray.forEach(cookie => {
    const [name, value] = cookie.split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
}
export function getCookie(name: string): string | null {
  const cookies = getCookies();
  return cookies[name] || null;
}

export function manageAnchorSession(data: Record<string, unknown>, mode: 'add' | 'remove' = 'add') {
  const anchor = JSON.parse(sessionStorage.getItem('anchor'));
  if (anchor) {
    if (mode === 'add') {
      return sessionStorage.setItem('anchor', JSON.stringify({ ...anchor, ...data }));
    } else if (mode === 'remove') {
      const keys = Object.keys(data);
      keys.forEach(key => {
        if (key in anchor) {
          delete anchor[key];
        }
      });
      return sessionStorage.setItem('anchor', JSON.stringify(anchor));
    }
  } else {
    if (mode === 'add') {
      return sessionStorage.setItem('anchor', JSON.stringify({ ...data }));
    }
  }
}

export function injectHTML(htmlContent: string, target: 'head' | 'body' = 'body', position: 'first' | 'last' = 'last') {
  // const safeContent = DOMPurify.sanitize(htmlContent);
  // console.log(safeContent, htmlContent);
  const element = document.createRange().createContextualFragment(htmlContent);
  const destination = target === 'head' ? document.head : document.body;

  if (position === 'first') {
    destination.insertBefore(element, destination.firstChild);
  } else {
    destination.appendChild(element);
  }
}
export function checkAffiliate(afName: string) {
  if (!afName) {
    return null;
  }
  const affiliate = app_store?.property?.affiliates.find(aff => aff.afname.toLowerCase().trim() === afName);
  if (!affiliate) {
    return null;
  }
  console.log(affiliate);
  return affiliate;
}
export function formatFullLocation(property: IExposedProperty) {
  return [property?.area ?? null, property?.city?.name ?? null, property?.country?.name ?? null].filter(f => f !== null).join(', ');
}
export function formatImageAlt(alt: string | null, roomTypeName: string | null = null) {
  return [roomTypeName, alt, `${app_store.property.name}, ${app_store.property.country.name}`].filter(f => f !== null).join(' - ');
}
export function validateCoupon(coupon: string) {
  if (!coupon) {
    return false;
  }
  let isValidCoupon = false;
  const c = app_store.property.promotions.find(p => p.key === coupon.trim());
  if (c) {
    if (isBefore(new Date(c.to), new Date())) {
      return false;
    }
    isValidCoupon = true;
    modifyBookingStore('bookingAvailabilityParams', {
      ...booking_store.bookingAvailabilityParams,
      coupon,
      loyalty: false,
    });
  }
  return isValidCoupon;
}
export function validateAgentCode(code: string) {
  if (!code) {
    return false;
  }
  let isValidCode = false;
  const agent = app_store.property?.agents.find(a => a.code.toLowerCase() === code.trim().toLowerCase());
  if (agent) {
    isValidCode = true;
    booking_store.bookingAvailabilityParams = {
      ...booking_store.bookingAvailabilityParams,
      agent: agent.id,
      agent_code: code,
    };
    app_store.app_data = {
      ...app_store.app_data,
      isAgentMode: true,
    };
  }
  return isValidCode;
}
export function renderPropertyLocation() {
  const affiliate = app_store.app_data.affiliate;
  if (affiliate) {
    return [app_store.app_data.affiliate?.address || null, app_store.app_data.affiliate.city || null, app_store.app_data.affiliate.country.name || null]
      .filter(f => f !== null)
      .join(', ');
  }
  return [app_store.property?.area || null, app_store.property?.city.name || null, app_store.property?.country.name || null].filter(f => f !== null).join(', ');
}
function setBookingCookie() {
  const cookieName = 'ghs_booking';
  const cookieValue = 'true';
  const date = addDays(new Date(), 30);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = `${cookieName}=${cookieValue};${expires};path=/`;
}
export function destroyBookingCookie() {
  const cookieName = 'ghs_booking';
  const pastDate = new Date(0).toUTCString();
  document.cookie = `${cookieName}=; expires=${pastDate}; path=/`;
}

export function checkGhs(source_code: string, stag: string) {
  const ghsCookie = getCookie('ghs_booking');
  if (source_code === 'ghs' || stag === 'ghs') {
    destroyBookingCookie();
    setBookingCookie();
    return true;
  }
  if (ghsCookie) {
    return true;
  }
  return false;
}
export function detectCardType(value: string) {
  const startsWith = (prefixes: string[]) => prefixes.some(prefix => value.startsWith(prefix));
  if (startsWith(['4'])) {
    return 'VISA';
  } else if (startsWith(['5', '2'])) {
    return 'Mastercard';
  } else if (startsWith(['34', '37'])) {
    return 'AMEX';
  } else {
    return '';
  }
}
