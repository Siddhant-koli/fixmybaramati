import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { createSession, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Enter your mobile number and password.' },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const mobile = String(data.mobile ?? data.mobileNumber ?? '').replace(/[^\d]/g, '');
    const password = typeof data.password === 'string' ? data.password : '';

    if (!/^[6-9]\d{9}$/.test(mobile) || !password) {
      return NextResponse.json(
        { success: false, message: 'Enter your mobile number and password.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { mobile } });
    const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !validPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid mobile number or password.' },
        { status: 401 }
      );
    }

    const session = await createSession(user.id);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
      },
    });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      session.token,
      sessionCookieOptions(session.expiresAt)
    );
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to log in right now. Please try again later.' },
      { status: 500 }
    );
  }
}
