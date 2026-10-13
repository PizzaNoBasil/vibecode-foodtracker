"""Сборка src/generated/plan.json для интерфейса.

Расписание повторяется каждые 21 день, поэтому всё, что зависит от дня
цикла (приёмы пищи, итоги, напоминания, список покупок), считается здесь
заранее. Браузеру остаётся найти по дате номер недели и день недели.
"""

from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from planner.data.cycle import CYCLE
from planner.data.ingredients import INGREDIENTS
from planner.data.profiles import (
    BATCH_SERVINGS,
    DEFAULT_CYCLE_START,
    PROFILES,
    PROTEIN_JAR,
    SLOT_TITLES,
    WEEKDAYS_SHORT,
)
from planner.data.photos import PHOTOS
from planner.data.recipes import RECIPES
from planner.model import ZERO, Line, Macros, Recipe
from planner.portions import batch_lines, portion_grams, portion_lines, portion_macros
from planner.reminders import reminders_for
from planner.schedule import check_cycle
from planner.shopping import shopping_list

OUT = Path(__file__).resolve().parent.parent / "src" / "generated" / "plan.json"


def macros_json(m: Macros) -> dict:
    m = m.rounded()
    return {"kcal": m.kcal, "protein": m.protein, "fat": m.fat, "carbs": m.carbs}


def amount_json(x: float | None) -> float | None:
    """Количества для карточки рецепта: целые без хвоста, дробные до 0,1."""
    if x is None:
        return None
    return int(round(x)) if abs(x - round(x)) < 0.05 else round(x, 1)


def lines_json(lines: tuple[Line, ...]) -> list[dict]:
    return [
        {
            "id": l.ingredient,
            "name": INGREDIENTS[l.ingredient].name,
            "unit": INGREDIENTS[l.ingredient].unit,
            "amount": amount_json(l.amount),
            "note": l.note,
        }
        for l in lines
    ]


def portion_json(recipe: Recipe, profile_id: str) -> dict:
    lines = portion_lines(recipe, profile_id)
    return {
        "macros": macros_json(portion_macros(recipe, profile_id)),
        "grams": round(portion_grams(lines)),
        "lines": lines_json(lines),
    }


def recipe_json(recipe: Recipe) -> dict:
    portions = {"first": portion_json(recipe, "first")}
    if recipe.slot == "dinner":
        portions["second"] = portion_json(recipe, "second")
        batch_macros = ZERO
        for pid, servings in BATCH_SERVINGS.items():
            batch_macros = batch_macros + portion_macros(recipe, pid).scaled(servings)
        portions["batch"] = {
            "macros": macros_json(batch_macros),
            "grams": round(portion_grams(batch_lines(recipe))),
            "lines": lines_json(batch_lines(recipe)),
        }
    return {
        "id": recipe.id,
        "code": recipe.code,
        "slot": recipe.slot,
        "title": recipe.title,
        "minutes": recipe.minutes,
        "steps": list(recipe.steps),
        "storage": recipe.storage,
        "notes": list(recipe.notes),
        "portions": portions,
        "photo": photo_json(recipe.id),
    }


def photo_json(recipe_id: str) -> dict | None:
    photo = PHOTOS.get(recipe_id)
    if photo is None:
        return None
    return {
        "src": f"recipes/{recipe_id}.webp",
        "thumb": f"recipes/{recipe_id}-s.webp",
        "title": photo.title,
        "creator": photo.creator,
        "license": photo.license,
        "licenseUrl": photo.license_url,
        "page": photo.page,
    }


def day_json(week: int, weekday: int) -> dict:
    day = CYCLE[week][weekday]
    meals = {"breakfast": day.breakfast, "snack": day.snack, "dinner": day.dinner}
    totals = {}
    for pid, profile in PROFILES.items():
        total = ZERO
        for slot in profile.slots:
            if meals[slot]:
                total = total + portion_macros(RECIPES[meals[slot]], pid)
        totals[pid] = macros_json(total)
    return {
        "cheat": day.cheat,
        "meals": meals,
        "dinnerMode": (None if not day.dinner else "cook" if day.cook else "leftover"),
        "totals": totals,
        "reminders": [asdict(r) for r in reminders_for(CYCLE, RECIPES, week * 7 + weekday)],
    }


def shopping_json(week: int) -> dict:
    groups, pantry = shopping_list(CYCLE[week], RECIPES)
    return {
        "groups": [{"id": g.id, "title": g.title, "items": [asdict(i) for i in g.items]} for g in groups],
        "pantry": [asdict(i) for i in pantry],
    }


def build() -> dict:
    errors = check_cycle(CYCLE, {r.id for r in RECIPES.values() if r.slot == "dinner"})
    if errors:
        raise ValueError("Ошибки в цикле:\n" + "\n".join(errors))
    return {
        "version": 1,
        "defaultCycleStart": DEFAULT_CYCLE_START,
        "weekdays": list(WEEKDAYS_SHORT),
        "slotTitles": SLOT_TITLES,
        "profiles": {
            pid: {
                "id": p.id,
                "defaultName": p.default_name,
                "slots": list(p.slots),
                "target": macros_json(p.target),
                "dayKcal": p.day_kcal,
                "workKcal": p.work_kcal,
            }
            for pid, p in PROFILES.items()
        },
        "protein": {
            "scoops": PROTEIN_JAR["scoops"],
            "scoopGrams": PROTEIN_JAR["scoop_grams"],
            "recipe": PROTEIN_JAR["recipe"],
            "warnBelow": PROTEIN_JAR["warn_below"],
        },
        "recipes": {rid: recipe_json(r) for rid, r in RECIPES.items()},
        "cycle": [[day_json(w, d) for d in range(7)] for w in range(len(CYCLE))],
        "shopping": [shopping_json(w) for w in range(len(CYCLE))],
    }


def write(path: Path = OUT) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(build(), ensure_ascii=False, indent=1)
    path.write_text(text + "\n", encoding="utf-8")
    return path
