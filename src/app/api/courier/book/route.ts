import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note } = body;

    // Validate required fields
    if (!invoice || !recipient_name || !recipient_phone || !recipient_address || cod_amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.PACKZY_API_KEY;
    const secretKey = process.env.PACKZY_SECRET_KEY;

    // If keys are not configured, we return a mock success or error.
    if (!apiKey || !secretKey) {
      console.warn("Packzy API keys are not configured. Bypassing courier booking.");
      return NextResponse.json({ 
        message: 'Courier bypassed (keys missing)', 
        consignment_id: null,
        tracking_code: null
      }, { status: 200 });
    }

    // Call Packzy API
    const response = await fetch('https://portal.packzy.com/api/v1/create_order', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice,
        recipient_name,
        recipient_phone,
        recipient_address,
        cod_amount,
        note: note || '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Packzy API Error:", data);
      return NextResponse.json({ error: 'Failed to book parcel', details: data }, { status: response.status });
    }

    // Successful booking
    return NextResponse.json({
      message: 'Parcel booked successfully',
      consignment_id: data.consignment?.consignment_id || data.consignment_id,
      tracking_code: data.consignment?.tracking_code || data.tracking_code,
      raw_data: data
    }, { status: 200 });

  } catch (error) {
    console.error("Internal Server Error in Courier Booking:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
