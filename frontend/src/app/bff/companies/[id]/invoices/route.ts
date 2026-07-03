import { proxyJson } from '@/lib/proxy-response';
import type { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  return proxyJson(`/companies/${id}/invoices`);
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.text();
  return proxyJson(`/companies/${id}/invoices`, { method: 'POST', body });
}
