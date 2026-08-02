import { NextResponse } from 'next/server';
import { getSession, type SessionPayload } from './auth';
import { revalidatePath } from 'next/cache';

/** JSON helpers */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Guard a route handler: returns the session or a 401 response.
 * Usage:
 *   const session = await guard();
 *   if (session instanceof NextResponse) return session;
 */
export async function guard(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return fail('Требуется авторизация', 401);
  return session;
}

/** Revalidate the public menu after a mutation so changes appear instantly. */
export function revalidateMenu() {
  revalidatePath('/');
}
