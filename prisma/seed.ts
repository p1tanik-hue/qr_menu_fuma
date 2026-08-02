/**
 * FUMA LOUNGE — database seeder.
 * Populates categories, products, variants, add-ons and the initial admin.
 * Generates premium placeholder images so the menu looks complete instantly.
 *
 * Run: `npm run db:seed`
 */
import { PrismaClient, CategoryKind, AdminRole } from '@prisma/client';
import argon2 from 'argon2';
import { generatePlaceholderImage } from '../src/lib/images';
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
          { name: 'Эспрессо', hue: 'amber', variants: [{ volume: 60, price: 190, isDefault: true }] },
          { name: 'Двойной эспрессо', hue: 'amber', variants: [{ volume: 60, price: 190, isDefault: true }] },
          { name: 'Американо', hue: 'amber', variants: [{ volume: 150, price: 190, isDefault: true }] },
          { name: 'Капучино', hue: 'amber', variants: [{ volume: 150, price: 290, isDefault: true }] },
          { name: 'Латте', hue: 'amber', variants: [{ volume: 240, price: 290, isDefault: true }] },
        ],
      },
      {
        name: 'Чай',
        emoji: '🍵',
        description: 'Листовой чай, 600 мл',
        products: [
          { name: 'Ассам', hue: 'gold', addonNames: [TEA_ADDON], description: 'Насыщенный индийский чёрный чай с солодовыми нотами.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Сенча', hue: 'gold', addonNames: [TEA_ADDON], description: 'Классический японский зелёный чай, свежий и travянистый.', variants: [{ volume: 600, price: 800, isDefault: true }] },
          { name: 'Эрл Грей', hue: 'gold', addonNames: [TEA_ADDON], description: 'Чёрный чай с бергамотом.', variants: [{ volume: 600, price: 800, isDefault: true }] },
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
          { name: 'Барбарис + сок вишни + яблоко', hue: 'amber', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Манго + маракуйя + апельсин', hue: 'amber', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Облепиха + розмарин', hue: 'amber', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Малина + чабрец + брусника', hue: 'amber', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Апельсин + облепиха', hue: 'amber', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Клюквенный пунш + апельсин', hue: 'amber', variants: [{ volume: 600, price: 1200, isDefault: true }] },
          { name: 'Чёрная смородина + апельсин', hue: 'amber', variants: [{ volume: 600, price: 1200, isDefault: true }] },
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
          { name: 'Coca-Cola', hue: 'gold', variants: [{ volume: 330, price: 300, isDefault: true }] },
          { name: 'Coca-Cola Zero', hue: 'gold', variants: [{ volume: 330, price: 300, isDefault: true }] },
          { name: 'Sprite', hue: 'cool', variants: [{ volume: 330, price: 300, isDefault: true }] },
          { name: 'Fanta', hue: 'amber', variants: [{ volume: 330, price: 300, isDefault: true }] },
        ],
      },
      {
        name: 'Натуральные лимонады',
        emoji: '🍋',
        description: 'Домашние лимонады без добавленного сахара, 330 мл',
        products: [
          { name: 'Ананас + облепиха + груша', hue: 'amber', variants: [{ volume: 330, price: 350, isDefault: true }] },
          { name: 'Апельсин + клюква + корица', hue: 'amber', variants: [{ volume: 330, price: 350, isDefault: true }] },
          { name: 'Лимон + смородина + лаванда', hue: 'amber', variants: [{ volume: 330, price: 350, isDefault: true }] },
          { name: 'Манго + персик + киви', hue: 'amber', variants: [{ volume: 330, price: 350, isDefault: true }] },
          { name: 'Грейпфрут + клубника + иланг-иланг', hue: 'amber', variants: [{ volume: 330, price: 350, isDefault: true }] },
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

      let prodOrder = 0;
      for (const p of child.products ?? []) {
        const img = await generatePlaceholderImage(p.name, p.hue ?? 'gold');
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
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@fuma.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe_Str0ng!';
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
