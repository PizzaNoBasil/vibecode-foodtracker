"""Масштабирование порций.

Количества в рецептах заданы на порцию первого профиля. Порция второго в ужинах
равна ей ×0,8 по всем ингредиентам и КБЖУ, если в рецепте нет явного
поля second (бургеры).
"""

from __future__ import annotations

from planner.data.ingredients import INGREDIENTS
from planner.data.profiles import BATCH_SERVINGS, PROFILES
from planner.model import Line, Macros, Recipe


def scale_lines(lines: tuple[Line, ...], k: float) -> tuple[Line, ...]:
    return tuple(
        Line(l.ingredient, None if l.amount is None else l.amount * k, l.note) for l in lines
    )


def portion_lines(recipe: Recipe, profile_id: str) -> tuple[Line, ...]:
    if profile_id == "second" and recipe.second:
        return recipe.second.lines
    return scale_lines(recipe.lines, PROFILES[profile_id].portion_factor)


def portion_macros(recipe: Recipe, profile_id: str) -> Macros:
    if profile_id == "second" and recipe.second:
        return recipe.second.macros
    return recipe.macros.scaled(PROFILES[profile_id].portion_factor)


def merge_lines(lines: list[Line]) -> tuple[Line, ...]:
    """Склеивает строки одного продукта, сохраняя порядок первого появления.
    Количество None («по вкусу») не мешает сумме остальных строк."""
    order: list[str] = []
    amounts: dict[str, float | None] = {}
    for l in lines:
        if l.ingredient not in amounts:
            order.append(l.ingredient)
            amounts[l.ingredient] = None
        if l.amount is not None:
            amounts[l.ingredient] = (amounts[l.ingredient] or 0) + l.amount
    return tuple(Line(i, amounts[i]) for i in order)


def computed_batch(recipe: Recipe) -> tuple[Line, ...]:
    """Готовка на 2 дня: сумма порций по BATCH_SERVINGS (2 порции первого профиля + 2 второго)."""
    lines: list[Line] = []
    for profile_id, servings in BATCH_SERVINGS.items():
        lines.extend(scale_lines(portion_lines(recipe, profile_id), servings))
    return merge_lines(lines)


def batch_lines(recipe: Recipe) -> tuple[Line, ...]:
    """Состав готовки на 2 дня: явный из рецепта или вычисленный."""
    return recipe.batch if recipe.batch is not None else computed_batch(recipe)


def portion_grams(lines: tuple[Line, ...]) -> float:
    """Примерный вес порции: граммы и миллилитры как есть, штуки через вес штуки."""
    total = 0.0
    for l in lines:
        if l.amount is None:
            continue
        ing = INGREDIENTS[l.ingredient]
        total += l.amount * (ing.piece_grams if ing.unit in ("pcs", "clove") else 1)
    return total
