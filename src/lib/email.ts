// Order Email Notification Service
// Supports Resend API (native fetch, zero dependencies) and Nodemailer (SMTP)

export interface OrderItemEmailData {
  id?: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
}

export interface OrderEmailData {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address?: string;
  district?: string;
  thana?: string;
  total: number;
  deliveryCharge?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderNote?: string;
  items?: OrderItemEmailData[];
  createdAt?: string;
}

/**
 * Generate a modern, mobile-friendly HTML email template for order notification.
 */
export function generateOrderEmailHtml(order: OrderEmailData): string {
  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const discount = Number(order.discountAmount || 0);
  const grandTotal = Number(order.total || (subtotal + deliveryCharge - discount));

  const itemsRows = items.length > 0 ? items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 1 ? 'background-color: #fafafa;' : ''}">
      <td style="padding: 12px 14px; font-size: 14px; color: #1e293b; font-weight: 500;">
        ${escapeHtml(item.name || 'Product')}
        ${item.variant ? `<br/><span style="font-size: 12px; color: #64748b; font-weight: 400;">Variant: ${escapeHtml(item.variant)}</span>` : ''}
      </td>
      <td style="padding: 12px 14px; font-size: 14px; color: #475569; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px 14px; font-size: 14px; color: #475569; text-align: right;">৳${Number(item.price || 0).toLocaleString()}</td>
      <td style="padding: 12px 14px; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">
        ৳${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
      </td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="4" style="padding: 14px; text-align: center; color: #64748b; font-size: 14px;">No items listed</td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order #${escapeHtml(order.id)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; padding: 6px 14px; background: rgba(255, 255, 255, 0.12); border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
        New Order Alert
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Update Mart</h1>
      <p style="margin: 8px 0 0; font-size: 14px; color: #94a3b8;">You received a new order from your store</p>
    </div>

    <!-- Order Summary Badge -->
    <div style="padding: 24px 28px 12px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Order ID</span>
            <div style="font-size: 18px; font-weight: 700; color: #0f172a;">#${escapeHtml(order.id)}</div>
          </td>
          <td style="text-align: right;">
            <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Date</span>
            <div style="font-size: 13px; font-weight: 500; color: #334155;">${formattedDate}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px;">
      
      <!-- Customer Information Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 700;">Customer Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 120px; font-weight: 500;">Customer Name:</td>
            <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${escapeHtml(order.customerName || 'N/A')}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Phone:</td>
            <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">
              ${order.customerPhone ? `<a href="tel:${escapeHtml(order.customerPhone)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(order.customerPhone)}</a>` : 'N/A'}
            </td>
          </tr>
          ${order.customerEmail ? `
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Email:</td>
            <td style="padding: 4px 0; color: #0f172a;">${escapeHtml(order.customerEmail)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500; vertical-align: top;">Delivery Address:</td>
            <td style="padding: 4px 0; color: #0f172a;">
              ${escapeHtml(order.address || 'N/A')}
              ${order.thana || order.district ? `<br/><span style="color: #64748b; font-size: 13px;">${[order.thana, order.district].filter(Boolean).map(escapeHtml).join(', ')}</span>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Payment Method:</td>
            <td style="padding: 4px 0; color: #0f172a;">
              <span style="display: inline-block; padding: 2px 8px; background-color: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 12px; font-weight: 600;">
                ${escapeHtml(order.paymentMethod || 'COD')} (${escapeHtml(order.paymentStatus || 'Pending')})
              </span>
            </td>
          </tr>
          ${order.orderNote ? `
          <tr>
            <td style="padding: 4px 0; color: #64748b; font-weight: 500; vertical-align: top;">Order Note:</td>
            <td style="padding: 4px 0; color: #854d0e; font-style: italic;">${escapeHtml(order.orderNote)}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- Items Table -->
      <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 700;">Order Items</h3>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left;">
            <th style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Item</th>
            <th style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; text-align: center;">Qty</th>
            <th style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; text-align: right;">Price</th>
            <th style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Financial Calculation Summary -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px; font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Subtotal:</td>
          <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: 500;">৳${subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Delivery Fee:</td>
          <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: 500;">৳${deliveryCharge.toLocaleString()}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
          <td style="padding: 4px 0; color: #16a34a;">Discount:</td>
          <td style="padding: 4px 0; text-align: right; color: #16a34a; font-weight: 500;">-৳${discount.toLocaleString()}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 1px solid #e2e8f0;">
          <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #0f172a;">Total Payable:</td>
          <td style="padding: 12px 0 0; text-align: right; font-size: 20px; font-weight: 700; color: #2563eb;">৳${grandTotal.toLocaleString()}</td>
        </tr>
      </table>

      <!-- Admin Dashboard CTA -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXTAUTH_URL || 'https://mart.updatekeybd.com'}/admin" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
          Open Admin Dashboard
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p style="margin: 0 0 6px;">Update Mart Automated Notification System</p>
      <p style="margin: 0;">You can manage or disable these alerts in your Admin Settings panel.</p>
    </div>

  </div>
</body>
</html>
  `;
}

function escapeHtml(text?: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Dispatch an order email notification via Resend (HTTP) or Nodemailer (SMTP).
 */
export async function sendOrderNotificationEmail({
  to,
  order,
  isTest = false
}: {
  to: string;
  order: OrderEmailData;
  isTest?: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string; provider?: string }> {
  if (!to || !to.includes('@')) {
    return { success: false, error: 'Recipient email address is invalid or not configured.' };
  }

  const subject = isTest
    ? `[TEST] Update Mart Order Email Test Notification`
    : `🛍️ New Order #${order.id} - ৳${Number(order.total || 0).toLocaleString()} from ${order.customerName || 'Customer'}`;

  const html = generateOrderEmailHtml(order);

  // 1. Try Resend API if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'Update Mart <orders@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: html
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Resend API error');
      }

      return { success: true, messageId: data.id, provider: 'resend' };
    } catch (err: any) {
      console.error('[Email] Resend delivery failed:', err.message);
      // Fall through to nodemailer if also configured
    }
  }

  // 2. Try Nodemailer SMTP if SMTP environment variables are configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;
  const fromAddress = process.env.SMTP_FROM || `"Update Mart" <${smtpUser || 'notification@updatemart.com'}>`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      // Dynamic import to prevent crash if nodemailer is optional
      // @ts-ignore
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: to,
        subject: subject,
        html: html
      });

      return { success: true, messageId: info.messageId, provider: 'nodemailer' };
    } catch (err: any) {
      console.error('[Email] Nodemailer delivery failed:', err.message);
      return { success: false, error: err.message, provider: 'nodemailer' };
    }
  }

  // 3. Fallback: Neither Resend nor SMTP credentials found
  console.warn(
    '[Email] No email provider configured! Please set either RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS in .env.local.'
  );
  return {
    success: false,
    error: 'Email provider not configured. Please add SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) or RESEND_API_KEY to your environment variables.',
    provider: 'none'
  };
}
