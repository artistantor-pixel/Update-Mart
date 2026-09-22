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

// Frontend theke event track korar function
export const event = async (name: string, options = {}) => {
  const eventID = generateEventId();
  
  // 1. Browser e track (Facebook Pixel)
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options, { eventID: eventID });
  }
  
  // 2. Server e track (Facebook CAPI)
  try {
    await fetch('/api/capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: name,
        eventID: eventID,
        eventData: options,
        eventUrl: window.location.href,
      }),
    });
  } catch (error) {
    console.error('CAPI Request Error:', error);
  }
};
