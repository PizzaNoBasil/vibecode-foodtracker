"""Профили, общие настройки и правила, не привязанные к рецептам."""

from planner.model import Macros, Profile, WeekdayRule

PROFILES = {
    "first": Profile(
        id="first",
        default_name="Профиль 1",
        slots=("breakfast", "snack", "dinner"),
        target=Macros(2300, 180, 80, 215),
        day_kcal=2300,
        portion_factor=1.0,
    ),
    "second": Profile(
        id="second",
        default_name="Профиль 2",
        slots=("dinner",),
        target=Macros(850, 0, 0, 0),  # дома только ужин; БЖУ цели нет
        day_kcal=2100,
        portion_factor=0.8,
        work_kcal=1250,
    ),
}

# Одна готовка ужина = 2 порции первого профиля + 2 порции второго.
BATCH_SERVINGS = {"first": 2, "second": 2}

DEFAULT_CYCLE_START = "2026-10-19"  # понедельник

# Банка протеина: 40 скупов по 41 г, один скуп на коктейль П1.
PROTEIN_JAR = {"scoops": 40, "scoop_grams": 41, "recipe": "S1", "warn_below": 6}

WEEKDAY_RULES = (WeekdayRule(5, "Закупка на следующую неделю", link="/shopping", icon="cart"),)

SLOT_TITLES = {"breakfast": "Завтрак", "snack": "Перекус", "dinner": "Ужин"}
WEEKDAYS_SHORT = ("Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс")
