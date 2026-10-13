"""Трёхнедельный цикл. Дни идут Пн..Вс."""

from planner.model import Day

CHEAT = Day(cheat=True)

CYCLE: tuple[tuple[Day, ...], ...] = (
    (  # Неделя 1
        Day("B1", "S1", "D1", cook=True),
        Day("B4", "S2", "D1"),
        Day("B2", "S1", "D2", cook=True),
        Day("B3", "S3", "D2"),
        Day("B5", "S1", "D3", cook=True),
        Day("B5", "S4", "D3"),
        CHEAT,
    ),
    (  # Неделя 2
        Day("B3", "S1", "D4", cook=True),
        Day("B2", "S3", "D4"),
        Day("B1", "S1", "D5", cook=True),
        Day("B4", "S4", "D5"),
        Day("B5", "S1", "D6", cook=True),
        Day("B5", "S2", "D6"),
        CHEAT,
    ),
    (  # Неделя 3
        Day("B2", "S1", "D7", cook=True),
        Day("B1", "S4", "D7"),
        Day("B3", "S1", "D8", cook=True),
        Day("B4", "S2", "D8"),
        Day("B5", "S1", "D9", cook=True),
        Day("B5", "S3", "D9"),
        CHEAT,
    ),
)
