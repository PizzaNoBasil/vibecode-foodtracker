"""Командная строка.

    python3 -m planner build              пересобрать src/generated/plan.json
    python3 -m planner day 2026-10-21     что едим и что не забыть в этот день
    python3 -m planner shop 2026-10-19    список покупок на неделю с этой датой
"""

from __future__ import annotations

import sys
from datetime import date

from planner.data.cycle import CYCLE
from planner.data.profiles import DEFAULT_CYCLE_START, PROFILES, SLOT_TITLES, WEEKDAYS_SHORT
from planner.data.recipes import RECIPES
from planner.export import write
from planner.portions import portion_macros
from planner.reminders import reminders_for
from planner.schedule import day_of
from planner.shopping import shopping_list

UNITS = {"g": "г", "ml": "мл", "pcs": "шт", "clove": "зубч."}


def show_day(d: date) -> None:
    start = date.fromisoformat(DEFAULT_CYCLE_START)
    w, wd, day = day_of(CYCLE, d, start)
    print(f"{WEEKDAYS_SHORT[wd]} {d:%d.%m.%Y}, неделя {w + 1} из 3")
    if day.cheat:
        print("  Cheat day")
    for pid, profile in PROFILES.items():
        print(f"  {profile.default_name}:")
        for slot in profile.slots:
            rid = getattr(day, slot)
            if rid:
                m = portion_macros(RECIPES[rid], pid).rounded()
                print(f"    {SLOT_TITLES[slot]}: {RECIPES[rid].title}, {m.kcal:g} ккал")
    for r in reminders_for(CYCLE, RECIPES, w * 7 + wd):
        print(f"  ! {r.text}")


def show_shop(d: date) -> None:
    start = date.fromisoformat(DEFAULT_CYCLE_START)
    w, _, _ = day_of(CYCLE, d, start)
    groups, pantry = shopping_list(CYCLE[w], RECIPES)
    print(f"Покупки, неделя {w + 1} из 3")
    for g in groups:
        print(f"\n{g.title}")
        for i in g.items:
            qty = "" if i.amount is None else f" — {i.amount} {UNITS[i.unit]}"
            print(f"  {i.name}{qty}")
    print("\nПроверить дома")
    for i in pantry:
        print(f"  {i.name}")


def main(argv: list[str]) -> None:
    cmd = argv[0] if argv else "build"
    if cmd == "build":
        print(f"Записано: {write()}")
    elif cmd in ("day", "shop"):
        d = date.fromisoformat(argv[1]) if len(argv) > 1 else date.today()
        (show_day if cmd == "day" else show_shop)(d)
    else:
        print(__doc__)


main(sys.argv[1:])
