import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderNotificationEmail, OrderEmailData } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderData, recipientEmail, isTest } = body;

    // 1. Fetch current email settings from database
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('id', 'general_settings')
      .single();

    const settings = settingsData?.value || {};
    const isOrderEmailEnabled = settings.isOrderEmailEnabled === true;
    const adminNotificationEmail = recipientEmail || settings.adminNotificationEmail || '';

    // 2. Handle Test Email Trigger from Admin Panel
    if (isTest) {
      if (!adminNotificationEmail) {
        return NextResponse.json(
          { error: 'Please enter a valid notification email address first.' },
          { status: 400 }
        );
      }

      const sampleOrder: OrderEmailData = {
        id: `TEST-${Date.now().toString().slice(-6)}`,
        customerName: 'Habibur Rahman (Test)',
        customerPhone: '01711000000',
        customerEmail: 'customer@example.com',
        address: 'House 12, Road 4, Sector 7, Uttara',
        district: 'Dhaka',
        thana: 'Uttara',
        total: 1350,
        deliveryCharge: 60,
        discountAmount: 100,
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        orderNote: 'This is a test order notification sent from your Admin Dashboard.',
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 'sample-1',
            name: 'Premium Wireless Earbuds Pro',
            variant: 'Matte Black',
            quantity: 1,
            price: 1390
          }
        ]
      };

      const result = await sendOrderNotificationEmail({
        to: adminNotificationEmail,
        order: sampleOrder,
        isTest: true
      });

      if (!result.success) {
        return NextResponse.json(
          { 
            error: result.error || 'Failed to send test email', 
            provider: result.provider 
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${adminNotificationEmail}!`,
        provider: result.provider,
        messageId: result.messageId
      });
    }

    // 3. For live orders, verify settings
    if (!isOrderEmailEnabled) {
      return NextResponse.json({
        success: false,
        skipped: true,
        message: 'Order email notification is disabled in store settings.'
      });
    }

    if (!adminNotificationEmail) {
      return NextResponse.json({
        success: false,
        skipped: true,
        message: 'No admin notification email is configured in store settings.'
      });
    }

    if (!orderData || !orderData.id) {
      return NextResponse.json(
        { error: 'Order data is missing or invalid' },
        { status: 400 }
      );
    }

    // 4. Send email notification for the order
    const result = await sendOrderNotificationEmail({
      to: adminNotificationEmail,
      order: orderData,
      isTest: false
    });

    if (!result.success) {
      console.error('[Order Email Notification] Error sending notification:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error, 
          provider: result.provider 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      messageId: result.messageId
    });

  } catch (error: any) {
    console.error('[Order Email Notification API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while processing email notification' },
      { status: 500 }
    );
  }
}
