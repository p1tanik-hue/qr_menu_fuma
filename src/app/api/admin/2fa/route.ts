import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { guard, ok, fail, revalidateMenu } from '@/lib/api';
import {
  generateTotpSecret,
  buildTotpEnrollment,
  verifyTotp,
} from '@/lib/totp';

export const runtime = 'nodejs';

// Begin enrollment: generate a secret (stored, but not yet enabled) + QR.
export async function POST() {
  const session = await guard();
  if (session instanceof Response) return session;

  const secret = generateTotpSecret();
  await prisma.adminUser.update({
    where: { id: session.sub },
    data: { totpSecret: secret, totpEnabled: false },
  });
  const enrollment = await buildTotpEnrollment(session.email, secret);
  return ok(enrollment);
}

// Confirm enrollment with a valid code -> enable 2FA.
const enableSchema = z.object({ token: z.string().min(6).max(8) });

export async function PUT(req: NextRequest) {
  const session = await guard();
  if (session instanceof Response) return session;

  const parsed = enableSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('Введите код', 400);

  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!user?.totpSecret) return fail('Сначала начните настройку 2FA', 400);

  if (!verifyTotp(parsed.data.token, user.totpSecret)) {
    return fail('Неверный код. Попробуйте ещё раз.', 400);
  }

  await prisma.adminUser.update({
    where: { id: session.sub },
    data: { totpEnabled: true },
  });
  revalidateMenu();
  return ok({ enabled: true });
}

// Disable 2FA.
export async function DELETE() {
  const session = await guard();
  if (session instanceof Response) return session;
  await prisma.adminUser.update({
    where: { id: session.sub },
    data: { totpEnabled: false, totpSecret: null },
  });
  return ok({ enabled: false });
}
