"""Блок «Не забыть».

Напоминания берутся из поля prep рецептов и из WEEKDAY_RULES. Цикл
повторяется, поэтому день считается позицией 0..20 в ленте цикла, а «завтра»
после последнего воскресенья цикла — понедельник первой недели.
"""

from __future__ import annotations

from planner.data.profiles import WEEKDAY_RULES, WEEKDAYS_SHORT
from planner.model import Day, Prep, Recipe, Reminder
from planner.schedule import Cycle, flat

# Ужин первым: готовка — самое большое дело дня.
SLOTS = ("dinner", "breakfast", "snack")


def plural(n: int, forms: tuple[str, str, str]) -> str:
    """1 яйцо, 2 яйца, 5 яиц."""
    if n % 10 == 1 and n % 100 != 11:
        return forms[0]
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return forms[1]
    return forms[2]


def applies(prep: Prep, slot: str, days: list[Day], i: int) -> bool:
    """Срабатывает ли правило для блюда в слоте slot дня i."""
    day = days[i]
    if prep.when == "cook":
        return slot == "dinner" and day.cook
    if prep.when == "leftover":
        return slot == "dinner" and not day.cook
    if prep.when == "first":
        return getattr(days[i - 1], slot) != getattr(day, slot)
    return True


def run_days(days: list[Day], i: int, slot: str) -> str:
    """Дни подряд, начиная с i, с тем же блюдом в слоте: «Пт и Сб»."""
    recipe_id = getattr(days[i], slot)
    names = []
    j = i
    while getattr(days[j % len(days)], slot) == recipe_id and len(names) < 7:
        names.append(WEEKDAYS_SHORT[j % 7])
        j += 1
    return " и ".join(names) if len(names) <= 2 else ", ".join(names)


def render(prep: Prep, recipe: Recipe, qty: float, run: str) -> Reminder:
    n = int(round(qty))
    qty_text = f"{n} {plural(n, prep.forms)}" if prep.forms else str(n)
    text = prep.text.format(qty=qty_text, run=run, title=recipe.title, minutes=recipe.minutes)
    return Reminder(text, icon=prep.icon)


def reminders_for(cycle: Cycle, recipes: dict[str, Recipe], index: int) -> list[Reminder]:
    """Напоминания на день с позицией index (0..20) в ленте цикла.

    Правило со смещением offset показывается в день (день блюда + offset),
    поэтому для каждого offset смотрим блюда дня index - offset.
    Сначала дела на сегодня (offset 0), потом подготовка к завтра.
    """
    days = flat(cycle)
    offsets = sorted({p.offset for r in recipes.values() for p in r.prep}, reverse=True)
    # Порядок вывода: обычные напоминания как есть, суммируемые по ключу
    # стоят там, где ключ встретился первым.
    order: list[Reminder | str] = []
    summed: dict[str, tuple[Prep, Recipe, float, str]] = {}

    for offset in offsets:
        src = (index - offset) % len(days)
        for slot in SLOTS:
            recipe_id = getattr(days[src], slot)
            if not recipe_id:
                continue
            recipe = recipes[recipe_id]
            for prep in recipe.prep:
                if prep.offset != offset or not applies(prep, slot, days, src):
                    continue
                run = run_days(days, src, slot)
                if not prep.key:
                    order.append(render(prep, recipe, prep.qty, run))
                elif prep.key in summed:
                    first, first_recipe, qty, first_run = summed[prep.key]
                    summed[prep.key] = (first, first_recipe, qty + prep.qty, first_run)
                else:
                    summed[prep.key] = (prep, recipe, prep.qty, run)
                    order.append(prep.key)

    result = [render(*summed[x]) if isinstance(x, str) else x for x in order]
    weekday = index % 7
    result.extend(Reminder(r.text, r.link, r.icon) for r in WEEKDAY_RULES if r.weekday == weekday)
    return result
