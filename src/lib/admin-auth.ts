import 'server-only';

import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type AdminAuthorization =
  | { authorized: true; user: CurrentUser }
  | { authorized: false; response: NextResponse };

export async function requireAdminApi(): Promise<AdminAuthorization> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: 'Authentication is required.' },
        { status: 401 }
      ),
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: 'Administrator access is required.' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/dashboard');
  return user;
}