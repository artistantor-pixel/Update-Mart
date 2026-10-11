import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1445895464095441';
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

    // Build Meta CAPI compliant user_data object
    const metaUserData: Record<string, any> = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    if (userData.fbp) {
      metaUserData.fbp = userData.fbp;
    }
    if (userData.fbc) {
      metaUserData.fbc = userData.fbc;
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

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: eventID,
          event_source_url: eventUrl,
          user_data: metaUserData,
          custom_data: eventData || {},
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

