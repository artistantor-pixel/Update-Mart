import { NextResponse } from 'next/server';
import crypto from 'crypto';

const rawPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const PIXEL_ID = (rawPixelId && rawPixelId.length >= 15 && rawPixelId !== '123456789012345') ? rawPixelId : '1445895464095441';
const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN;

// Helper function to hash values using SHA256 according to Meta standard
const hashValue = (val?: string | null): string | undefined => {
  if (!val) return undefined;
  const cleaned = val.trim().toLowerCase();
  if (!cleaned) return undefined;
  return crypto.createHash('sha256').update(cleaned).digest('hex');
};

// Format Bangladesh phone numbers to E.164 without '+' or leading 0, with country code (880...)
const hashPhone = (phone?: string | null): string | undefined => {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('01')) {
    digits = '88' + digits;
  } else if (digits.startsWith('880')) {
    // already has country code
  }
  return crypto.createHash('sha256').update(digits).digest('hex');
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventID, eventData, eventUrl, userData = {} } = body;

    if (!ACCESS_TOKEN) {
      console.warn('FB_CAPI_ACCESS_TOKEN is missing in environment variables.');
      return NextResponse.json({ success: false, message: 'Missing Access Token' });
    }

    // Extract client IP address properly
    const forwardedHeader = req.headers.get('x-forwarded-for');
    const clientIp = forwardedHeader ? forwardedHeader.split(',')[0].trim() : (req.headers.get('x-real-ip') || undefined);
    const userAgent = req.headers.get('user-agent') || undefined;

    // Fallback extraction of _fbp and _fbc from HTTP request cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const getCookie = (cname: string): string | undefined => {
      const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + cname + '=([^;]*)'));
      return match ? match[1] : undefined;
    };

    // Extract raw fbclid from event source URL or Referer
    const eventSourceUrl = eventUrl || req.headers.get('referer') || '';
    let urlFbclid: string | null = null;
    try {
      if (eventSourceUrl) {
        const parsedUrl = new URL(eventSourceUrl, 'https://mart.updatekeybd.com');
        urlFbclid = parsedUrl.searchParams.get('fbclid');
      }
    } catch {
      const match = eventSourceUrl.match(/[?&]fbclid=([^&#]+)/);
      if (match) urlFbclid = match[1];
    }

    let resolvedFbc: string | undefined = userData.fbc || getCookie('_fbc');

    // Rule 1: If event_source_url contains fbclid, fbc MUST match this exact fbclid (case-sensitive)
    if (urlFbclid) {
      if (resolvedFbc) {
        const parts = resolvedFbc.split('.');
        const clickIdFromFbc = parts.slice(3).join('.');
        if (clickIdFromFbc !== urlFbclid) {
          // Stale or mismatched cookie! Replace with current URL fbclid to prevent Meta warning
          resolvedFbc = `fb.1.${Date.now()}.${urlFbclid}`;
        }
      } else {
        // Construct compliant fbc from urlFbclid
        resolvedFbc = `fb.1.${Date.now()}.${urlFbclid}`;
      }
    }

    // Rule 2: Strictly validate fbc format: fb.<subdomain_index>.<timestamp>.<fbclid>
    if (resolvedFbc) {
      if (!/^fb\.[0-9]+\.[0-9]+\..+$/.test(resolvedFbc)) {
        if (!resolvedFbc.startsWith('fb.') && resolvedFbc.length > 10) {
          resolvedFbc = `fb.1.${Date.now()}.${resolvedFbc}`;
        } else {
          resolvedFbc = undefined;
        }
      }
    }

    // Rule 3: Strictly validate fbp format: fb.<subdomain_index>.<timestamp>.<random_number>
    let resolvedFbp: string | undefined = userData.fbp || getCookie('_fbp');
    if (resolvedFbp && !/^fb\.[0-9]+\.[0-9]+\..+$/.test(resolvedFbp)) {
      resolvedFbp = undefined;
    }

    // Build Meta CAPI compliant user_data object
    const metaUserData: Record<string, any> = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    if (resolvedFbp) {
      metaUserData.fbp = resolvedFbp;
    }
    if (resolvedFbc) {
      metaUserData.fbc = resolvedFbc;
    }
    if (userData.phone) {
      metaUserData.ph = hashPhone(userData.phone);
    }
    if (userData.email) {
      metaUserData.em = hashValue(userData.email);
    }
    if (userData.name) {
      metaUserData.fn = hashValue(userData.name);
    }

    // Sanitize custom_data strictly according to Meta specifications
    const cleanCustomData: Record<string, any> = { ...(eventData || {}) };

    if (cleanCustomData.value !== undefined || eventName === 'Purchase') {
      let numVal = typeof cleanCustomData.value === 'number'
        ? cleanCustomData.value
        : parseFloat(String(cleanCustomData.value ?? '').replace(/[^0-9.]/g, ''));
      if (isNaN(numVal) || !isFinite(numVal) || numVal < 0) {
        numVal = 0;
      }
      cleanCustomData.value = Number(numVal.toFixed(2));
    }

    if (cleanCustomData.currency || eventName === 'Purchase') {
      cleanCustomData.currency = cleanCustomData.currency ? String(cleanCustomData.currency).trim().toUpperCase() : 'BDT';
    }

    if (Array.isArray(cleanCustomData.content_ids)) {
      cleanCustomData.content_ids = cleanCustomData.content_ids.map((id: any) => String(id));
    }

    if (cleanCustomData.content_ids && !cleanCustomData.contents && Array.isArray(cleanCustomData.content_ids)) {
      cleanCustomData.contents = cleanCustomData.content_ids.map((id: any) => ({
        id: String(id),
        quantity: 1,
        item_price: cleanCustomData.value,
      }));
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: eventID,
          event_source_url: eventUrl || req.headers.get('referer') || '',
          user_data: metaUserData,
          custom_data: cleanCustomData,
        },
      ],
    };

    // Facebook Graph API te data pathano
    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const fbData = await response.json();

    if (!response.ok) {
      console.error('FB CAPI Error Response:', fbData);
    }

    return NextResponse.json({ success: response.ok, fbData });
  } catch (error) {
    console.error('CAPI Server Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

