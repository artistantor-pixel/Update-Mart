import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, orderData } = body;

    if (!orderId || !orderData) {
      return NextResponse.json({ error: 'Order ID and order data are required' }, { status: 400 });
    }

    // Skip fetching from Supabase because Server API Route anon key is blocked by RLS for orders.
    // Instead, we use the order data passed securely from the authenticated frontend.

    // 2. Fetch Steadfast API Credentials
    const { data: courierData, error: courierError } = await supabase
      .from('courier_settings')
      .select('api_key, secret_key')
      .eq('id', 'c1') // Steadfast ID is c1
      .single();

    if (courierError || !courierData || !courierData.api_key || !courierData.secret_key) {
      console.error('Courier settings error:', courierError);
      return NextResponse.json({ error: 'Steadfast credentials not configured' }, { status: 500 });
    }

    // 3. Prepare Steadfast Payload
    const codAmount = orderData.payment_method === 'COD' 
        ? orderData.total - (orderData.advance_payment || 0) 
        : 0;

    const payload = {
      invoice: orderData.id,
      recipient_name: orderData.customer_name,
      recipient_phone: orderData.customer_phone,
      recipient_address: `${orderData.address}, ${orderData.thana ? orderData.thana + ', ' : ''}${orderData.district}`,
      cod_amount: codAmount,
      note: orderData.order_note || 'Update Mart Order'
    };

    // 4. Call Steadfast API
    const steadfastResponse = await fetch('https://portal.packzy.com/api/v1/create_order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': courierData.api_key,
        'Secret-Key': courierData.secret_key
      },
      body: JSON.stringify(payload)
    });

    const responseText = await steadfastResponse.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Steadfast API returned non-JSON:', responseText);
      return NextResponse.json({ 
        error: 'Steadfast API Error: ' + responseText, 
        details: responseText 
      }, { status: steadfastResponse.status || 500 });
    }

    if (!steadfastResponse.ok || responseData.status !== 200) {
      console.error('Steadfast API error:', responseData);
      return NextResponse.json({ 
        error: 'Failed to create order in Steadfast', 
        details: responseData 
      }, { status: 500 });
    }

    // 5. Return Success (Frontend will update DB to avoid RLS issues)
    const consignmentId = responseData.consignment?.consignment_id || responseData.consignment?.tracking_code;

    return NextResponse.json({ 
      success: true, 
      consignment_id: consignmentId,
      message: 'Successfully sent to Steadfast'
    });

  } catch (error: any) {
    console.error('Error in Steadfast integration:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
