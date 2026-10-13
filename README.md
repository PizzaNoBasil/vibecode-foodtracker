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
