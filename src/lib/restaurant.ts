import 'server-only';
import { prisma } from './db';

/** Returns the default (first) restaurant id, creating one if none exists. */
export async function getDefaultRestaurantId(): Promise<string> {
  const existing = await prisma.restaurant.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.restaurant.create({
    data: { slug: 'fuma-lounge', name: 'FUMA LOUNGE' },
    select: { id: true },
  });
  return created.id;
}

/** Ensure a slug is unique within a restaurant, appending -2, -3, ... */
export async function uniqueCategorySlug(
  restaurantId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = base || 'cat';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await prisma.category.findFirst({
      where: { restaurantId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}
