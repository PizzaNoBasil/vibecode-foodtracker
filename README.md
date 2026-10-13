# Трекер питания

Пет-проект на вайбкоде для подсчёта калорий и планирования питания: трёхнедельный цикл рецептов с КБЖУ, два профиля с разными порциями, список покупок и напоминания о заготовках. Работает без сервера и без регистрации. Сайт можно добавить на главный экран телефона, после первого открытия он работает и офлайн.

Сайт: https://pizzanobasil.github.io/vibecode-foodtracker/

## Как устроено

```
planner/                Python: все данные и вся логика
  data/                 рецепты, продукты, цикл, профили
  schedule.py           номер недели, проверка цикла и правила 21 дня
  portions.py           порции: ×0,8 для второго профиля, исключение для бургеров, готовка на 2 дня
  shopping.py           список покупок: сумма по продуктам, округление штук
  reminders.py          блок «Не забыть»
  export.py             собирает src/generated/plan.json
  tests/                тесты на unittest
src/                    TypeScript + React: интерфейс
  generated/plan.json   результат Python, не править руками
  logic/                даты, номер недели, остаток протеина (+ тесты Vitest)
  state/storage.ts      localStorage: профиль, настройки, отметки покупок
  ui/                   экраны
```

Расписание повторяется каждые 21 день, поэтому Python заранее считает всё, что зависит от дня цикла: приёмы пищи, итоги КБЖУ, напоминания и списки покупок на каждую из трёх недель. Браузер по дате находит номер недели и день и показывает готовые данные. Расписание вычисляется из даты старта, поэтому на всех устройствах оно одинаковое.

## Запуск локально

Нужны Python 3.10+ и Node.js 22+ (https://nodejs.org/en/download, LTS).

```bash
npm install
```

```bash
npm run dev
```

Откроется http://localhost:5173/vibecode-foodtracker/.

## Как поменять рецепты или расписание

1. Отредактируй файлы в `planner/data/` (`recipes.py`, `cycle.py`, `ingredients.py`).
2. Пересобери данные и прогони тесты:

```bash
npm run data
```

```bash
npm run test:py
```

Посмотреть план из терминала без браузера:

```bash
python3 -m planner day 2026-10-21
```

```bash
python3 -m planner shop 2026-10-19
```

## Тесты и сборка

```bash
npm run test:py
```

```bash
npm test
```

```bash
npm run build
```

## Деплой на GitHub Pages

Деплой запускается сам при пуше в `main`, файл `.github/workflows/deploy.yml`. Workflow прогоняет тесты Python и Vitest, пересобирает `plan.json` и публикует `dist/`.

Один раз в настройках репозитория: Settings → Pages → Build and deployment → Source: **GitHub Actions**.

Если репозиторий переименовать, поменяй `base` в `vite.config.ts` на `/<новое-имя>/`.

## Иконки

Иконки PWA собираются из `public/icon.svg`:

```bash
npm run icons
```

## Фото блюд

Фото взяты из открытых коллекций (Wikimedia Commons, Flickr) и только иллюстрируют блюда. Они уменьшены и обрезаны под карточки. Автор и лицензия каждого фото указаны в карточке рецепта и в таблице ниже. Данные о фото лежат в `planner/data/photos.py`.

| Блюдо | Автор | Лицензия |
|---|---|---|
| З1 Бутерброды с лососем | [Andy Li](https://commons.wikimedia.org/wiki/File:SMOKED_SALMON_TOAST_-_17_GRAMS_2025-09-20.jpg) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| З2 Лаваш-омлет | [Andy Li](https://commons.wikimedia.org/w/index.php?curid=182842255) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.en/) |
| З3 Тосты с творогом и яйцами | [HaJunkiyada](https://commons.wikimedia.org/w/index.php?curid=182599031) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| З4 Смузи | [автор не указан](https://www.rawpixel.com/image/5970856/banana-smoothie) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| З5 Запеканка с бананом | [FDominec](https://commons.wikimedia.org/wiki/File:Recipes_cottage_cheese_pie_named_misa.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| П1 Протеиновый коктейль | [Sandstein](https://commons.wikimedia.org/w/index.php?curid=6068429) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| П2 Творог с ягодами | [Anna](https://commons.wikimedia.org/w/index.php?curid=71649700) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| П3 Скир с яблоком | [JopkeB](https://commons.wikimedia.org/wiki/File:Yoghurt_met_appelmoes_en_walnoten_2025.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| П4 Тунец с хлебцами | [Adesolive](https://commons.wikimedia.org/w/index.php?curid=163926746) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.en/) |
| У1 Egg fried rice с индейкой | [Tofu fighting](https://commons.wikimedia.org/w/index.php?curid=104598082) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| У2 Болоньезе | [hozinja](https://commons.wikimedia.org/wiki/File:Spaghetti_bolognese_(hozinja).jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| У3 Курица с картошкой на противне | [Roenashy](https://commons.wikimedia.org/wiki/File:Fried_chicken_and_roasted_potatoes_01.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| У4 Фахитас с индейкой | [Missvain](https://commons.wikimedia.org/wiki/File:Chicken_fajitas_-_La_Hacienda_-_Sarah_Stierch.jpg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| У5 Чили кон карне | [cyclonebill from Copenhagen, Denmark](https://commons.wikimedia.org/wiki/File:Chili_con_carne_(5034005470).jpg) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |
| У6 Гречка с курицей и грибами | [Ijon](https://commons.wikimedia.org/wiki/File:%D0%93%D1%80%D0%B5%D1%87%D0%BA%D0%B0_(%D0%BA%D0%B0%D1%88%D0%B0).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| У7 Бургеры с говяжьими котлетами | [Michael Dorausch from Venice](https://commons.wikimedia.org/wiki/File:Double_Cheese_Cheeseburger.jpg) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |
| У8 Гуляш с пюре | [Prayitno / Thank you for (12 millions +) view from Los Angeles, USA](https://commons.wikimedia.org/wiki/File:Goulash_~_Savory_beef_stew_with_mushrooms_and_carrots_(44301070064).jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| У9 Курица карри | [Ramon FVelasquez](https://commons.wikimedia.org/w/index.php?curid=21866878) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
