import { NextResponse } from 'next/server';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1445895464095441';
const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventID, eventData, eventUrl } = body;

    if (!ACCESS_TOKEN) {
      console.warn('FB_CAPI_ACCESS_TOKEN is missing in environment variables.');
      // Return 200 anyway so we don't block the frontend, but log the warning
      return NextResponse.json({ success: false, message: 'Missing Access Token' });
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: eventID,
          event_source_url: eventUrl,
          user_data: {
            client_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
            client_user_agent: req.headers.get('user-agent') || undefined,
          },
          custom_data: eventData || {},
        },
      ],
      // test_event_code: process.env.FB_TEST_EVENT_CODE // Testing-er jonno uncomment korte paren
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
