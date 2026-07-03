import type { NextResponse } from 'next/server';
import { proxyJson } from '@/lib/proxy-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.text();
  return proxyJson(`/companies/${id}/certificate`, { method: 'POST', body });
}

export async function DELETE(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  return proxyJson(`/companies/${id}/certificate`, { method: 'DELETE' });
}
