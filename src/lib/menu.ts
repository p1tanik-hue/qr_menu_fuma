import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from './db';
import type { CategoryDTO, ProductDTO } from './types';

export const MENU_CACHE_TAG = 'menu';

const productInclude = {
  variants: { orderBy: { sortOrder: 'asc' } },
  addons: { include: { addon: true } },
} as const;

function mapProduct(p: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  thumbUrl: string | null;
  blurData: string | null;
  isFeatured: boolean;
  variants: {
    id: string;
    label: string | null;
    volume: number | null;
    volumeUnit: string;
    price: number;
    description: string | null;
    isDefault: boolean;
  }[];
  addons: { addon: { id: string; name: string; price: number } }[];
}): ProductDTO {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    thumbUrl: p.thumbUrl,
    blurData: p.blurData,
    isFeatured: p.isFeatured,
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      volume: v.volume,
      volumeUnit: v.volumeUnit,
      price: v.price,
      description: v.description,
      isDefault: v.isDefault,
    })),
    addons: p.addons.map((a) => ({
      id: a.addon.id,
      name: a.addon.name,
      price: a.addon.price,
    })),
  };
}

/**
 * Load the full public menu as a nested tree:
 * top-level categories -> child categories -> products.
 * Products directly attached to a top-level category are included too.
 */
async function fetchMenuTree(): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: productInclude,
      },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: productInclude,
          },
        },
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    emoji: c.emoji,
    kind: c.kind,
    products: c.products.map(mapProduct),
    children: c.children.map((child) => ({
      id: child.id,
      slug: child.slug,
      name: child.name,
      description: child.description,
      emoji: child.emoji,
      kind: child.kind,
      products: child.products.map(mapProduct),
      children: [],
    })),
  }));
}

/**
 * Public menu tree, cached across requests and revalidated by tag on any
 * admin mutation (see revalidateMenu). Keeps the page fast even though it is
 * rendered dynamically.
 */
export const getMenuTree = unstable_cache(fetchMenuTree, ['menu-tree'], {
  tags: [MENU_CACHE_TAG],
  revalidate: 300,
});

// ── Admin data (includes inactive items + full detail) ─────────────────
export interface AdminCategory {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
  kind: string;
  isActive: boolean;
  sortOrder: number;
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const cats = await prisma.category.findMany({
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
  });
  return cats.map((c) => ({
    id: c.id,
    parentId: c.parentId,
    slug: c.slug,
    name: c.name,
    description: c.description,
    emoji: c.emoji,
    kind: c.kind,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
  }));
}

export interface AdminProduct {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  thumbUrl: string | null;
  blurData: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  variants: {
    id: string;
    label: string | null;
    volume: number | null;
    volumeUnit: string;
    price: number;
    description: string | null;
    isDefault: boolean;
    sortOrder: number;
  }[];
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const products = await prisma.product.findMany({
    orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    include: { variants: { orderBy: { sortOrder: 'asc' } } },
  });
  return products.map((p) => ({
    id: p.id,
    categoryId: p.categoryId,
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageUrl: p.imageUrl,
    thumbUrl: p.thumbUrl,
    blurData: p.blurData,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      volume: v.volume,
      volumeUnit: v.volumeUnit,
      price: v.price,
      description: v.description,
      isDefault: v.isDefault,
      sortOrder: v.sortOrder,
    })),
  }));
}
