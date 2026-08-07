# FUMA LOUNGE — защита сервера (после инцидента)

Порядок восстановления и укрепления после попытки взлома через открытый порт 3000.

## Что уже сделано в коде
- **Порт приложения больше не выставлен в интернет** — в `docker-compose.yml`
  он привязан к `127.0.0.1:3000`. Наружу — только через Nginx (:80).
- **Next.js обновлён** до 15.5.23 (патчи безопасности, включая обход
  middleware-авторизации CVE-2025-29927).
- Контейнер запускается с `no-new-privileges` и без `curl`/`wget`.

## 1. Развернуть обновление
```bash
cd /opt/fuma
git stash 2>/dev/null; git pull origin claude/hello-n8020i; git stash pop 2>/dev/null
docker compose build --no-cache app
docker compose up -d
```
Теперь `curl http://127.0.0.1:3000` работает **только локально** — снаружи порт закрыт.

## 2. Поставить Nginx (доступ по IP через :80)
```bash
sudo apt update && sudo apt install -y nginx
sudo cp deploy/nginx-ip.conf /etc/nginx/sites-available/fuma
sudo ln -sf /etc/nginx/sites-available/fuma /etc/nginx/sites-enabled/fuma
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```
Сайт: `http://157.228.136.73` (без :3000).

## 3. Фаервол — только SSH и HTTP
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw --force enable
sudo ufw status
```
Порт 3000 наружу закрыт и на уровне Docker (bind 127.0.0.1), и на уровне ufw.

## 4. Сменить ВСЕ секреты (они могли утечь)
```bash
cd /opt/fuma
openssl rand -base64 48        # для AUTH_SECRET
nano .env
```
Обнови в `.env`:
- `AUTH_SECRET=` — новое значение (сбросит все сессии админа)
- `POSTGRES_PASSWORD=` — новый пароль БД (см. примечание ниже)
- `SEED_ADMIN_PASSWORD=` — новый пароль админа

Затем:
```bash
docker compose up -d
# применить новый пароль админа:
docker compose run --rm app npx tsx prisma/update-descriptions.ts >/dev/null 2>&1 || true
docker compose run --rm -e RUN_SEED=true \
  -v /opt/fuma/prisma/seed-images:/app/prisma/seed-images app npm run db:seed
docker compose restart app
```
> Смена `POSTGRES_PASSWORD` для уже созданной БД требует смены пароля и внутри
> Postgres, либо пересоздания тома. Проще: смени пароль пользователя в БД:
> `docker compose exec -T db psql -U fuma -d fuma -c "ALTER USER fuma PASSWORD 'НОВЫЙ';"`
> и продублируй его в `.env` (POSTGRES_PASSWORD и в DATABASE_URL он берётся авто).

Пароль root ОС тоже смени: `passwd`.

## 5. Прекратить SSH-брутфорс (он идёт постоянно)
Установи fail2ban и переведи SSH на ключи.

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

Переход на SSH-ключи (с твоего компьютера):
```bash
# на своём ПК сгенерь ключ (если нет) и скопируй на сервер:
ssh-keygen -t ed25519
ssh-copy-id root@157.228.136.73
```
Затем на сервере отключи вход по паролю и по root-паролю:
```bash
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```
> ⚠️ Сначала убедись, что вход по ключу работает в НОВОМ терминале, только потом
> отключай пароль — иначе можно потерять доступ.

## 6. Обновить систему
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y unattended-upgrades && sudo dpkg-reconfigure -plow unattended-upgrades
```

## Признаки, что хост НЕ заражён (проверено при инциденте)
- В `ps aux` нет чужих процессов (майнеров/дропперов).
- В cron нет чужих задач.
- Слушается только SSH; нет исходящих на адрес атакующего.
- В `/tmp` и `/dev/shm` нет дропнутых файлов; загрузка вредоноса провалилась
  (в образе нет curl/wget).
- В `auth.log` нет `Accepted password` от атакующего — брутфорс SSH не удался.

Если что-то из этого не так — безопаснее **пересоздать VPS с нуля**, восстановив
данные из бэкапа (`deploy/backup.sh`).
