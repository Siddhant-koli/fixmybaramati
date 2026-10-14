import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { authenticateAdminByName, type AdminLoginCandidate } from '@/lib/admin-login';
import prisma from '@/lib/prisma';
import { createSession, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: 'Enter your mobile number and password.' },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const password = typeof data.password === 'string' ? data.password : '';
    let user: AdminLoginCandidate | null = null;

    if (data.flow === 'admin') {
      const fullName = typeof data.fullName === 'string' ? data.fullName : '';
      if (!fullName.trim() || fullName.length > 200 || !password) {
        return NextResponse.json(
          { success: false, message: 'Enter your full name and password.' },
          { status: 400 }
        );
      }

      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          fullName: true,
          mobile: true,
          passwordHash: true,
          role: true,
        },
      });
      user = await authenticateAdminByName(
        admins,
        fullName,
        password,
        (candidate, hash) => bcrypt.compare(candidate, hash)
      );
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Invalid administrator name or password.' },
          { status: 401 }
        );
      }
    } else {
      const mobile = String(data.mobile ?? data.mobileNumber ?? '').replace(/[^\d]/g, '');
      if (!/^[6-9]\d{9}$/.test(mobile) || !password) {
        return NextResponse.json(
          { success: false, message: 'Enter your mobile number and password.' },
          { status: 400 }
        );
      }

      const citizenOrAdmin = await prisma.user.findUnique({
        where: { mobile },
        select: {
          id: true,
          fullName: true,
          mobile: true,
          passwordHash: true,
          role: true,
        },
      });
      const validPassword = citizenOrAdmin
        ? await bcrypt.compare(password, citizenOrAdmin.passwordHash)
        : false;
      if (!citizenOrAdmin || !validPassword) {
        return NextResponse.json(
          { success: false, message: 'Invalid mobile number or password.' },
          { status: 401 }
        );
      }
      user = citizenOrAdmin;
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.flow === 'admin'
              ? 'Invalid administrator name or password.'
              : 'Invalid mobile number or password.',
        },
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
        role: user.role,
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
