import { NextRequest } from 'next/server';
import { z } from 'zod';
import { CategoryKind } from '@prisma/client';
import { prisma } from '@/lib/db';
import { guard, ok, fail, revalidateMenu } from '@/lib/api';
import { getDefaultRestaurantId, uniqueCategorySlug } from '@/lib/restaurant';
import { getAdminCategories } from '@/lib/menu';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

const createSchema = z.object({
  name: z.string().min(1).max(120),
  parentId: z.string().nullish(),
  emoji: z.string().max(8).nullish(),
  description: z.string().max(500).nullish(),
  kind: z.nativeEnum(CategoryKind).optional(),
});

export async function GET() {
  const session = await guard();
  if (session instanceof Response) return session;
  return ok(await getAdminCategories());
}

export async function POST(req: NextRequest) {
  const session = await guard();
  if (session instanceof Response) return session;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('Проверьте данные категории', 400);
  const { name, parentId, emoji, description, kind } = parsed.data;

  const restaurantId = await getDefaultRestaurantId();
  const slug = await uniqueCategorySlug(restaurantId, slugify(name));

  const maxOrder = await prisma.category.aggregate({
    where: { restaurantId, parentId: parentId ?? null },
    _max: { sortOrder: true },
  });

  const category = await prisma.category.create({
    data: {
      restaurantId,
      parentId: parentId ?? null,
      name,
      slug,
      emoji: emoji ?? null,
      description: description ?? null,
      kind: kind ?? CategoryKind.OTHER,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidateMenu();
  return ok(category);
}
