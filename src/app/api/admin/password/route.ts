import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { guard, ok, fail } from '@/lib/api';
import { verifyPassword, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Пароль должен быть не короче 8 символов')
    .max(200),
});

export async function POST(req: NextRequest) {
  const session = await guard();
  if (session instanceof Response) return session;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Проверьте данные', 400);
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!user) return fail('Пользователь не найден', 404);

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) return fail('Текущий пароль неверный', 400);

  if (currentPassword === newPassword) {
    return fail('Новый пароль совпадает с текущим', 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return ok({ changed: true });
}
