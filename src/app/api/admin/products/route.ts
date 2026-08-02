import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { guard, ok, fail, revalidateMenu } from '@/lib/api';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

const variantSchema = z.object({
  label: z.string().max(60).nullish(),
  volume: z.number().int().positive().nullish(),
  volumeUnit: z.string().max(10).default('мл'),
  price: z.number().int().nonnegative(),
  description: z.string().max(500).nullish(),
  isDefault: z.boolean().optional(),
});

const createSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(160),
  description: z.string().max(1000).nullish(),
  imageUrl: z.string().nullish(),
  thumbUrl: z.string().nullish(),
  blurData: z.string().nullish(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(variantSchema).min(1),
});

export async function POST(req: NextRequest) {
  const session = await guard();
  if (session instanceof Response) return session;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('Проверьте данные товара', 400);
  const d = parsed.data;

  const maxOrder = await prisma.product.aggregate({
    where: { categoryId: d.categoryId },
    _max: { sortOrder: true },
  });

  const hasDefault = d.variants.some((v) => v.isDefault);

  const product = await prisma.product.create({
    data: {
      categoryId: d.categoryId,
      name: d.name,
      slug: slugify(d.name) || 'product',
      description: d.description ?? null,
      imageUrl: d.imageUrl ?? null,
      thumbUrl: d.thumbUrl ?? null,
      blurData: d.blurData ?? null,
      isFeatured: d.isFeatured ?? false,
      isActive: d.isActive ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      variants: {
        create: d.variants.map((v, i) => ({
          label: v.label ?? null,
          volume: v.volume ?? null,
          volumeUnit: v.volumeUnit ?? 'мл',
          price: v.price,
          description: v.description ?? null,
          isDefault: hasDefault ? (v.isDefault ?? false) : i === 0,
          sortOrder: i,
        })),
      },
    },
    include: { variants: true },
  });

  revalidateMenu();
  return ok(product);
}
