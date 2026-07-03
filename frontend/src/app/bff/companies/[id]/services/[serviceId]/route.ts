import type { NextResponse } from 'next/server';
import { proxyJson } from '@/lib/proxy-response';

interface RouteParams {
  params: Promise<{ id: string; serviceId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id, serviceId } = await params;
  const body = await request.text();
  return proxyJson(`/companies/${id}/services/${serviceId}`, { method: 'PATCH', body });
}

export async function DELETE(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id, serviceId } = await params;
  return proxyJson(`/companies/${id}/services/${serviceId}`, { method: 'DELETE' });
}
