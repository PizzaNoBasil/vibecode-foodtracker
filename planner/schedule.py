"""Расписание: номер недели цикла, день цикла по дате, проверки цикла."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta

from planner.model import Day

Cycle = tuple[tuple[Day, ...], ...]


def week_index(d: date, start: date, weeks: int = 3) -> int:
    """floor((d - start) / 7) mod 3. Для дат до старта тоже даёт 0..2:
    в Python // и % округляют вниз, поэтому отрицательные числа работают сразу."""
    return ((d - start).days // 7) % weeks


def day_of(cycle: Cycle, d: date, start: date) -> tuple[int, int, Day]:
    """(неделя цикла, день недели 0=Пн, день цикла) для даты."""
    w = week_index(d, start, len(cycle))
    wd = d.weekday()
    return w, wd, cycle[w][wd]


def flat(cycle: Cycle) -> list[Day]:
    """Цикл одной лентой из 21 дня."""
    return [day for week in cycle for day in week]


def check_cycle(cycle: Cycle, dinner_ids: set[str]) -> list[str]:
    """Структурные ошибки цикла. Пустой список значит, что всё в порядке.

    Правила: воскресенье cheat day; каждый ужин стоит ровно в одной паре
    «готовим + доедаем» подряд; все ужины из рецептов использованы.
    """
    errors: list[str] = []
    days = flat(cycle)
    for i, day in enumerate(days):
        if i % 7 == 6 and not day.cheat:
            errors.append(f"день {i}: воскресенье должно быть cheat day")
        if day.cheat and (day.breakfast or day.snack or day.dinner):
            errors.append(f"день {i}: в cheat day ничего не планируется")

    cook_days: dict[str, list[int]] = defaultdict(list)
    for i, day in enumerate(days):
        if day.dinner and day.cook:
            cook_days[day.dinner].append(i)
        if day.dinner and not day.cook:
            prev = days[i - 1]
            if prev.dinner != day.dinner or not prev.cook:
                errors.append(f"день {i}: «доедаем» {day.dinner} без готовки накануне")

    for dinner_id in sorted(dinner_ids):
        n = len(cook_days.get(dinner_id, []))
        if n != 1:
            errors.append(f"{dinner_id}: готовится {n} раз за цикл, нужно ровно 1")
        else:
            i = cook_days[dinner_id][0]
            if days[(i + 1) % len(days)].dinner != dinner_id:
                errors.append(f"{dinner_id}: нет второго дня после готовки")
    return errors


def cook_dates(cycle: Cycle, start: date, first: date, last: date) -> dict[str, list[date]]:
    """Даты готовки каждого ужина в календаре между first и last включительно."""
    result: dict[str, list[date]] = defaultdict(list)
    d = first
    while d <= last:
        _, _, day = day_of(cycle, d, start)
        if day.dinner and day.cook:
            result[day.dinner].append(d)
        d += timedelta(days=1)
    return result


def min_repeat_gap(cycle: Cycle, start: date, first: date, last: date) -> int | None:
    """Наименьший интервал в днях между двумя готовками одного ужина.
    None, если ни одно блюдо не повторилось в окне."""
    gaps = [
        (b - a).days
        for dates in cook_dates(cycle, start, first, last).values()
        for a, b in zip(dates, dates[1:])
    ]
    return min(gaps) if gaps else None
