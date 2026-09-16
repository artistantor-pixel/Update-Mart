import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Fetch Order Details from Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      console.error('Order fetch error:', orderError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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
    const steadfastResponse = await fetch('https://api.steadfast.com.bd/v1/create_order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': courierData.api_key,
        'Secret-Key': courierData.secret_key
      },
      body: JSON.stringify(payload)
    });

    const responseData = await steadfastResponse.json();

    if (!steadfastResponse.ok || responseData.status !== 200) {
      console.error('Steadfast API error:', responseData);
      return NextResponse.json({ 
        error: 'Failed to create order in Steadfast', 
        details: responseData 
      }, { status: 500 });
    }

    // 5. Update Order in Supabase with Consignment ID and Status
    const consignmentId = responseData.consignment?.consignment_id || responseData.consignment?.tracking_code;
    
    // Create timeline event
    const timelineEvent = {
        id: `t-${Date.now()}`,
        status: 'Shipped',
        timestamp: new Date().toISOString(),
        note: `Sent to Steadfast (Tracking: ${consignmentId})`
    };

    const newTimeline = [timelineEvent, ...(orderData.timeline || [])];

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'Shipped',
        consignment_id: consignmentId,
        courier_status: 'pending',
        timeline: newTimeline
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to save consignment ID to DB:', updateError);
      // We don't fail the request here since the courier order was successful, but we should log it
    }

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
