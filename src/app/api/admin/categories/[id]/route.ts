import { NextRequest } from 'next/server';
import { z } from 'zod';
import { CategoryKind } from '@prisma/client';
import { prisma } from '@/lib/db';
import { guard, ok, fail, revalidateMenu } from '@/lib/api';

export const runtime = 'nodejs';

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  emoji: z.string().max(8).nullish(),
  description: z.string().max(500).nullish(),
  kind: z.nativeEnum(CategoryKind).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().nullish(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await guard();
  if (session instanceof Response) return session;
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('Проверьте данные категории', 400);

  // Guard against making a category its own parent.
  if (parsed.data.parentId && parsed.data.parentId === id) {
    return fail('Категория не может быть вложена в саму себя', 400);
  }

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });

  revalidateMenu();
  return ok(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await guard();
  if (session instanceof Response) return session;
  const { id } = await params;

  // Cascade removes children + products + variants (see schema onDelete).
  await prisma.category.delete({ where: { id } });

  revalidateMenu();
  return ok({ deleted: true });
}
