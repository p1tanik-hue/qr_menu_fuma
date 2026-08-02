import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { guard, ok, fail, revalidateMenu } from '@/lib/api';

export const runtime = 'nodejs';

const schema = z.object({
  categoryId: z.string().min(1),
  ids: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const session = await guard();
  if (session instanceof Response) return session;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('Некорректные данные', 400);
  const { categoryId, ids } = parsed.data;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.product.update({
        where: { id },
        data: { sortOrder: index, categoryId },
      }),
    ),
  );

  revalidateMenu();
  return ok({ reordered: true });
}
