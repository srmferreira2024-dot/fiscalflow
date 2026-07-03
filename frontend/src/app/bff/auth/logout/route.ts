import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/env';
import { clearSessionCookies, getRefreshToken } from '@/lib/session';

export async function POST(): Promise<NextResponse> {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    }).catch(() => null);
  }

  await clearSessionCookies();

  return NextResponse.json({ success: true });
}
