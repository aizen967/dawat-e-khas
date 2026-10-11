import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password || password.trim() !== validPassword) {
      return NextResponse.json(
        { success: false, error: 'Incorrect admin password. Please try again.' },
        { status: 401 }
      );
    }

    // In a production setup, sign a JWT or session token
    // For local / hackathon use, return a session key and admin email
    const token = `admin_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      success: true,
      token,
      email: 'admin@zaiqa.com',
      message: 'Admin authenticated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
