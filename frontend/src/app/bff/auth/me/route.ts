import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export async function GET(): Promise<NextResponse> {
  const backendResponse = await backendFetch('/users/me');

  if (!backendResponse.ok) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  const user: unknown = await backendResponse.json();
  return NextResponse.json(user);
}
