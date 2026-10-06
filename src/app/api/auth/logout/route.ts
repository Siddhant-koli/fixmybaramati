import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { revokeSession, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  try {
    if (token) await revokeSession(token);
    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Logout failed:', error);
    const response = NextResponse.json(
      { success: false, message: 'Unable to log out right now. Please try again.' },
      { status: 500 }
    );
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}
