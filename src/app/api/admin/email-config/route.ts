import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { isGmailConfigured } from '@/lib/mailer';

export async function GET(req: NextRequest) {
  const adminToken = req.headers.get('x-admin-token');
  const isAuth = adminToken && (adminToken.startsWith('admin_') || adminToken === 'admin123');

  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized admin access.' },
      { status: 403 }
    );
  }

  const user = process.env.GMAIL_USER || '';
  const receiver = process.env.NOTIFICATION_RECEIVER_EMAIL || 'rizariaz61@gmail.com';
  const configured = isGmailConfigured();

  return NextResponse.json({
    success: true,
    configured,
    gmailUser: user ? `${user.slice(0, 3)}***@gmail.com` : '',
    receiverEmail: receiver,
    fullSenderEmail: user || '',
  });
}

export async function POST(req: NextRequest) {
  try {
    const adminToken = req.headers.get('x-admin-token');
    const isAuth = adminToken && (adminToken.startsWith('admin_') || adminToken === 'admin123');

    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { gmailUser, gmailAppPassword, receiverEmail, sendTest } = body;

    const trimmedUser = (gmailUser || '').trim();
    const cleanPassword = (gmailAppPassword || '').replace(/\s+/g, '').trim();
    const targetReceiver = (receiverEmail || 'rizariaz61@gmail.com').trim();

    if (!trimmedUser || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Both Gmail User email and 16-character App Password are required.' },
        { status: 400 }
      );
    }

    // Test SMTP credentials with nodemailer
    const testTransporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: trimmedUser,
        pass: cleanPassword,
      },
    });

    try {
      await testTransporter.verify();
    } catch (verifyErr: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Gmail authentication failed: ${verifyErr.message}. Make sure 2-Step Verification is ON and you generated a 16-character App Password.`,
        },
        { status: 400 }
      );
    }

    // Update process.env in memory
    process.env.GMAIL_USER = trimmedUser;
    process.env.GMAIL_APP_PASSWORD = cleanPassword;
    process.env.NOTIFICATION_RECEIVER_EMAIL = targetReceiver;

    // Update .env.local file
    const envPaths = [
      path.join(process.cwd(), '.env.local'),
      'C:\\Users\\DANISH LAPTOP\\.gemini\\antigravity\\scratch\\restaurant-website\\.env.local',
    ];

    for (const p of envPaths) {
      try {
        if (fs.existsSync(p)) {
          let content = fs.readFileSync(p, 'utf8');
          content = content.replace(/GMAIL_USER=.*$/m, `GMAIL_USER=${trimmedUser}`);
          content = content.replace(/GMAIL_APP_PASSWORD=.*$/m, `GMAIL_APP_PASSWORD=${cleanPassword}`);
          content = content.replace(/NOTIFICATION_RECEIVER_EMAIL=.*$/m, `NOTIFICATION_RECEIVER_EMAIL=${targetReceiver}`);
          fs.writeFileSync(p, content, 'utf8');
        }
      } catch (e) {
        console.warn('Could not update env path:', p, e);
      }
    }

    // Optionally send live test email to receiver
    let emailSent = false;
    let messageId = '';
    if (sendTest) {
      const info = await testTransporter.sendMail({
        from: `"Dawat-e-Khas Restaurant" <${trimmedUser}>`,
        to: targetReceiver,
        subject: '🍽️ Dawat-e-Khas: Gmail Notification Integration Connected Successfully!',
        text: `Salam! Your Gmail notification system is active. Every incoming customer order will now be sent directly to ${targetReceiver}.\n\nTime: ${new Date().toLocaleString()}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; background: #0f172a; color: #ffffff; border-radius: 12px; border: 1px solid #334155;">
            <h2 style="color: #f59e0b; margin-top: 0;">🍽️ Dawat-e-Khas Restaurant</h2>
            <h3 style="color: #10b981;">✅ Email Notifications Activated!</h3>
            <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
              Mubarak ho! Aap ka Gmail account <strong>${trimmedUser}</strong> kamyabi ke sath connect ho gaya hai.
            </p>
            <p style="color: #cbd5e1; font-size: 14px;">
              Ab jo bhi banda website par order place kare ga, us order ki mukammal tafseelat (Dish names, total PKR price, customer phone & delivery address) foran <strong>${targetReceiver}</strong> par pohanch jaye gi.
            </p>
            <div style="margin-top: 20px; padding: 12px; background: #1e293b; border-radius: 8px; font-size: 13px; color: #94a3b8;">
              Test Dispatch Time: ${new Date().toLocaleString()}
            </div>
          </div>
        `,
      });
      emailSent = true;
      messageId = info.messageId;
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Gmail connected & test notification successfully delivered to ${targetReceiver}!`
        : `Gmail configuration saved successfully!`,
      messageId,
      receiverEmail: targetReceiver,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save email configuration.' },
      { status: 500 }
    );
  }
}
