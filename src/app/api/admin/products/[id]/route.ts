import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { guard, ok, fail, revalidateMenu } from '@/lib/api';
import { deleteUpload } from '@/lib/images';
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

const patchSchema = z.object({
  categoryId: z.string().optional(), // move between categories
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(1000).nullish(),
  imageUrl: z.string().nullish(),
  thumbUrl: z.string().nullish(),
  blurData: z.string().nullish(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(variantSchema).min(1).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await guard();
  if (session instanceof Response) return session;
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('Проверьте данные товара', 400);
  const d = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return fail('Товар не найден', 404);

  // Replace image files if a new image was provided.
  if (d.imageUrl && d.imageUrl !== existing.imageUrl) {
    await deleteUpload(existing.imageUrl);
    await deleteUpload(existing.thumbUrl);
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        categoryId: d.categoryId ?? undefined,
        name: d.name ?? undefined,
        slug: d.name ? slugify(d.name) || existing.slug : undefined,
        description: d.description === undefined ? undefined : d.description,
        imageUrl: d.imageUrl === undefined ? undefined : d.imageUrl,
        thumbUrl: d.thumbUrl === undefined ? undefined : d.thumbUrl,
        blurData: d.blurData === undefined ? undefined : d.blurData,
        isFeatured: d.isFeatured ?? undefined,
        isActive: d.isActive ?? undefined,
      },
    });

    if (d.variants) {
      const hasDefault = d.variants.some((v) => v.isDefault);
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productVariant.createMany({
        data: d.variants.map((v, i) => ({
          productId: id,
          label: v.label ?? null,
          volume: v.volume ?? null,
          volumeUnit: v.volumeUnit ?? 'мл',
          price: v.price,
          description: v.description ?? null,
          isDefault: hasDefault ? (v.isDefault ?? false) : i === 0,
          sortOrder: i,
        })),
      });
    }
  });

  revalidateMenu();
  const updated = await prisma.product.findUnique({
    where: { id },
    include: { variants: { orderBy: { sortOrder: 'asc' } } },
  });
  return ok(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await guard();
  if (session instanceof Response) return session;
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (existing) {
    await deleteUpload(existing.imageUrl);
    await deleteUpload(existing.thumbUrl);
    await prisma.product.delete({ where: { id } });
  }

  revalidateMenu();
  return ok({ deleted: true });
}
