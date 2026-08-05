# Реальные фотографии для сидера

Положите сюда фото товаров — сидер автоматически подхватит их при `npm run db:seed`.

- Имя файла = **slug товара** (см. список ниже), расширение любое из: `.jpg .jpeg .png .webp .avif`.
- Фото автоматически: обрезается в квадрат по центру, сжимается в **WebP**, создаётся миниатюра и LQIP-превью.
- Если файла для товара нет — используется премиальный плейсхолдер.
- Рекомендуемый исходник: квадрат ≥ 1000×1000, товар по центру, однородный фон.

> Совет: фото также можно загрузить в любой момент через админку (`/admin`) —
> там есть drag&drop, кроп и масштабирование. Папка сидера удобна для первичного массового наполнения.

## Имена файлов по позициям

### Кофе
- `espresso.jpg` — Эспрессо
- `dvoynoy-espresso.jpg` — Двойной эспрессо
- `amerikano.jpg` — Американо
- `kapuchino.jpg` — Капучино
- `latte.jpg` — Латте

### Чай
- `assam.jpg` — Ассам
- `sencha.jpg` — Сенча
- `erl-grey.jpg` — Эрл Грей
- `grechishnyy.jpg` — Гречишный
- `taezhnyy-sbor.jpg` — Таёжный сбор
- `gornyy-altay.jpg` — Горный Алтай
- `karkade.jpg` — Каркадэ
- `molochnyy-ulun.jpg` — Молочный Улун
- `da-hun-pao.jpg` — Да Хун Пао
- `teguanin.jpg` — Тегуаньинь

### Чайная церемония
- `chaynaya-tseremoniya.jpg` — Чайная церемония

### Ягодно-фруктовые чаи
- `barbaris-sok-vishni-yabloko.jpg` — Барбарис + сок вишни + яблоко
- `mango-marakuyya-apelsin.jpg` — Манго + маракуйя + апельсин
- `oblepiha-rozmarin.jpg` — Облепиха + розмарин
- `malina-chabrets-brusnika.jpg` — Малина + чабрец + брусника
- `apelsin-oblepiha.jpg` — Апельсин + облепиха
- `klyukvennyy-punsh-apelsin.jpg` — Клюквенный пунш + апельсин
- `chernaya-smorodina-apelsin.jpg` — Чёрная смородина + апельсин

### Вода
- `zhemchuzhina-baykala-bez-gaza.jpg` — Жемчужина Байкала без газа
- `zhemchuzhina-baykala-gazirovannaya.jpg` — Жемчужина Байкала газированная

### Газировка
- `coca-cola.jpg` — Coca-Cola
- `coca-cola-zero.jpg` — Coca-Cola Zero
- `sprite.jpg` — Sprite
- `fanta.jpg` — Fanta

### Натуральные лимонады
- `ananas-oblepiha-grusha.jpg` — Ананас + облепиха + груша
- `apelsin-klyukva-koritsa.jpg` — Апельсин + клюква + корица
- `limon-smorodina-lavanda.jpg` — Лимон + смородина + лаванда
- `mango-persik-kivi.jpg` — Манго + персик + киви
- `greypfrut-klubnika-ilang-ilang.jpg` — Грейпфрут + клубника + иланг-иланг
