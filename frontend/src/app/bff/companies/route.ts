import type { NextResponse } from 'next/server';
import { proxyJson } from '@/lib/proxy-response';

export async function GET(): Promise<NextResponse> {
  return proxyJson('/companies');
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.text();
  return proxyJson('/companies', { method: 'POST', body });
}
