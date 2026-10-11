import { NextRequest, NextResponse } from 'next/server';
import { isGmailConfigured, getTransporter } from '@/lib/mailer';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const gmailReady = isGmailConfigured();
  const supabaseReady = isSupabaseConfigured();

  return NextResponse.json({
    services: {
      gmail: {
        configured: gmailReady,
        sender: process.env.GMAIL_USER ? `${process.env.GMAIL_USER.slice(0, 3)}***@gmail.com` : null,
        recipient: process.env.NOTIFICATION_RECEIVER_EMAIL || process.env.GMAIL_USER || null,
      },
      supabase: {
        configured: supabaseReady,
        targetTable: 'orders',
      },
    },
    message: 'System status report for Savoria Restaurant Platform',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const testRecipient = body.recipient || process.env.NOTIFICATION_RECEIVER_EMAIL || process.env.GMAIL_USER;

    if (!isGmailConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gmail credentials not configured in .env.local yet. Please provide GMAIL_USER and GMAIL_APP_PASSWORD.',
        },
        { status: 400 }
      );
    }

    const transporter = getTransporter();
    if (!transporter) {
      return NextResponse.json(
        { success: false, error: 'Could not initialize email transporter.' },
        { status: 500 }
      );
    }

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Savoria Bistro Test" <${process.env.GMAIL_USER}>`,
      to: testRecipient,
      subject: '✅ Test Notification: Savoria Bistro Email Integration Active',
      text: 'This is a test notification confirming that Gmail SMTP dispatch is properly configured for the Savoria Artisan Bistro ordering system.',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border-radius: 8px; border: 1px solid #10b981; background: #ecfdf5;">
          <h2 style="color: #065f46; margin: 0 0 10px 0;">✅ Gmail Integration Verified</h2>
          <p style="color: #047857; margin: 0 0 10px 0;">This test confirms that your Gmail App Password and SMTP connection are configured correctly.</p>
          <p style="font-size: 12px; color: #6ee7b7; margin: 0;">Sent at ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${testRecipient}!`,
      messageId: info.messageId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test email.',
      },
      { status: 500 }
    );
  }
}
