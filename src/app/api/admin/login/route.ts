import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';
import { verifyTotp } from '@/lib/totp';
import { isLoginAllowed, recordAttempt, getClientIp } from '@/lib/rate-limit';
import { ok, fail } from '@/lib/api';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  token: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  if (!(await isLoginAllowed(ip))) {
    return fail('Слишком много попыток входа. Попробуйте позже.', 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail('Некорректный запрос', 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    await recordAttempt(ip, null, false);
    return fail('Проверьте введённые данные', 400);
  }

  const { email, password, token } = parsed.data;
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Account lock check
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    return fail('Аккаунт временно заблокирован. Попробуйте позже.', 429);
  }

  const passwordValid = user
    ? await verifyPassword(user.passwordHash, password)
    : false;

  if (!user || !passwordValid) {
    await recordAttempt(ip, email, false);
    if (user) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { failedAttempts: { increment: 1 } },
      });
    }
    return fail('Неверный email или пароль', 401);
  }

  // Two-factor (TOTP) if enabled
  if (user.totpEnabled && user.totpSecret) {
    if (!token) {
      return fail('TOTP_REQUIRED', 401);
    }
    if (!verifyTotp(token, user.totpSecret)) {
      await recordAttempt(ip, email, false);
      return fail('Неверный код двухфакторной аутентификации', 401);
    }
  }

  // Success
  await recordAttempt(ip, email, true);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const jwt = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(jwt);

  return ok({ email: user.email, role: user.role });
}
