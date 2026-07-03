import { proxyJson } from '@/lib/proxy-response';
import type { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string; invoiceId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id, invoiceId } = await params;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'xml') {
    return proxyJson(`/companies/${id}/invoices/${invoiceId}/xml`);
  }
  if (action === 'pdf') {
    return proxyJson(`/companies/${id}/invoices/${invoiceId}/pdf`);
  }

  return proxyJson(`/companies/${id}/invoices/${invoiceId}`);
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id, invoiceId } = await params;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const body = await request.text();

  if (action === 'reemit') {
    return proxyJson(`/companies/${id}/invoices/${invoiceId}/reemitir`, { method: 'POST', body });
  }
  if (action === 'cancel') {
    return proxyJson(`/companies/${id}/invoices/${invoiceId}/cancelar`, { method: 'POST', body });
  }

  return proxyJson(`/companies/${id}/invoices/${invoiceId}`, { method: 'POST', body });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id, invoiceId } = await params;
  return proxyJson(`/companies/${id}/invoices/${invoiceId}`, { method: 'DELETE' });
}
