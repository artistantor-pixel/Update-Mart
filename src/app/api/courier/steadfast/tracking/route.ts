import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, consignmentId, courierStatus } = body;

    if (!orderId || !consignmentId) {
      return NextResponse.json({ error: 'Order ID and Consignment ID are required' }, { status: 400 });
    }

    // 1. Fetch Steadfast API Credentials
    const { data: courierData, error: courierError } = await supabase
      .from('courier_settings')
      .select('api_key, secret_key')
      .eq('id', 'c1')
      .single();

    if (courierError || !courierData || !courierData.api_key || !courierData.secret_key) {
      return NextResponse.json({ error: 'Steadfast credentials not configured' }, { status: 500 });
    }

    // 2. Fetch live tracking from Steadfast
    const steadfastResponse = await fetch(`https://portal.packzy.com/api/v1/status_by_cid/${consignmentId}`, {
      method: 'GET',
      headers: {
        'Api-Key': courierData.api_key,
        'Secret-Key': courierData.secret_key
      }
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
      console.error('Steadfast tracking error:', responseData);
      return NextResponse.json({ 
        error: 'Failed to fetch tracking from Steadfast',
        details: responseData 
      }, { status: 500 });
    }

    // Steadfast typically returns the status string, like 'delivered', 'pending', 'in_transit'
    const deliveryStatus = responseData.delivery_status || 'Unknown';
    
    // Check if status changed
    const isNewStatus = courierStatus !== deliveryStatus;

    return NextResponse.json({ 
      success: true, 
      status: deliveryStatus,
      isNewStatus
    });

  } catch (error: any) {
    console.error('Error in tracking sync:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
