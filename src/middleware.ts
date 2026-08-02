import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Edge-safe: only uses jose (no native modules like argon2 here).
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? 'dev-insecure-secret-change-me-please-32chars',
);

const COOKIE = 'fuma_session';

async function isValid(token?: string): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE)?.value;
  const authed = await isValid(token);

  const isLoginPage = pathname === '/admin/login';

  // Protect all /admin pages except the login page.
  if (pathname.startsWith('/admin') && !isLoginPage && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If already logged in, skip the login page.
  if (isLoginPage && authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
