import { ICurrency } from '@/components';
import { Assignableunit, IExposedProperty } from '@/models/property';
import app_store, { changeLocale, updateUserPreference } from '@/stores/app.store';
import booking_store, { modifyBookingStore } from '@/stores/booking';
import clsx, { ClassValue } from 'clsx';
import { addDays, isBefore } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import moment, { Moment } from 'moment/min/moment-with-locales';
import 'moment/locale/ar';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/pl';
import 'moment/locale/uk';
import 'moment/locale/ru';
import 'moment/locale/el';

const localeMap: { [key: string]: string } = {
  en: 'en',
  ar: 'ar',
  fr: 'fr',
  es: 'es',
  de: 'de',
  pl: 'pl',
  ua: 'uk',
  ru: 'ru',
  el: 'el',
};
export function matchLocale(locale: string): string {
  return localeMap[locale.toLowerCase()] || 'en';
}

export function getAbbreviatedWeekdays(locale: string) {
  let weekdays = [];
  for (let i = 0; i < 7; i++) {
    const weekday = moment().locale(locale).day(i).format('ddd');
    weekdays.push(weekday);
  }
  return weekdays;
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
export function getDateDifference(date1: Moment, date2: Moment) {
  // return differenceInCalendarDays(date2, date1);
  return date2.diff(date1, 'days');
}
export function renderTime(time: number) {
  return time < 10 ? time.toString().padStart(2, '0') : time.toString();
}
export function getUserPreference(lang: string | undefined = undefined) {
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
      language_id: lang?.toLowerCase() || 'en',
    });
    if (lang?.toLowerCase() === 'ar') {
      changeLocale('RTL', matchLocale(lang?.toLowerCase()));
    }
  }
}
export function runScriptAndRemove(scriptContent: string): void {
  const script = document.createElement('script');
  script.textContent = scriptContent;
  document.body.appendChild(script);
  document.body.removeChild(script);
}
// export function injectHTMLAndRunScript(htmlContent: string, uniqueId: string, target: 'head' | 'body' = 'body', position: 'first' | 'last' = 'last'): void {
//   const element = document.createRange().createContextualFragment(htmlContent);
//   const scripts = element.querySelectorAll('script');

//   // Assign a unique ID to each element
//   element.querySelectorAll('*').forEach((child, index) => {
//     child.id = `${uniqueId}-${index}`;
//   });

//   const destination = target === 'head' ? document.head : document.body;

//   if (scripts.length === 0) {
//     // If no script tags and the content is meant to be JavaScript, inject a script element to execute it
//     if (htmlContent.trim().startsWith('<')) {
//       // If the content looks like HTML, append it directly without creating a script
//       if (position === 'first') {
//         destination.insertBefore(element, destination.firstChild);
//       } else {
//         destination.appendChild(element);
//       }
//     } else {
//       // Create a script element to execute plain JavaScript content
//       const script = document.createElement('script');
//       script.textContent = htmlContent;
//       script.onload = function () {
//         script.remove(); // Clean up after execution
//       };
//       if (position === 'first') {
//         destination.insertBefore(script, destination.firstChild);
//       } else {
//         destination.appendChild(script);
//       }
//     }
//   } else {
//     // Handle existing script tags
//     scripts.forEach(script => {
//       const newScript = document.createElement('script');
//       newScript.textContent = script.textContent; // Only use the JavaScript code inside the script tag
//       newScript.onload = function () {
//         newScript.remove(); // Remove the script after execution
//       };
//       script.replaceWith(newScript);
//     });
//     // Inject the rest of the HTML
//     if (position === 'first') {
//       destination.insertBefore(element, destination.firstChild);
//     } else {
//       destination.appendChild(element);
//     }
//   }
// }
export function injectHTMLAndRunScript(htmlContent: string, uniqueId: string, target: 'head' | 'body' = 'body', position: 'first' | 'last' = 'last'): void {
  const element = document.createRange().createContextualFragment(htmlContent);
  const scripts = element.querySelectorAll('script');

  // Assign a unique ID to each element
  element.querySelectorAll('*').forEach((child, index) => {
    child.id = `${uniqueId}-${index}`;
  });

  const destination = target === 'head' ? document.head : document.body;

  if (scripts.length === 0) {
    // If no script tags and the content is meant to be JavaScript, inject a script element to execute it
    if (htmlContent.trim().startsWith('<')) {
      // If the content looks like HTML, append it directly without creating a script
      if (position === 'first') {
        destination.insertBefore(element, destination.firstChild);
      } else {
        destination.appendChild(element);
      }
    } else {
      // Create a script element to execute plain JavaScript content
      const script = document.createElement('script');
      script.textContent = htmlContent;
      script.onload = function () {
        script.remove(); // Clean up after execution
      };
      if (position === 'first') {
        destination.insertBefore(script, destination.firstChild);
      } else {
        destination.appendChild(script);
      }
    }
  } else {
    // Handle existing script tags
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      newScript.textContent = script.textContent; // Only use the JavaScript code inside the script tag
      newScript.onload = function () {
        newScript.remove(); // Remove the script after execution
      };
      script.replaceWith(newScript);
    });
    // Inject the rest of the HTML
    if (position === 'first') {
      destination.insertBefore(element, destination.firstChild);
    } else {
      destination.appendChild(element);
    }
  }
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
  const c = app_store.property.promotions.find(p => p.key?.toLowerCase() === coupon.trim()?.toLowerCase());
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
      agent,
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
type ModifyQueryOptions = {
  reload?: boolean; // If true, reload the page
  replaceState?: boolean; // If true, use replaceState instead of pushState
};

/**
 * Utility to modify query string parameters.
 *
 * @param param - The query parameter key to modify
 * @param value - The value to set for the query parameter. If null, the parameter will be removed.
 * @param options - Options to control whether the page should reload or replace the current history state.
 */
export function modifyQueryParam(param: string, value: string | null, options: ModifyQueryOptions = { reload: false, replaceState: false }): void {
  if (!app_store.app_data.origin || app_store.app_data.origin !== 'be') {
    return;
  }
  const url = new URL(window.location.href);

  if (!value) {
    url.searchParams.delete(param); // Remove the query parameter
  } else {
    url.searchParams.set(param, value); // Add or update the query parameter
  }

  if (options.reload) {
    // Reload the page by updating the href (replaces the full URL)
    window.location.href = url.toString();
  } else if (options.replaceState) {
    // Use replaceState to update the URL without adding a new entry in the history
    history.replaceState(null, '', url.toString());
  } else {
    // Use pushState to update the URL without reloading and add an entry in the history
    history.pushState(null, '', url.toString());
  }
}

export function calculateInfantNumber(ages: string[]) {
  return ages.reduce((prev, curr) => {
    if (curr !== '' && Number(curr) < 3) {
      return prev + 1;
    }
    return prev;
  }, 0);
}
export function generateCheckoutUrl(perma_link: string, queryString: Record<string, string> | null = null) {
  const baseUrl = `https://${perma_link}.bookingmystay.com/booked`;

  if (queryString && Object.keys(queryString).length > 0) {
    const params = new URLSearchParams(queryString);
    return `${baseUrl}?${params.toString()}`;
  }

  return baseUrl;
}
export function passedBookingCutoff(): boolean {
  const countryOffset = app_store.property.city.gmt_offset;
  const nowInOffset: Moment = moment().utcOffset(countryOffset * 60);
  const checkinRaw = booking_store.bookingAvailabilityParams.from_date;
  const checkinInOffset: Moment = moment(checkinRaw).utcOffset(countryOffset * 60);
  if (!checkinInOffset.isSame(nowInOffset, 'day')) {
    return false;
  }
  const [cutoffHourStr, cutoffMinuteStr] = app_store.property.time_constraints.booking_cutoff.split(':');
  const cutoffHour = parseInt(cutoffHourStr, 10);
  const cutoffMinute = parseInt(cutoffMinuteStr, 10);
  const cutoffToday: Moment = nowInOffset.clone().hour(cutoffHour).minute(cutoffMinute).second(0).millisecond(0);
  return nowInOffset.isSameOrAfter(cutoffToday);
}
