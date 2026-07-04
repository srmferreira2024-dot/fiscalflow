import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/env';
import { setSessionCookies } from '@/lib/session';
import type { AuthResult } from '@/types/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json();

  const backendResponse = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!backendResponse.ok) {
    const error: unknown = await backendResponse.json().catch(() => null);
    return NextResponse.json(error ?? { message: 'Falha ao criar conta' }, {
      status: backendResponse.status,
    });
  }

  const result = (await backendResponse.json()) as AuthResult;
  await setSessionCookies(result.accessToken, result.refreshToken);

  return NextResponse.json({ user: result.user });
}
