# FUMA LOUNGE — Электронное QR-меню

Премиальное PWA-приложение электронного меню для кальянного ресторана **FUMA LOUNGE**.
Чёрный/графит/золото, стеклянные акценты, плавные анимации, мгновенный поиск,
безопасная админ-панель и полная готовность к масштабированию.

---

## ✨ Возможности

**Гостевая часть**
- Премиальный тёмный дизайн (чёрный, графит, золото, тёплый беж), glassmorphism и золотые разделители.
- Карточки товаров с фото, названием, описанием, ценой и объёмом.
- Плавное модальное окно с **переключением объёмов** (цена/литраж/описание меняются без перезагрузки).
- **Мгновенный поиск** (например, «кола» → Coca-Cola) и **фильтры** по подкатегориям.
- Липкая навигация по категориям со scroll-spy и плавной прокруткой.
- 100% адаптивность (iPhone Safari, Android, планшеты, ПК), **без горизонтального скролла**.
- **PWA**: manifest, service worker, офлайн-страница, установка как приложение.
- SEO: OpenGraph, favicon, robots, sitemap, корректные meta-теги.
- Оптимизация изображений: WebP/AVIF, миниатюры, LQIP-плейсхолдеры, lazy loading.

**Админ-панель (`/admin`)**
- Вход по логину/паролю: **Argon2id**, HTTP-only cookie (JWT), **rate-limit** от brute-force, опциональная **2FA (TOTP)**.
- CRUD категорий и товаров, поиск, изменение цены/объёма/описания/фото.
- Перемещение товаров между категориями, создание/удаление категорий.
- **Drag & Drop** сортировка товаров и категорий.
- Загрузка фото drag&drop с **кропом/масштабированием**, авто-конвертацией в WebP и созданием миниатюр.

**Архитектура**
- Всё меню — в PostgreSQL (не в коде/JSON), изменения сразу видны на сайте (`revalidatePath`).
- Схема БД спроектирована с заделом: еда, кальянное меню, бар/винная карта, акции, баннеры, новости, мультиязычность, мультиресторанность, QR по столам, вызов официанта, отзывы, бронирование.

---

## 🧱 Технологии

| Слой | Технология |
|------|-----------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Стили | Tailwind CSS, кастомная премиум-палитра |
| Анимации | Framer Motion |
| БД / ORM | PostgreSQL + Prisma |
| Аутентификация | Argon2id, JWT (jose), HTTP-only cookie, TOTP (otplib) |
| Изображения | sharp (WebP, миниатюры, LQIP) |
| Drag & Drop | @dnd-kit |
| Валидация | Zod |
| Деплой | Docker Compose, Nginx, Let's Encrypt |

---

## 📁 Структура проекта

```
qr_menu_fuma/
├── prisma/
│   ├── schema.prisma          # Модель данных
│   ├── migrations/            # SQL-миграции
│   └── seed.ts                # Сидер с полным меню + placeholder-фото
├── public/
│   ├── icons/                 # PWA-иконки, favicon (генерируются скриптом)
│   ├── uploads/               # Загруженные фото (том/volume, вне git)
│   ├── sw.js                  # Service worker
│   └── offline.html           # Офлайн-страница
├── scripts/
│   └── gen-assets.mjs         # Генерация иконок и OG-изображения
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Корневой layout, метаданные, PWA
│   │   ├── page.tsx           # Публичное меню
│   │   ├── globals.css        # Тема и утилиты
│   │   ├── manifest.ts        # PWA-манифест
│   │   ├── robots.ts / sitemap.ts
│   │   ├── admin/             # Админка (login, dashboard, security)
│   │   └── api/admin/         # REST API (login, logout, upload, categories, products, 2fa)
│   ├── components/
│   │   ├── menu/              # Публичные компоненты (карточки, модалка, поиск, навигация)
│   │   ├── admin/             # Компоненты админки (редакторы, DnD, загрузчик фото)
│   │   └── pwa/               # Регистрация service worker
│   ├── lib/                   # db, auth, images, totp, rate-limit, menu, utils, types
│   └── middleware.ts          # Защита /admin (edge JWT-проверка)
├── deploy/
│   ├── nginx.conf             # Reverse proxy + HTTPS
│   └── backup.sh              # Резервное копирование БД + фото
├── docs/schema.sql            # SQL-схема (из миграции)
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🚀 Быстрый старт (локально)

**Требования:** Node.js 20+, PostgreSQL 14+ (или Docker).

```bash
# 1. Установить зависимости
npm install

# 2. Настроить окружение
cp .env.example .env
# отредактируйте DATABASE_URL, AUTH_SECRET (openssl rand -base64 48), SEED_ADMIN_*

# 3. Применить схему и наполнить меню
npm run prisma:migrate:dev     # создаст таблицы
npm run db:seed                # категории, товары, admin, placeholder-фото

# 4. Сгенерировать иконки/OG (один раз)
node scripts/gen-assets.mjs

# 5. Запуск
npm run dev                    # http://localhost:3000
```

- Гостевое меню: `http://localhost:3000`
- Админка: `http://localhost:3000/admin` (логин из `SEED_ADMIN_EMAIL/PASSWORD`)

---

## 🐳 Запуск через Docker Compose

```bash
cp .env.example .env
# ОБЯЗАТЕЛЬНО задайте:
#   AUTH_SECRET           (openssl rand -base64 48)
#   POSTGRES_PASSWORD     (надёжный пароль)
#   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
#   NEXT_PUBLIC_SITE_URL  (например https://menu.example.com)

# Первый запуск с наполнением меню:
RUN_SEED=true docker compose up -d --build

# Последующие запуски (без пересидинга):
docker compose up -d --build
```

Контейнер `app` при старте автоматически применяет миграции (`prisma migrate deploy`),
а при `RUN_SEED=true` — наполняет БД. Приложение — на `http://<host>:3000`.
Фотографии хранятся в volume `uploads`, база — в volume `db-data`.

---

## 🌐 Развёртывание на VPS (Ubuntu 24.04, Nginx + HTTPS)

```bash
# 1. Установить Docker + Compose plugin
curl -fsSL https://get.docker.com | sh

# 2. Забрать проект
sudo mkdir -p /opt/fuma && cd /opt/fuma
git clone <your-repo> .
cp .env.example .env && nano .env      # задать секреты и NEXT_PUBLIC_SITE_URL=https://menu.example.com

# 3. Поднять приложение (порт 3000 слушается локально)
RUN_SEED=true docker compose up -d --build

# 4. Nginx + сертификат Let's Encrypt
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/fuma
sudo sed -i 's/menu.example.com/ВАШ_ДОМЕН/g' /etc/nginx/sites-available/fuma
sudo ln -s /etc/nginx/sites-available/fuma /etc/nginx/sites-enabled/fuma
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/certbot

# Временно получить сертификат
sudo certbot --nginx -d ВАШ_ДОМЕН --redirect --agree-tos -m you@example.com

sudo nginx -t && sudo systemctl reload nginx
```

- Обновление: `git pull && docker compose up -d --build`.
- Смените первичный пароль администратора после первого входа и включите **2FA** в разделе «Безопасность».
- Автопродление сертификата: `certbot renew` работает по таймеру systemd автоматически.

---

## 💾 Резервное копирование

Скрипт `deploy/backup.sh` делает дамп БД (`pg_dump`) и архив загруженных фото (том `uploads`),
хранит последние 14 копий.

```bash
# Разовый запуск
cd /opt/fuma && ./deploy/backup.sh

# Ежедневно в 03:00 через cron
sudo crontab -e
# добавить строку:
0 3 * * * cd /opt/fuma && BACKUP_DIR=/opt/fuma/backups ./deploy/backup.sh >> /var/log/fuma-backup.log 2>&1
```

**Восстановление БД:**
```bash
gunzip -c backups/db_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T db psql -U fuma -d fuma
```

**Восстановление фото:**
```bash
docker run --rm -v fuma_uploads:/data -v $PWD/backups:/backup alpine \
  sh -c "cd /data && tar xzf /backup/uploads_YYYYMMDD_HHMMSS.tar.gz"
```

> Рекомендуется дополнительно копировать `backups/` во внешнее хранилище (S3/Backblaze/Object Storage)
> и периодически проверять восстановление на тестовом окружении.

---

## 🔐 Безопасность

- Пароли — только в виде хэшей **Argon2id** (никогда в открытом виде).
- Сессия — подписанный JWT в **HTTP-only, SameSite=Lax** cookie (в проде — `Secure`, требуется HTTPS).
- **Rate-limit** входа по IP (`MAX_LOGIN_ATTEMPTS` / `LOGIN_LOCK_MINUTES`) + счётчик неудач на аккаунте.
- Опциональная **двухфакторная аутентификация (TOTP)** — Google Authenticator, 1Password, Authy.
- Заголовки безопасности (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS на Nginx).
- `/admin` и `/api` закрыты от индексации и от service worker кэширования.

---

## 📈 Масштабируемость (заложено в схему)

`CategoryKind` и связи готовы к добавлению: еды, кальянного меню, бара/вина, акций, баннеров,
новостей, нескольких языков, нескольких ресторанов (`Restaurant`), QR по столам (`RestaurantTable`),
вызова официанта, отзывов, онлайн-заказа и бронирования — без переделки ядра.

---

## 🛠 Полезные команды

```bash
npm run dev            # разработка
npm run build          # прод-сборка (prisma generate + next build)
npm run start          # запуск прод-сборки
npm run typecheck      # проверка типов
npm run db:seed        # наполнение меню
npm run prisma:migrate # применить миграции (deploy)
node scripts/gen-assets.mjs   # перегенерировать иконки/OG
```

---

## 📋 Меню

Начальное меню (кофе, чай, чайная церемония, ягодно-фруктовые чаи, вода, газировка,
натуральные лимонады) наполняется сидером `prisma/seed.ts`. Дальнейшее редактирование —
через админ-панель. Реальные фотографии загружаются в админке (плейсхолдеры генерируются автоматически).
