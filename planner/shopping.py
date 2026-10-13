"""Список покупок на неделю Пн–Сб.

Что попадает в список:
  * завтраки и перекусы первого профиля, по одной порции в день;
  * ужины только в дни готовки, сразу на 2 дня (batch_lines), чтобы второй
    день не посчитать дважды.
Количества суммируются по продукту. Штучные округляются вверх уже после
суммы за неделю, граммы и миллилитры тоже округляются вверх до целого.
"""

from __future__ import annotations

import math

from planner.data.ingredients import GROUP_TITLES, INGREDIENTS
from planner.model import Day, Line, ShoppingGroup, ShoppingItem
from planner.portions import batch_lines, merge_lines, portion_lines

SHOPPING_DAYS = range(6)  # Пн..Сб; воскресенье cheat day


def week_lines(week: tuple[Day, ...], recipes: dict) -> list[Line]:
    lines: list[Line] = []
    for wd in SHOPPING_DAYS:
        day = week[wd]
        if day.cheat:
            continue
        for recipe_id in (day.breakfast, day.snack):
            if recipe_id:
                lines.extend(portion_lines(recipes[recipe_id], "first"))
        if day.dinner and day.cook:
            lines.extend(batch_lines(recipes[day.dinner]))
    return lines


def round_up(amount: float | None) -> int | None:
    """Вверх до целого: и штуки, и граммы. Допуск нужен, потому что
    дробные множители дают 10.000000001 вместо 10."""
    if amount is None:
        return None
    return math.ceil(amount - 1e-9)


def aggregate(lines: list[Line]) -> tuple[list[ShoppingGroup], list[ShoppingItem]]:
    """(группы основного списка, блок «Проверить дома»)."""
    groups = {gid: ShoppingGroup(gid, title) for gid, title in GROUP_TITLES.items()}
    pantry: list[ShoppingItem] = []
    for line in merge_lines(lines):
        ing = INGREDIENTS[line.ingredient]
        if not ing.shopping:
            continue
        item = ShoppingItem(ing.id, ing.name, ing.unit, round_up(line.amount))
        (pantry if ing.pantry else groups[ing.group].items).append(item)

    for g in groups.values():
        g.items.sort(key=lambda i: i.name)
    pantry.sort(key=lambda i: i.name)
    return [g for g in groups.values() if g.items], pantry


def shopping_list(week: tuple[Day, ...], recipes: dict):
    return aggregate(week_lines(week, recipes))
