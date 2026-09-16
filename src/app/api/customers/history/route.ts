import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Fetch all orders for this phone number
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total, created_at')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer history:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ 
        totalOrders: 0,
        delivered: 0,
        returned: 0,
        successRate: 0,
        totalSpent: 0
      });
    }

    const totalOrders = orders.length;
    let delivered = 0;
    let returned = 0;
    let totalSpent = 0;

    orders.forEach(order => {
      if (order.status === 'Delivered') {
        delivered++;
        totalSpent += (order.total || 0);
      } else if (order.status === 'Return' || order.status === 'Reject Order') {
        returned++;
      }
    });

    // Calculate success rate based on resolved orders (Delivered + Returned).
    // Or just (Delivered / Total) as a strict metric. We'll use (Delivered / (Delivered + Returned)) if they have any, otherwise 0.
    const resolvedOrders = delivered + returned;
    let successRate = 0;
    
    if (resolvedOrders > 0) {
      successRate = Math.round((delivered / resolvedOrders) * 100);
    } else {
      // If they have orders but none are delivered or returned yet (e.g. all are New/Processing)
      // We don't have a reliable success rate yet.
      successRate = 100; // Give them benefit of the doubt
    }

    return NextResponse.json({
      totalOrders,
      delivered,
      returned,
      successRate,
      totalSpent,
      lastOrderDate: orders[0]?.created_at
    });
  } catch (error: any) {
    console.error('Error in customer history route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
