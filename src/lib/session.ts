import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export const SESSION_COOKIE_NAME = 'fixmybaramati_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const createSession = async (userId: string) => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
};

export const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          mobile: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
};

export const revokeSession = async (token: string) => {
  await prisma.session.deleteMany({
    where: { tokenHash: hashToken(token) },
  });
};

export const sessionCookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  expires,
});
