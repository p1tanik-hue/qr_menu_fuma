import 'server-only';
import { prisma } from './db';
import { env } from './env';

/**
 * Brute-force protection based on recorded login attempts per IP.
 * Returns whether the IP is currently allowed to attempt a login.
 */
export async function isLoginAllowed(ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - env.LOGIN_LOCK_MINUTES * 60 * 1000);
  const recentFailures = await prisma.loginAttempt.count({
    where: {
      ip,
      success: false,
      createdAt: { gte: windowStart },
    },
  });
  return recentFailures < env.MAX_LOGIN_ATTEMPTS;
}

export async function recordAttempt(
  ip: string,
  email: string | null,
  success: boolean,
): Promise<void> {
  await prisma.loginAttempt.create({ data: { ip, email, success } });
  // On success, clear the failure streak for this IP.
  if (success) {
    await prisma.loginAttempt.deleteMany({
      where: { ip, success: false },
    });
  }
}

/** Best-effort client IP extraction from proxy headers. */
export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return headers.get('x-real-ip') ?? '0.0.0.0';
}
