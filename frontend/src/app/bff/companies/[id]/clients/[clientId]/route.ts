import type { NextResponse } from 'next/server';
import { proxyJson } from '@/lib/proxy-response';

interface RouteParams {
  params: Promise<{ id: string; clientId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id, clientId } = await params;
  const body = await request.text();
  return proxyJson(`/companies/${id}/clients/${clientId}`, { method: 'PATCH', body });
}

export async function DELETE(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id, clientId } = await params;
  return proxyJson(`/companies/${id}/clients/${clientId}`, { method: 'DELETE' });
}
