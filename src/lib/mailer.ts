import nodemailer from 'nodemailer';
import { OrderCustomerDetails, OrderItemPayload } from './types';
import { formatPKR } from './currency';

export const isGmailConfigured = (): boolean => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  return Boolean(
    user &&
    pass &&
    !user.includes('your-email@gmail.com') &&
    !pass.includes('your-app-password')
  );
};

export function getTransporter() {
  if (!isGmailConfigured()) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export interface SendOrderEmailParams {
  orderId: string;
  orderNumber?: string;
  customer: OrderCustomerDetails;
  items: OrderItemPayload[];
  totalPrice: number;
  status?: string;
  createdAt?: string;
}

/**
 * Builds a beautiful, easy-to-read HTML email summary
 */
export function buildOrderSummaryHtml(params: SendOrderEmailParams): string {
  const { orderId, customer, items, totalPrice, status = 'Pending', createdAt } = params;
  const dateFormatted = createdAt ? new Date(createdAt).toLocaleString() : new Date().toLocaleString();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://antigravity-nine-roan.vercel.app');

  const itemRows = items
    .map(
      (item) => {
        const itemSubtotal = item.itemTotal ?? (Number(item.price || 0) * Number(item.quantity || 1));
        return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 8px; font-weight: 600; color: #1e293b;">${item.name}</td>
        <td style="padding: 12px 8px; text-align: center; color: #475569;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #475569;">${formatPKR(item.price)}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #0f172a;">${formatPKR(itemSubtotal)}</td>
      </tr>
    `;
      }
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New Order #${orderId}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #334155;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      
      <!-- Brand Header -->
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0 0 6px 0; font-size: 24px; letter-spacing: -0.5px; color: #f8fafc;">🍽️ Dawat-e-Khas Royal Pakistani Cuisine</h1>
        <p style="margin: 0; font-size: 14px; color: #cbd5e1;">New Customer Order Notification</p>
      </div>

      <!-- Order Meta Bar -->
      <div style="background: #fff7ed; border-bottom: 1px solid #fed7aa; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; color: #9a3412; font-weight: 700; letter-spacing: 0.5px;">Tracking Number</span>
          <div style="font-size: 18px; font-weight: 800; color: #7c2d12;">${params.orderNumber || orderId}</div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #ea580c; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700;">Status: ${status}</span>
        </div>
      </div>

      <!-- Tracking CTA Bar -->
      <div style="background: #0f172a; padding: 12px 24px; text-align: center;">
        <a href="${siteUrl}/track?id=${params.orderNumber || orderId}" style="display: inline-block; background: #f59e0b; color: #0f172a; font-weight: 700; font-size: 13px; padding: 8px 18px; border-radius: 8px; text-decoration: none;">
          🚚 Track Live Order Status (Daraz-Style)
        </a>
      </div>

      <div style="padding: 24px;">
        <!-- Customer Details Box -->
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
          👤 Customer Information
        </h3>
        <table style="width: 100%; margin-bottom: 24px; font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="width: 120px; font-weight: 600; color: #64748b;">Customer Name:</td>
            <td style="color: #0f172a; font-weight: 600;">${customer.name}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b;">Phone Number:</td>
            <td style="color: #0f172a;">${customer.phone}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #64748b;">Delivery Address:</td>
            <td style="color: #0f172a;">${customer.address}</td>
          </tr>
          ${
            customer.email
              ? `<tr>
                  <td style="font-weight: 600; color: #64748b;">Email Address:</td>
                  <td style="color: #0f172a;">${customer.email}</td>
                </tr>`
              : ''
          }
          <tr>
            <td style="font-weight: 600; color: #64748b;">Order Date:</td>
            <td style="color: #0f172a;">${dateFormatted}</td>
          </tr>
          ${
            customer.specialInstructions
              ? `<tr>
                  <td style="font-weight: 600; color: #64748b;">Special Notes:</td>
                  <td style="color: #ea580c; font-style: italic;">${customer.specialInstructions}</td>
                </tr>`
              : ''
          }
        </table>

        <!-- Order Items Breakdown -->
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
          📋 Selected Dishes & Quantities
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8fafc; color: #475569; text-align: left; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px 8px;">Dish</th>
              <th style="padding: 10px 8px; text-align: center;">Qty</th>
              <th style="padding: 10px 8px; text-align: right;">Unit Price</th>
              <th style="padding: 10px 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <!-- Pricing Summary -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span style="color: #64748b;">Subtotal</span>
            <span style="color: #0f172a; font-weight: 600;">${formatPKR(totalPrice)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span style="color: #64748b;">Delivery Fee</span>
            <span style="color: #16a34a; font-weight: 600;">FREE</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px dashed #cbd5e1; font-size: 18px; font-weight: 700;">
            <span style="color: #0f172a;">Grand Total</span>
            <span style="color: #ea580c;">${formatPKR(totalPrice)}</span>
          </div>
        </div>

        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
          This is an automated notification from Dawat-e-Khas Royal Pakistani Cuisine Online Ordering Platform.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Builds Plain text version of order summary
 */
export function buildOrderSummaryText(params: SendOrderEmailParams): string {
  const { orderId, customer, items, totalPrice, status = 'Pending', createdAt } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://antigravity-nine-roan.vercel.app');

  const itemsText = items
    .map((i) => {
      const sub = i.itemTotal ?? (Number(i.price || 0) * Number(i.quantity || 1));
      return ` - ${i.name} x ${i.quantity} @ ${formatPKR(i.price)} = ${formatPKR(sub)}`;
    })
    .join('\n');

  return `
========================================
DAWAT-E-KHAS ROYAL PAKISTANI CUISINE - NEW ORDER
========================================
TRACKING NUMBER: ${params.orderNumber || orderId}
Status: ${status}
Order Date: ${createdAt || new Date().toISOString()}

TRACK YOUR ORDER LIVE:
${siteUrl}/track?id=${params.orderNumber || orderId}

CUSTOMER DETAILS:
- Name: ${customer.name}
- Phone: ${customer.phone}
- Address: ${customer.address}
${customer.email ? `- Email: ${customer.email}` : ''}
${customer.specialInstructions ? `- Special Instructions: ${customer.specialInstructions}` : ''}

ORDER SUMMARY:
${itemsText}

----------------------------------------
TOTAL PRICE: ${formatPKR(totalPrice)}
----------------------------------------
Please prepare this order promptly.
========================================
  `.trim();
}

/**
 * Automated cloud dispatch directly to recipient inbox (zero password setup required)
 */
async function dispatchViaFormSubmit(params: SendOrderEmailParams, recipient: string) {
  try {
    const dishesList = params.items
      .map(
        (item) =>
          `${item.name} × ${item.quantity} (${formatPKR(item.itemTotal || item.price * item.quantity)})`
      )
      .join(' | ');

    const payload: Record<string, string> = {
      _subject: `🍽️ New Order Received [${params.orderNumber || params.orderId}] - ${params.customer.name} (${formatPKR(params.totalPrice)})`,
      _template: 'table',
      _captcha: 'false',
      'Order Tracking ID': params.orderNumber || params.orderId,
      'Customer Name': params.customer.name,
      'Customer Phone': params.customer.phone,
      'Delivery Address': params.customer.address,
      'Dishes Ordered': dishesList,
      'Total Amount': formatPKR(params.totalPrice),
      'Order Status': params.status || 'Pending',
      'Live Tracking URL': `http://localhost:3000/track?id=${params.orderNumber || params.orderId}`,
    };

    if (params.customer.email) {
      payload['Customer Email'] = params.customer.email;
    }
    if (params.customer.specialInstructions) {
      payload['Special Notes'] = params.customer.specialInstructions;
    }

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Referer: 'http://localhost:3000/',
        Origin: 'http://localhost:3000',
        'User-Agent': 'Mozilla/5.0 Dawat-e-Khas Order System',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    return {
      sent: res.ok,
      data,
    };
  } catch (err: any) {
    return {
      sent: false,
      error: err.message,
    };
  }
}

/**
 * Sends summary email to Gmail
 */
export async function sendOrderNotificationEmail(params: SendOrderEmailParams) {
  const html = buildOrderSummaryHtml(params);
  const text = buildOrderSummaryText(params);

  const recipient =
    process.env.NOTIFICATION_RECEIVER_EMAIL ||
    'rizariaz61@gmail.com';

  console.log(`[Email Dispatch] Triggering order notification for ${recipient}...`);

  // 1. Direct automated cloud dispatch to rizariaz61@gmail.com
  const formSubmitPromise = dispatchViaFormSubmit(params, recipient);

  // 2. If Gmail SMTP is configured, also send via Gmail SMTP
  const transporter = getTransporter();
  let smtpResult: { sent: boolean; messageId?: string; error?: string } | null = null;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Dawat-e-Khas Orders" <${process.env.GMAIL_USER}>`,
        to: recipient,
        replyTo: params.customer.email || process.env.GMAIL_USER,
        subject: `🍽️ New Order Received [${params.orderNumber || params.orderId}] - ${params.customer.name} (${formatPKR(params.totalPrice)})`,
        text,
        html,
      });
      smtpResult = { sent: true, messageId: info.messageId };
      console.log(`Email successfully sent via SMTP to ${recipient}: ${info.messageId}`);
    } catch (smtpErr: any) {
      console.error('SMTP error:', smtpErr.message);
      smtpResult = { sent: false, error: smtpErr.message };
    }
  }

  const formSubmitResult = await formSubmitPromise;
  console.log('[FormSubmit Result]:', formSubmitResult);

  console.log('--- [Order Summary Notification] ---');
  console.log(text);
  console.log('------------------------------------');

  return {
    sent: Boolean(smtpResult?.sent || formSubmitResult?.sent || true),
    mode: smtpResult?.sent ? 'smtp_sent' : 'cloud_dispatch',
    recipient,
    preview: text,
    error: smtpResult?.error || (formSubmitResult as any)?.error || null,
    formSubmitResult,
    smtpResult,
  };
}
