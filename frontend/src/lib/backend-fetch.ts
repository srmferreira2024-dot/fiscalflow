import 'server-only';
import { BACKEND_URL } from './env';
import {
  clearSessionCookies,
  getAccessToken,
  getRefreshToken,
  setSessionCookies,
} from './session';
import type { AuthResult } from '@/types/auth';

/**
 * Chama o backend anexando o access token da sessão. Se a resposta for 401,
 * tenta renovar via refresh token (rotacionando os cookies) e repete a chamada
 * original uma única vez antes de desistir.
 */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const accessToken = await getAccessToken();

  const response = await callBackend(path, init, accessToken);
  if (response.status !== 401) {
    return response;
  }

  const refreshed = await tryRefreshSession();
  if (!refreshed) {
    await clearSessionCookies();
    return response;
  }

  return callBackend(path, init, refreshed);
}

async function callBackend(
  path: string,
  init: RequestInit,
  accessToken: string | undefined,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

async function tryRefreshSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const result = (await response.json()) as AuthResult;
  await setSessionCookies(result.accessToken, result.refreshToken);
  return result.accessToken;
}
