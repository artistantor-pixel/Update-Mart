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

/**
 * Validates fbc strictly: fb.<subdomain_index>.<creation_time>.<fbclid>
 * Rejects modified, truncated, lowercased, or malformed values.
 */
const validateFbc = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  let val = raw.trim().replace(/^["']|["']$/g, '');
  try {
    val = decodeURIComponent(val);
  } catch {
    // ignore
  }
  const parts = val.split('.');
  if (parts.length < 4) return undefined;
  if (parts[0] !== 'fb') return undefined;
  if (!/^[0-9]+$/.test(parts[1])) return undefined;
  if (!/^[0-9]{10,14}$/.test(parts[2])) return undefined;
  const clickId = parts.slice(3).join('.');
  if (!/^[A-Za-z0-9_-]{20,250}$/.test(clickId)) return undefined;
  return `fb.${parts[1]}.${parts[2]}.${clickId}`;
};

/**
 * Validates fbp strictly: fb.<subdomain_index>.<creation_time>.<random_number>
 */
const validateFbp = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  let val = raw.trim().replace(/^["']|["']$/g, '');
  try {
    val = decodeURIComponent(val);
  } catch {
    // ignore
  }
  const parts = val.split('.');
  if (parts.length < 4) return undefined;
  if (parts[0] !== 'fb') return undefined;
  if (!/^[0-9]+$/.test(parts[1])) return undefined;
  if (!/^[0-9]{10,14}$/.test(parts[2])) return undefined;
  if (!/^[0-9]+$/.test(parts[3])) return undefined;
  return `fb.${parts[1]}.${parts[2]}.${parts[3]}`;
};

/**
 * Extracts and strictly validates raw fbclid from event source URL or referer.
 */
const extractCleanFbclid = (rawUrl?: string): string | null => {
  if (!rawUrl) return null;
  let raw: string | null = null;
  try {
    const parsedUrl = new URL(rawUrl, 'https://mart.updatekeybd.com');
    raw = parsedUrl.searchParams.get('fbclid');
  } catch {
    // URL parse fallback
  }
  if (!raw) {
    const match = rawUrl.match(/[?&]fbclid=([A-Za-z0-9_-]+)/);
    if (match) raw = match[1];
  }
  if (!raw) return null;

  let cleaned = raw.trim().replace(/^["']|["']$/g, '');
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    // ignore
  }
  cleaned = cleaned.replace(/[/?#].*$/, '');

  if (/^[A-Za-z0-9_-]{20,250}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
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

    // Fallback extraction of cookies from HTTP request headers
    const cookieHeader = req.headers.get('cookie') || '';
    const getCookie = (cname: string): string | undefined => {
      const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + cname + '=([^;]*)'));
      if (!match) return undefined;
      let val = match[1].trim().replace(/^["']|["']$/g, '');
      try {
        val = decodeURIComponent(val);
      } catch {
        // ignore
      }
      return val;
    };

    // Extract & validate fbclid from event source URL or Referer
    const eventSourceUrl = eventUrl || req.headers.get('referer') || '';
    const urlFbclid = extractCleanFbclid(eventSourceUrl);

    // Initial fbc candidate from payload or incoming cookie
    let resolvedFbc: string | undefined = validateFbc(userData.fbc) || validateFbc(getCookie('_fbc'));

    // Rule 1: If event_source_url contains a valid fbclid, fbc MUST match this exact fbclid (case-sensitive)
    if (urlFbclid) {
      if (resolvedFbc) {
        const parts = resolvedFbc.split('.');
        const clickIdFromFbc = parts.slice(3).join('.');
        if (clickIdFromFbc !== urlFbclid) {
          // Stale or mismatched cookie! Replace with current URL fbclid to prevent Meta warning
          resolvedFbc = `fb.1.${Date.now()}.${urlFbclid}`;
        }
      } else {
        // Construct compliant fbc from valid urlFbclid
        resolvedFbc = `fb.1.${Date.now()}.${urlFbclid}`;
      }
    }

    // Final strict format check: fb.<subdomain_index>.<timestamp>.<fbclid>
    // NEVER send a truncated or corrupted fbclid
    resolvedFbc = validateFbc(resolvedFbc);

    // Rule 2: Strictly validate fbp format: fb.<subdomain_index>.<timestamp>.<random_number>
    let resolvedFbp: string | undefined = validateFbp(userData.fbp) || validateFbp(getCookie('_fbp'));

    // Clean event_source_url to ensure Meta receives clean matching URLs
    let cleanEventSourceUrl = eventSourceUrl;
    if (cleanEventSourceUrl && cleanEventSourceUrl.includes('fbclid=')) {
      try {
        const parsed = new URL(cleanEventSourceUrl, 'https://mart.updatekeybd.com');
        if (urlFbclid) {
          parsed.searchParams.set('fbclid', urlFbclid);
        } else {
          // Remove truncated or invalid fbclid parameter
          parsed.searchParams.delete('fbclid');
        }
        cleanEventSourceUrl = parsed.toString();
      } catch {
        // ignore
      }
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
          event_source_url: cleanEventSourceUrl,
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

