import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Check Rate Limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    // Allow max 3 requests per 10 minutes (600,000 ms)
    const limitResult = rateLimit(ip, 3, 10 * 60 * 1000);
    
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limitResult.limit.toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': limitResult.reset.toString(),
          }
        }
      );
    }

    const orderData = await request.json();

    if (!orderData || !orderData.id) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    // 2. Insert into Supabase (will use anon key, but RLS allows INSERT)
    // Map frontend order model to db model
    const dbOrder = {
      id: orderData.id,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      customer_avatar: orderData.customerAvatar,
      address: orderData.address,
      district: orderData.district,
      thana: orderData.thana,
      status: orderData.status,
      total: orderData.total,
      discount_amount: orderData.discountAmount || 0,
      promo_code: orderData.promoCode,
      delivery_charge: orderData.deliveryCharge || 0,
      advance_payment: orderData.advancePayment || 0,
      payment_method: orderData.paymentMethod,
      payment_status: orderData.paymentStatus,
      created_at: orderData.createdAt,
      items: orderData.items,
      timeline: orderData.timeline,
      order_note: orderData.orderNote
    };

    const { error } = await supabase.from('orders').insert([dbOrder]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
