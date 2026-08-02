# FUMA LOUNGE — промты для генерации фотографий меню

Промты рассчитаны на Midjourney / DALL·E 3 / Flux / Stable Diffusion.
Стиль единый, чтобы всё меню выглядело цельно. Язык промтов — английский
(так генераторы работают точнее).

## Как пользоваться
1. К каждому промту ниже **добавляй общий блок стиля** (STYLE BASE) в конец.
2. Сгенерируй квадратное изображение (1:1).
3. Сохрани файл под именем позиции (slug) в папку `prisma/seed-images/`,
   например `prisma/seed-images/latte.jpg`.
4. Пересидируй: `docker compose run --rm app npm run db:seed`
   (или загрузи фото через админку `/admin` — там есть кроп).

---

## STYLE BASE (добавлять к каждому промту)

```
Premium product photography for a luxury hookah lounge menu. Subject centered,
dark charcoal-to-black gradient background (#0E0E0E), warm soft cinematic side
lighting with a gentle golden rim light, subtle reflection on a dark matte
surface, shallow depth of field, elegant, minimal, appetizing, photorealistic,
high detail, 8k, no text, no logo, no watermark, no people, no hands.
Square 1:1 composition.
```

**Negative prompt (SD/Flux):**
```
text, letters, watermark, logo, brand, hands, people, cluttered background,
extra objects, plastic look, low quality, blurry, deformed, oversaturated
```

**Midjourney:** добавляй в конце `--ar 1:1 --style raw --v 6`
**DALL·E 3:** просто добавь фразу `square 1:1, product photo`.

---

## Горячие напитки

### Кофе
| Файл | Промт (subject) |
|------|-----------------|
| `espresso.jpg` | A single shot of espresso in a small white porcelain cup on a saucer, rich hazel crema on top, a thin wisp of steam |
| `dvoynoy-espresso.jpg` | A double espresso in a small porcelain cup, thick golden-brown crema, faint steam, a couple of coffee beans on the saucer |
| `amerikano.jpg` | An americano black coffee in a white cup, light crema, gentle steam rising |
| `kapuchino.jpg` | A cappuccino in a cup with smooth velvety milk foam and delicate rosetta latte art, light cocoa dusting |
| `latte.jpg` | A latte in a tall clear glass, visible layers of espresso and steamed milk, leaf latte art on top |

### Чай (подача в стеклянной чашке/чайничке, виден цвет настоя)
| Файл | Промт (subject) |
|------|-----------------|
| `assam.jpg` | A glass cup of strong Assam black tea, deep amber-red color, wisp of steam |
| `sencha.jpg` | A glass cup of Japanese sencha green tea, fresh light-green color, steam |
| `erl-grey.jpg` | A glass cup of Earl Grey black tea, amber color, a curl of bergamot/orange peel on the saucer, steam |
| `grechishnyy.jpg` | A glass cup of buckwheat tea (soba-cha), golden honey color, a few roasted buckwheat kernels beside it, steam |
| `taezhnyy-sbor.jpg` | A glass cup of Siberian taiga herbal tea, dark reddish-brown, pine sprigs and forest berries beside it, steam |
| `gornyy-altay.jpg` | A glass cup of Altai mountain herbal tea, golden-brown, dried mountain herbs beside it, steam |
| `karkade.jpg` | A glass cup of hibiscus (karkade) tea, vivid deep ruby-red color, dried hibiscus petals beside it, steam |
| `molochnyy-ulun.jpg` | A glass cup of milk oolong tea, pale creamy-golden color, a few rolled oolong leaves beside it, steam |
| `da-hun-pao.jpg` | A glass cup of Da Hong Pao dark oolong tea, rich amber-brown color, twisted dark tea leaves beside it, steam |
| `teguanin.jpg` | A glass cup of Tie Guan Yin oolong tea, light golden-green color, rolled green oolong leaves beside it, steam |

### Чайная церемония
| Файл | Промт (subject) |
|------|-----------------|
| `chaynaya-tseremoniya.jpg` | An elegant Chinese tea ceremony set on a dark wooden tea tray: a glass teapot with amber tea, small tea cups, a gaiwan and tea tools, steam rising, intimate premium mood |

### Ягодно-фруктовые чаи (стеклянный чайник, внутри видны фрукты/ягоды)
| Файл | Промт (subject) |
|------|-----------------|
| `barbaris-sok-vishni-yabloko.jpg` | A glass teapot of hot fruit tea with barberry, cherry and apple, deep red color, apple slices and cherries inside, steam |
| `mango-marakuyya-apelsin.jpg` | A glass teapot of hot fruit tea with mango, passion fruit and orange, golden-orange color, tropical fruit pieces inside, steam |
| `oblepiha-rozmarin.jpg` | A glass teapot of hot sea-buckthorn tea with rosemary, bright orange color, sea-buckthorn berries and a rosemary sprig inside, steam |
| `malina-chabrets-brusnika.jpg` | A glass teapot of hot tea with raspberry, thyme and lingonberry, pink-red color, berries and thyme sprigs inside, steam |
| `apelsin-oblepiha.jpg` | A glass teapot of hot orange and sea-buckthorn tea, vivid orange color, orange slices and sea-buckthorn berries inside, steam |
| `klyukvennyy-punsh-apelsin.jpg` | A glass teapot of hot cranberry punch with orange, deep crimson color, cranberries and orange slices inside, steam |
| `chernaya-smorodina-apelsin.jpg` | A glass teapot of hot blackcurrant and orange tea, dark purple-red color, blackcurrants and orange slices inside, steam |

---

## Холодные напитки

### Вода
| Файл | Промт (subject) |
|------|-----------------|
| `zhemchuzhina-baykala.jpg` | An elegant tall clear glass bottle of premium still mineral water, cold condensation droplets, minimalist label-free bottle, on a dark reflective surface |

> Позиция «Жемчужина Байкала» — один товар с вариантами «без газа / газированная»,
> поэтому фото одно. Если хочешь отдельный кадр для газированной — добавь в промт
> `with fine rising bubbles`.

### Газировка (рекомендую официальные фото бренда — у AI логотипы искажаются)
| Файл | Что взять |
|------|-----------|
| `coca-cola.jpg` | Официальное фото банки Coca-Cola 0.33 (или вырезать из твоего кадра) |
| `coca-cola-zero.jpg` | Официальное фото банки Coca-Cola Zero 0.33 |
| `sprite.jpg` | Официальное фото банки Sprite 0.33 (или из твоего кадра) |
| `fanta.jpg` | Официальное фото банки Fanta Orange 0.33 (или из твоего кадра) |

Если всё же генерировать — общий промт без бренда:
`A chilled aluminium soda can, condensation droplets, plain unbranded can` (лого потом не будет — на любителя).

### Натуральные лимонады (крафтовый лимонад в прозрачной бутылке, рядом фрукты)
| Файл | Промт (subject) |
|------|-----------------|
| `ananas-oblepiha-grusha.jpg` | A craft lemonade in a clear glass bottle, pale golden-orange, fresh pineapple, sea-buckthorn berries and pear beside it, condensation, fine bubbles |
| `apelsin-klyukva-koritsa.jpg` | A craft lemonade in a clear glass bottle, orange-red, orange slices, cranberries and a cinnamon stick beside it, condensation, fine bubbles |
| `limon-smorodina-lavanda.jpg` | A craft lemonade in a clear glass bottle, pink-red, lemon, currants and a lavender sprig beside it, condensation, fine bubbles |
| `mango-persik-kivi.jpg` | A craft lemonade in a clear glass bottle, golden-yellow, mango, peach and kiwi slices beside it, condensation, fine bubbles |
| `greypfrut-klubnika-ilang-ilang.jpg` | A craft lemonade in a clear glass bottle, blush pink, grapefruit and strawberry slices beside it, a delicate flower, condensation, fine bubbles |

---

## Совет по единообразию
Генерируй все фото **в одном генераторе и с одинаковым STYLE BASE** — так меню
будет выглядеть как единый премиальный набор. Для чаёв держи одинаковый ракурс
(чашка чуть выше центра, пар, тёмный фон), для лимонадов — одинаковую бутылку,
меняя только цвет напитка и фрукты рядом.
