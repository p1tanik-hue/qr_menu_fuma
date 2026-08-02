# FUMA LOUNGE — запуск с нуля на Ubuntu 22.04

Полная пошаговая инструкция: от чистого сервера до работающего сайта с HTTPS.
Рекомендуемый способ — **Docker Compose** (одна команда поднимает и приложение, и базу).

Минимальные требования к VPS: **1 vCPU / 2 ГБ RAM / 20 ГБ SSD**, Ubuntu 22.04 LTS.

---

## 0. Что понадобится заранее

- VPS с Ubuntu 22.04 и доступом по SSH (`ssh root@IP_СЕРВЕРА`).
- (Для HTTPS) домен, например `menu.example.com`, у которого **A-запись** указывает на IP сервера.
- Доступ к репозиторию `p1tanik-hue/qr_menu_fuma` (он приватный — понадобится
  Personal Access Token или SSH-ключ, см. шаг 4).

> Все команды ниже выполняются на сервере. Если вы вошли как обычный пользователь,
> добавляйте `sudo` перед административными командами.

---

## 1. Обновляем систему

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl git ufw
```

---

## 2. Настраиваем фаервол (UFW)

Открываем только SSH, HTTP и HTTPS. Порт приложения (3000) наружу **не** открываем.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

---

## 3. Устанавливаем Docker + Docker Compose

```bash
curl -fsSL https://get.docker.com | sh
```

Проверяем:

```bash
docker --version
docker compose version
```

(Необязательно) чтобы запускать docker без sudo:

```bash
sudo usermod -aG docker $USER
# перелогиньтесь: exit, затем снова ssh
```

---

## 4. Забираем код проекта

Создаём папку и клонируем репозиторий.

```bash
sudo mkdir -p /opt/fuma
sudo chown -R $USER:$USER /opt/fuma
cd /opt/fuma
```

**Вариант A — по HTTPS с токеном** (Personal Access Token с правом `repo`):

```bash
git clone https://<ВАШ_ТОКЕН>@github.com/p1tanik-hue/qr_menu_fuma.git .
```

**Вариант B — по SSH** (если добавили SSH-ключ сервера в GitHub):

```bash
git clone git@github.com:p1tanik-hue/qr_menu_fuma.git .
```

Выбираем ветку с кодом:

```bash
# Если Pull Request #1 уже влит в main:
git checkout main

# Если ещё не влит — берём рабочую ветку:
git checkout claude/hello-n8020i
```

---

## 5. Настраиваем переменные окружения (.env)

```bash
cp .env.example .env
```

Сгенерируйте надёжный секрет для сессий:

```bash
openssl rand -base64 48
```

Откройте файл и заполните значения:

```bash
nano .env
```

Обязательно задайте:

```dotenv
# Пароль базы данных (придумайте свой, надёжный)
POSTGRES_PASSWORD=ЗАМЕНИТЕ_на_надёжный_пароль

# Секрет сессий — вставьте вывод команды openssl rand -base64 48
AUTH_SECRET=ЗАМЕНИТЕ_на_сгенерированный_секрет

# Публичный адрес сайта (с доменом и https, если он есть)
NEXT_PUBLIC_SITE_URL=https://menu.example.com

# Данные первого администратора (смените после первого входа!)
SEED_ADMIN_EMAIL=admin@fuma.local
SEED_ADMIN_PASSWORD=ЗАМЕНИТЕ_на_надёжный_пароль
```

> `DATABASE_URL` в контейнере формируется автоматически из `POSTGRES_*` —
> отдельно менять его для Docker не нужно.

---

## 6. Закрываем порт приложения от внешнего доступа

Приложение должно быть доступно только локально (через Nginx), а не напрямую по `:3000`.
Откройте `docker-compose.yml` и в сервисе `app` замените маппинг порта:

```bash
nano docker-compose.yml
```

```yaml
    ports:
      - '127.0.0.1:3000:3000'   # было '3000:3000'
```

Сохраните файл.

---

## 7. Первый запуск (со сборкой и наполнением меню)

```bash
cd /opt/fuma
RUN_SEED=true docker compose up -d --build
```

Что происходит:
- собирается образ приложения;
- поднимается PostgreSQL;
- автоматически применяются миграции;
- база наполняется начальным меню (`RUN_SEED=true`).

Смотрим логи и статус:

```bash
docker compose ps
docker compose logs -f app        # Ctrl+C для выхода
```

Проверяем локально, что сайт отвечает:

```bash
curl -I http://127.0.0.1:3000
# ожидаем HTTP/1.1 200 OK
```

> Все последующие запуски — **без** `RUN_SEED=true`, чтобы не перезатирать данные:
> `docker compose up -d --build`

---

## 7b. Запуск без домена — доступ по IP (HTTP)

Если домена нет и доступ будет по IP (например `http://157.228.136.73`),
Nginx и Let's Encrypt не нужны — приложение публикуется прямо на порт 80.

1. В `.env` укажите адрес по IP с `http://` (важно для входа в админку — cookie
   не будет помечена `Secure`, иначе по HTTP логин не сработает):
   ```dotenv
   NEXT_PUBLIC_SITE_URL=http://157.228.136.73
   ```
2. В `docker-compose.yml` у сервиса `app` опубликуйте порт 80:
   ```yaml
       ports:
         - '80:3000'
   ```
   (вместо `'127.0.0.1:3000:3000'` из шага 6 — при доступе по IP порт должен быть внешним).
3. Откройте порт 80 в фаерволе (уже открыт в шаге 2) и запустите:
   ```bash
   cd /opt/fuma
   RUN_SEED=true docker compose up -d --build
   ```
4. Проверьте: `http://157.228.136.73` — меню, `http://157.228.136.73/admin` — админка.

> Ограничения HTTP-доступа по IP: не работает установка PWA (браузеры требуют
> HTTPS) и iOS может не кэшировать офлайн-режим. Само меню и админка работают.
> Когда появится домен — вернитесь к шагам 6 и 8 для перевода на HTTPS.

Разделы 8 ниже — только если используете **домен**.

## 8. Домен, Nginx и HTTPS (Let's Encrypt)

Если домена нет — сайт уже работает по IP через порт 3000 локально; для публичного
доступа домен и Nginx необходимы.

### 8.1 Устанавливаем Nginx и Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 8.2 Создаём временный конфиг (только HTTP)

```bash
sudo nano /etc/nginx/sites-available/fuma
```

Вставьте (замените `menu.example.com` на свой домен):

```nginx
server {
    listen 80;
    server_name menu.example.com;
    client_max_body_size 15m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируем и проверяем:

```bash
sudo ln -s /etc/nginx/sites-available/fuma /etc/nginx/sites-enabled/fuma
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 8.3 Получаем сертификат (Certbot сам настроит HTTPS и редирект)

```bash
sudo certbot --nginx -d menu.example.com --redirect --agree-tos -m you@example.com
```

Certbot добавит SSL-настройки в конфиг и включит редирект с HTTP на HTTPS.
Автопродление сертификата уже работает через systemd-таймер. Проверить:

```bash
sudo certbot renew --dry-run
```

Готово — открывайте `https://menu.example.com`.

> Хотите более тонкую настройку (кэширование `_next/static` и `/uploads`)?
> В репозитории есть готовый пример `deploy/nginx.conf` — примените его **после**
> получения сертификата, подставив свой домен.

---

## 9. Первый вход в админку

1. Откройте `https://menu.example.com/admin`.
2. Войдите с `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` из `.env`.
3. Зайдите в раздел **«Безопасность»** и включите **2FA (TOTP)** — отсканируйте QR
   в Google Authenticator / 1Password / Authy.
4. Управляйте меню: категории, товары, цены, объёмы, фото, порядок (drag & drop).

> Сменить пароль администратора: проще всего задать новый `SEED_ADMIN_PASSWORD`
> в `.env` и один раз выполнить `docker compose run --rm -e RUN_SEED=true app npm run db:seed`
> (сидер обновит пароль существующего администратора).

---

## 10. Фотографии товаров

- **Через админку** — самый простой способ: drag & drop, кроп, масштабирование,
  авто-конвертация в WebP.
- **Массово при наполнении** — положите файлы в `prisma/seed-images/<slug>.jpg`
  (имена см. в `prisma/seed-images/README.md`) и выполните пересидинг:
  ```bash
  docker compose run --rm -e RUN_SEED=true app npm run db:seed
  ```

Загруженные фото хранятся в Docker-томе `uploads` и сохраняются между обновлениями.

---

## 11. Резервное копирование

В репозитории есть `deploy/backup.sh` (дамп БД + архив фото, хранит 14 последних копий).

Разовый запуск:

```bash
cd /opt/fuma && ./deploy/backup.sh
```

Ежедневно в 03:00 через cron:

```bash
sudo crontab -e
# добавьте строку:
0 3 * * * cd /opt/fuma && BACKUP_DIR=/opt/fuma/backups ./deploy/backup.sh >> /var/log/fuma-backup.log 2>&1
```

**Восстановление БД:**

```bash
gunzip -c backups/db_ГГГГММДД_ЧЧММСС.sql.gz | docker compose exec -T db psql -U fuma -d fuma
```

**Восстановление фото:**

```bash
docker run --rm -v fuma_uploads:/data -v $PWD/backups:/backup alpine \
  sh -c "cd /data && tar xzf /backup/uploads_ГГГГММДД_ЧЧММСС.tar.gz"
```

> Рекомендуется дублировать папку `backups/` во внешнее хранилище (S3/Backblaze).

---

## 12. Обновление приложения

```bash
cd /opt/fuma
git pull
docker compose up -d --build     # миграции применятся автоматически
```

---

## 13. Полезные команды

```bash
docker compose ps                 # статус контейнеров
docker compose logs -f app        # логи приложения
docker compose logs -f db         # логи БД
docker compose restart app        # перезапустить приложение
docker compose down               # остановить всё (данные в томах сохраняются)
docker compose down -v            # ⚠️ остановить и УДАЛИТЬ данные (БД и фото!)
```

---

## 14. Быстрая диагностика

| Симптом | Что проверить |
|---------|---------------|
| Сайт не открывается по домену | A-запись домена → IP; `sudo nginx -t`; `sudo systemctl status nginx` |
| 502 Bad Gateway | Приложение не отвечает: `docker compose logs -f app`, `curl -I http://127.0.0.1:3000` |
| Не применились миграции | `docker compose logs app` (строка «Applying database migrations») |
| Забыли пароль админа | Задать новый `SEED_ADMIN_PASSWORD` в `.env` и `docker compose run --rm -e RUN_SEED=true app npm run db:seed` |
| Не грузятся фото после деплоя | Проверить том: `docker volume ls` → `fuma_uploads` |
| Ошибка сборки образа | Свободное место (`df -h`) и RAM (`free -m`); при 2 ГБ RAM сборка может требовать swap |

### Добавить swap (если сборка падает по памяти на 2 ГБ RAM)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

Готово. Сайт: `https://menu.example.com` · Админка: `https://menu.example.com/admin`
