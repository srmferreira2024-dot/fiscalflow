import 'server-only';
import { NextResponse } from 'next/server';
import { backendFetch } from './backend-fetch';

/**
 * Encaminha uma chamada para o backend e devolve a resposta como JSON, sem repetir
 * backendFetch()+serialização em cada route handler de /bff/**. Trata 204 (sem corpo)
 * sem tentar fazer .json() de uma resposta vazia.
 */
export async function proxyJson(backendPath: string, init?: RequestInit): Promise<NextResponse> {
  const response = await backendFetch(backendPath, init);

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const body: unknown = await response.json().catch(() => null);
  return NextResponse.json(body, { status: response.status });
}
