import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      authenticated: Boolean(user),
      user: user
        ? { id: user.id, fullName: user.fullName, mobile: user.mobile }
        : null,
    });
  } catch (error) {
    console.error('Session lookup failed:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to verify your session right now.' },
      { status: 500 }
    );
  }
}
