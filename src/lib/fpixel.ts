export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1445895464095441';

// Event deduplication ID generator
export const generateEventId = () => {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Extract raw cookie value without modifying case or character integrity
const getRawCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? match[1] : undefined;
};

/**
 * Resolves Meta CAPI compliant fbc parameter.
 * Meta Rule: "Do not modify the fbclid value retrieved from _fbc cookie or fbclid query parameter in the page URL when sending the fbc parameter."
 * Format: fb.<subdomain_index>.<creation_time>.<fbclid>
 */
export const resolveFbc = (currentUrl?: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  let urlFbclid: string | null = null;
  try {
    const url = currentUrl || window.location.href;
    const parsed = new URL(url, window.location.origin);
    urlFbclid = parsed.searchParams.get('fbclid');
  } catch {
    // URL parse fallback
    const match = (currentUrl || window.location.search).match(/[?&]fbclid=([^&#]+)/);
    if (match) urlFbclid = match[1];
  }

  const existingCookieFbc = getRawCookie('_fbc');

  // Case 1: Page URL contains fbclid query parameter
  if (urlFbclid) {
    if (existingCookieFbc) {
      const parts = existingCookieFbc.split('.');
      const cookieFbclid = parts.slice(3).join('.');
      // If cookie already has this EXACT fbclid, preserve original creation timestamp
      if (cookieFbclid === urlFbclid && /^fb\.[0-9]+\.[0-9]+\..+$/.test(existingCookieFbc)) {
        return existingCookieFbc;
      }
    }

    // Otherwise, generate compliant fbc parameter using the exact raw fbclid
    const creationTime = Date.now();
    const freshFbc = `fb.1.${creationTime}.${urlFbclid}`;

    try {
      // Store in first-party cookie for subsequent pages (90 days)
      const domain = window.location.hostname.replace(/^www\./, '');
      const domainAttr = domain && domain !== 'localhost' ? `; domain=.${domain}` : '';
      document.cookie = `_fbc=${freshFbc}; path=/; max-age=7776000; SameSite=Lax${domainAttr}`;
      
      // Also save to sessionStorage/localStorage as backup for multi-page checkout
      sessionStorage.setItem('meta_fbc', freshFbc);
      localStorage.setItem('meta_fbc', freshFbc);
    } catch {
      // Storage access fallback
    }

    return freshFbc;
  }

  // Case 2: Page URL does not have fbclid, check existing cookie
  if (existingCookieFbc && /^fb\.[0-9]+\.[0-9]+\..+$/.test(existingCookieFbc)) {
    return existingCookieFbc;
  }

  // Case 3: Check storage backup if cookie was lost during checkout navigation
  try {
    const storedFbc = sessionStorage.getItem('meta_fbc') || localStorage.getItem('meta_fbc');
    if (storedFbc && /^fb\.[0-9]+\.[0-9]+\..+$/.test(storedFbc)) {
      return storedFbc;
    }
  } catch {
    // Storage access fallback
  }

  return undefined;
};

/**
 * Resolves Meta CAPI compliant fbp parameter.
 * Format: fb.<subdomain_index>.<creation_time>.<random_number>
 */
export const resolveFbp = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  const fbp = getRawCookie('_fbp');
  if (fbp && /^fb\.[0-9]+\.[0-9]+\..+$/.test(fbp)) {
    return fbp;
  }
  return undefined;
};

export interface CapiUserData {
  phone?: string;
  email?: string;
  name?: string;
  fbc?: string;
  fbp?: string;
  [key: string]: any;
}

// Sanitize options to conform strictly to Meta Pixel & CAPI specs
export const sanitizeEventOptions = (name: string, options: Record<string, any> = {}): Record<string, any> => {
  const clean: Record<string, any> = { ...options };

  // Format value strictly as a positive float/number (Meta rejects NaN, string with symbols, etc.)
  if (clean.value !== undefined || name === 'Purchase') {
    let numVal = typeof clean.value === 'number'
      ? clean.value
      : parseFloat(String(clean.value ?? '').replace(/[^0-9.]/g, ''));
    if (isNaN(numVal) || !isFinite(numVal) || numVal < 0) {
      numVal = 0;
    }
    // Meta requires valid decimal number format (e.g. 1250 or 1250.00)
    clean.value = Number(numVal.toFixed(2));
  }

  // Ensure currency is 3-letter uppercase ISO code
  if (clean.currency || name === 'Purchase') {
    clean.currency = clean.currency ? String(clean.currency).trim().toUpperCase() : 'BDT';
  }

  // Ensure content_ids is an array of strings
  if (Array.isArray(clean.content_ids)) {
    clean.content_ids = clean.content_ids.map(id => String(id));
  }

  // Provide contents array if content_ids exists but contents is omitted
  if (clean.content_ids && !clean.contents && Array.isArray(clean.content_ids)) {
    clean.contents = clean.content_ids.map(id => ({
      id: String(id),
      quantity: 1,
      item_price: clean.value,
    }));
  }

  if (clean.content_type === undefined && (name === 'Purchase' || name === 'ViewContent' || name === 'AddToCart' || name === 'InitiateCheckout')) {
    clean.content_type = 'product';
  }

  return clean;
};

// Frontend track function with Pixel + CAPI and deduplication eventID
export const event = async (
  name: string,
  options: Record<string, any> = {},
  userData?: CapiUserData,
  customEventId?: string,
  customUrl?: string
) => {
  const eventID = customEventId || generateEventId();
  const cleanOptions = sanitizeEventOptions(name, options);

  // 1. Browser Pixel Track
  if (typeof window !== 'undefined') {
    if ((window as any).fbq) {
      (window as any).fbq('track', name, cleanOptions, { eventID });
    }
  }

  // 2. Server CAPI Track
  try {
    const eventUrl = customUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const fbp = userData?.fbp || resolveFbp();
    const fbc = userData?.fbc || resolveFbc(eventUrl);

    await fetch('/api/capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: name,
        eventID: eventID,
        eventData: cleanOptions,
        eventUrl: eventUrl,
        userData: {
          ...userData,
          fbp: fbp || undefined,
          fbc: fbc || undefined,
        },
      }),
    });
  } catch (error) {
    console.error('CAPI Request Error:', error);
  }

  return { eventID };
};

// PageView tracker that sends both Pixel & CAPI with matching deduplication key
export const pageview = (url?: string) => {
  return event('PageView', {}, undefined, undefined, url);
};
