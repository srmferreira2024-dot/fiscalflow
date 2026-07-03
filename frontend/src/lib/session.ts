import 'server-only';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'ff_access_token';
const REFRESH_TOKEN_COOKIE = 'ff_refresh_token';

// Só marcar o cookie como Secure quando houver TLS de fato terminado na borda
// (ex.: nginx com certificado em produção). Amarrar isso a NODE_ENV quebraria a
// sessão em qualquer deploy que ainda sirva HTTP puro, como este docker-compose.
const isSecure = process.env.COOKIE_SECURE === 'true';

const baseCookieOptions = {
  httpOnly: true,
  secure: isSecure,
  sameSite: 'lax' as const,
  path: '/',
};

export async function setSessionCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };
