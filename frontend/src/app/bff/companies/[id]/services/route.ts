import type { NextResponse } from 'next/server';
import { proxyJson } from '@/lib/proxy-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  return proxyJson(`/companies/${id}/services`);
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.text();
  return proxyJson(`/companies/${id}/services`, { method: 'POST', body });
}
