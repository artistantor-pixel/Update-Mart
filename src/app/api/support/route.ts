import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Check Rate Limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    // Allow max 3 support requests per 10 minutes (600,000 ms)
    const limitResult = rateLimit(`support_${ip}`, 3, 10 * 60 * 1000);
    
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

    const ticketData = await request.json();

    if (!ticketData || !ticketData.customer_name || !ticketData.customer_phone) {
      return NextResponse.json({ error: 'Invalid ticket data' }, { status: 400 });
    }

    const { error } = await supabase.from('support_tickets').insert([ticketData]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: 'Failed to save ticket' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
