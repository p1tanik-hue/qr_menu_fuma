/**
 * FUMA LOUNGE — database seeder.
 * Populates categories, products, variants, add-ons and the initial admin.
 * Generates premium placeholder images so the menu looks complete instantly.
 *
 * Run: `npm run db:seed`
 */
import { PrismaClient, CategoryKind, AdminRole } from '@prisma/client';
import argon2 from 'argon2';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import {
  generatePlaceholderImage,
  processProductImage,
  type ProcessedImage,
  type PlaceholderIcon,
} from '../src/lib/images';
import { slugify } from '../src/lib/utils';

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

const prisma = new PrismaClient();

// Directory where you can drop real product photos named by product slug,
// e.g. prisma/seed-images/coca-cola.jpg. Supported: jpg/jpeg/png/webp/avif.
const SEED_IMAGES_DIR = path.join(process.cwd(), 'prisma', 'seed-images');
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

/**
 * Use a real photo from prisma/seed-images/<slug>.<ext> when present
 * (auto-cropped to square + WebP + thumbnail + LQIP); otherwise fall back
 * to a premium generated placeholder.
 */
async function resolveImage(
  name: string,
  hue: Hue,
  icon: PlaceholderIcon,
): Promise<ProcessedImage> {
  const slug = slugify(name);
  for (const ext of IMAGE_EXTS) {
    const file = path.join(SEED_IMAGES_DIR, `${slug}${ext}`);
    try {
      await access(file);
      const buffer = await readFile(file);
      console.log(`  🖼  real photo: ${slug}${ext}`);
      return await processProductImage(buffer);
    } catch {
      /* not found — try next extension */
    }
  }
  return generatePlaceholderImage(name, icon, hue);
}

/** Map a subcategory name to a themed placeholder icon. */
function iconForCategory(categoryName: string): PlaceholderIcon {
  const n = categoryName.toLowerCase();
  if (n.includes('кофе')) return 'coffee';
  if (n.includes('церемони')) return 'ceremony';
  if (n.includes('чай')) return 'tea';
  if (n.includes('вода')) return 'water';
  if (n.includes('газиров')) return 'soda';
  if (n.includes('лимонад')) return 'lemonade';
  return 'default';
}

type Hue = 'gold' | 'amber' | 'cool';

interface SeedVariant {
  label?: string;
  volume?: number;
  price: number;
  description?: string;
  isDefault?: boolean;
}
interface SeedProduct {
  name: string;
  description?: string;
  hue?: Hue;
  featured?: boolean;
  addonNames?: string[];
  variants: SeedVariant[];
}
interface SeedCategory {
  name: string;
  emoji?: string;
  description?: string;
  products?: SeedProduct[];
  children?: SeedCategory[];
}
interface SeedTop extends SeedCategory {
  kind: CategoryKind;
}

// ── Menu definition ────────────────────────────────────────────────────
const TEA_ADDON = 'Лимон';

const menu: SeedTop[] = [
  {
    name: 'Горячие напитки',
    emoji: '☕',
    kind: CategoryKind.DRINK_HOT,
    description: 'Кофе, авторский чай и чайные церемонии',
    children: [
      {
        name: 'Кофе',
        emoji: '☕',
        products: [
          { name: 'Эспрессо', hue: 'amber', description: 'Насыщенный классический эспрессо с плотной ореховой крема.', variants: [{ volume: 60, price: 190, isDefault: true }] },
          { name: 'Двойной эспрессо', hue: 'amber', description: 'Двойная порция эспрессо — крепче и ароматнее.', variants: [{ volume: 60, price: 190, isDefault: true }] },
          { name: 'Американо', hue: 'amber', description: 'Эспрессо с горячей водой: мягкий вкус и лёгкая крема.', variants: [{ volume: 150, price: 190, isDefault: true }] },
          { name: 'Капучино', hue: 'amber', description: 'Эспрессо с бархатной молочной пеной и латте-артом.', variants: [{ volume: 150, price: 290, isDefault: true }] },
          { name: 'Латте', hue: 'amber', description: 'Мягкий кофе с большим количеством нежного молока.', variants: [{ volume: 240, price: 290, isDefault: true }] },
        ],
      },
      {
        name: 'Чай',
        emoji: '🍵',
        description: 'Листовой чай, 600 мл',
        products: [
          { name: 'Ассам', hue: 'gold', addonNames: [TEA_ADDON], description: 'Насыщенный индийский чёрный чай с солодовыми нотами.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Сенча', hue: 'gold', addonNames: [TEA_ADDON], description: 'Классический японский зелёный чай, свежий и травянистый.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Эрл Грей', hue: 'gold', addonNames: [TEA_ADDON], description: 'Чёрный чай с бергамотом и цитрусовым ароматом.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Гречишный', hue: 'gold', addonNames: [TEA_ADDON], description: 'Мягкий напиток из обжаренной гречихи, без кофеина.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Таёжный сбор', hue: 'gold', addonNames: [TEA_ADDON], description: 'Купаж сибирских трав и ягод.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Горный Алтай', hue: 'gold', addonNames: [TEA_ADDON], description: 'Травяной сбор с алтайских склонов.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Каркадэ', hue: 'amber', addonNames: [TEA_ADDON], description: 'Насыщенный чай из лепестков гибискуса.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Молочный Улун', hue: 'gold', addonNames: [TEA_ADDON], description: 'Улун со сливочным ароматом.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Да Хун Пао', hue: 'gold', addonNames: [TEA_ADDON], description: 'Легендарный китайский тёмный улун.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Тегуаньинь', hue: 'gold', addonNames: [TEA_ADDON], description: 'Бирюзовый улун с цветочным ароматом.', variants: [{ volume: 600, price: 800, isDefault: true }] },
        ],
      },
      {
        name: 'Чайная церемония',
        emoji: '🫖',
        products: [
          {
            name: 'Чайная церемония',
            hue: 'gold',
            featured: true,
            description: 'Полноценная чайная церемония на компанию: подбор чая, посуда и подача.',
            variants: [{ volume: 1500, price: 2000, isDefault: true }],
          },
        ],
      },
      {
        name: 'Ягодно-фруктовые чаи',
        emoji: '🫐',
        description: 'Горячие фруктовые купажи',
        products: [
          { name: 'Барбарис + сок вишни + яблоко', hue: 'amber', description: 'Согревающий купаж барбариса, вишни и яблока.', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Манго + маракуйя + апельсин', hue: 'amber', description: 'Тропический микс манго, маракуйи и апельсина.', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Облепиха + розмарин', hue: 'amber', description: 'Витаминная облепиха с пряной ноткой розмарина.', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Малина + чабрец + брусника', hue: 'amber', description: 'Малина и брусника с ароматом чабреца.', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Апельсин + облепиха', hue: 'amber', description: 'Солнечный дуэт апельсина и облепихи.', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Клюквенный пунш + апельсин', hue: 'amber', description: 'Насыщенный клюквенный пунш с апельсином.', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Чёрная смородина + апельсин', hue: 'amber', description: 'Густой настой чёрной смородины с апельсином.', variants: [{ volume: 600, price: 1200, isDefault: true }] },
        ],
      },
    ],
  },
  {
    name: 'Холодные напитки',
    emoji: '🥤',
    kind: CategoryKind.DRINK_COLD,
    description: 'Вода, газировка и натуральные лимонады',
    children: [
      {
        name: 'Вода',
        emoji: '💧',
        products: [
          {
            name: 'Жемчужина Байкала',
            hue: 'cool',
            description: 'Природная байкальская вода в стекле.',
            variants: [
              { label: 'Без газа', volume: 530, price: 590, isDefault: true, description: 'Природная байкальская вода без газа.' },
              { label: 'Газированная', volume: 530, price: 590, description: 'Природная байкальская вода, газированная.' },
            ],
          },
        ],
      },
      {
        name: 'Газировка',
        emoji: '🥤',
        products: [
          { name: 'Coca-Cola', hue: 'gold', description: 'Классическая освежающая кола, хорошо охлаждённая.', variants: [{ volume: 330, price: 300, isDefault: true }] },
          { name: 'Coca-Cola Zero', hue: 'gold', description: 'Вкус классической колы — без сахара.', variants: [{ volume: 330, price: 300, isDefault: true }] },
          { name: 'Sprite', hue: 'cool', description: 'Освежающий лимон-лайм без лишней сладости.', variants: [{ volume: 330, price: 300, isDefault: true }] },
          { name: 'Fanta', hue: 'amber', description: 'Яркий апельсиновый лимонад, охлаждённый.', variants: [{ volume: 330, price: 300, isDefault: true }] },
        ],
      },
      {
        name: 'Натуральные лимонады',
        emoji: '🍋',
        description: 'Домашние лимонады без добавленного сахара, 330 мл',
        products: [
          { name: 'Ананас + облепиха + груша', hue: 'amber', description: 'Домашний лимонад из ананаса, облепихи и груши, без сахара.', variants: [{ volume: 330, price: 350, isDefault: true }] },
          { name: 'Апельсин + клюква + корица', hue: 'amber', description: 'Пряный лимонад с апельсином, клюквой и корицей.', variants: [{ volume: 330, price: 350, isDefault: true }] },
          { name: 'Лимон + смородина + лаванда', hue: 'amber', description: 'Освежающий лимон со смородиной и ноткой лаванды.', variants: [{ volume: 330, price: 350, isDefault: true }] },
          { name: 'Манго + персик + киви', hue: 'amber', description: 'Тропический лимонад из манго, персика и киви.', variants: [{ volume: 330, price: 350, isDefault: true }] },
          { name: 'Грейпфрут + клубника + иланг-иланг', hue: 'amber', description: 'Грейпфрут и клубника с цветочным иланг-илангом.', variants: [{ volume: 330, price: 350, isDefault: true }] },
        ],
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding FUMA LOUNGE...');

  // Clean slate (safe on a fresh DB; idempotent reseeds).
  await prisma.productAddon.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.addon.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.restaurant.deleteMany();

  // Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'fuma-lounge' },
    update: {},
    create: { slug: 'fuma-lounge', name: 'FUMA LOUNGE' },
  });

  // Add-ons
  const lemon = await prisma.addon.create({
    data: { name: TEA_ADDON, price: 100 },
  });
  const addonByName: Record<string, string> = { [TEA_ADDON]: lemon.id };

  // Categories + products
  let topOrder = 0;
  for (const top of menu) {
    const topCat = await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        slug: slugify(top.name),
        name: top.name,
        emoji: top.emoji,
        description: top.description,
        kind: top.kind,
        sortOrder: topOrder++,
      },
    });

    let childOrder = 0;
    for (const child of top.children ?? []) {
      const childCat = await prisma.category.create({
        data: {
          restaurantId: restaurant.id,
          parentId: topCat.id,
          slug: slugify(`${top.name}-${child.name}`),
          name: child.name,
          emoji: child.emoji,
          description: child.description,
          kind: top.kind,
          sortOrder: childOrder++,
        },
      });

      const icon = iconForCategory(child.name);
      let prodOrder = 0;
      for (const p of child.products ?? []) {
        const img = await resolveImage(p.name, p.hue ?? 'gold', icon);
        const product = await prisma.product.create({
          data: {
            categoryId: childCat.id,
            slug: slugify(p.name) || `p-${prodOrder}`,
            name: p.name,
            description: p.description ?? null,
            imageUrl: img.imageUrl,
            thumbUrl: img.thumbUrl,
            blurData: img.blurData,
            isFeatured: p.featured ?? false,
            sortOrder: prodOrder++,
            variants: {
              create: p.variants.map((v, i) => ({
                label: v.label ?? null,
                volume: v.volume ?? null,
                price: v.price,
                description: v.description ?? null,
                isDefault: v.isDefault ?? i === 0,
                sortOrder: i,
              })),
            },
          },
        });

        for (const an of p.addonNames ?? []) {
          const addonId = addonByName[an];
          if (addonId) {
            await prisma.productAddon.create({
              data: { productId: product.id, addonId },
            });
          }
        }
      }
    }
  }

  // Initial admin user
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@fumalounge.ru';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'FumaLounge2025!';
  const passwordHash = await hashPassword(password);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: AdminRole.OWNER },
    create: { email, passwordHash, role: AdminRole.OWNER },
  });

  // A couple of demo tables (QR-per-table future feature).
  for (const n of ['1', '2', '3']) {
    await prisma.restaurantTable.create({
      data: { restaurantId: restaurant.id, number: n },
    });
  }

  const productCount = await prisma.product.count();
  console.log(`✅ Seeded ${productCount} products.`);
  console.log(`👤 Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
