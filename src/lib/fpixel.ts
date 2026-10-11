export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1445895464095441';

// Event deduplication er jonno random ID generate korar function
export const generateEventId = () => {
  return new Date().getTime().toString() + Math.random().toString(36).substring(2, 9);
};

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : undefined;
};

export interface CapiUserData {
  phone?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

// Frontend theke event track korar function
export const event = async (name: string, options: Record<string, any> = {}, userData?: CapiUserData) => {
  const eventID = generateEventId();
  
  // 1. Browser e track (Facebook Pixel)
  if (typeof window !== 'undefined') {
    if ((window as any).fbq) {
      (window as any).fbq('track', name, options, { eventID: eventID });
    }
  }
  
  // 2. Server e track (Facebook CAPI)
  try {
    const fbp = getCookieValue('_fbp');
    const fbc = getCookieValue('_fbc');

    await fetch('/api/capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: name,
        eventID: eventID,
        eventData: options,
        eventUrl: typeof window !== 'undefined' ? window.location.href : '',
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
};

