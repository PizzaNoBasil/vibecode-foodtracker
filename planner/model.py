"""Типы данных планировщика.

Всё описано неизменяемыми dataclass'ами: данные в planner/data только
объявляются, а считают их функции в planner/*.py.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Slot = Literal["breakfast", "snack", "dinner"]
Unit = Literal["g", "ml", "pcs", "clove"]
Group = Literal["meat", "dairy", "produce", "bread", "grocery", "frozen"]
ProfileId = Literal["first", "second"]

@dataclass(frozen=True)
class Macros:
    kcal: float
    protein: float
    fat: float
    carbs: float

    def scaled(self, k: float) -> Macros:
        return Macros(self.kcal * k, self.protein * k, self.fat * k, self.carbs * k)

    def __add__(self, other: Macros) -> Macros:
        return Macros(
            self.kcal + other.kcal,
            self.protein + other.protein,
            self.fat + other.fat,
            self.carbs + other.carbs,
        )

    def rounded(self) -> Macros:
        return Macros(round(self.kcal), round(self.protein), round(self.fat), round(self.carbs))


ZERO = Macros(0, 0, 0, 0)


@dataclass(frozen=True)
class Ingredient:
    """Продукт из справочника. Количества в рецептах ссылаются на него по id."""

    id: str
    name: str
    group: Group
    unit: Unit
    piece_grams: float = 0  # вес одной штуки, чтобы показать порцию в граммах
    pantry: bool = False  # долгий продукт: в блок «Проверить дома»
    shopping: bool = True  # False: в список покупок не попадает (протеин)


@dataclass(frozen=True)
class Line:
    """Строка ингредиента в рецепте. Количество всегда на одну порцию первого профиля.

    amount=None значит «по вкусу»: в списке покупок продукт появится без числа.
    """

    ingredient: str
    amount: float | None = None
    note: str = ""  # пояснение для карточки: «3 ломтика», «при подаче»


@dataclass(frozen=True)
class Prep:
    """Напоминание из рецепта для блока «Не забыть».

    offset: смещение в днях от дня, когда блюдо стоит в расписании
        (-1 накануне, 0 в тот же день).
    when: в какие дни блюда срабатывает правило:
        "any"       каждый день, когда блюдо в расписании;
        "first"     только первый день из идущих подряд (запеканка: Пт и Сб);
        "cook"      день готовки ужина;
        "leftover"  второй день ужина.
    key/qty: напоминания с одинаковым key в один день складываются
        (яйца для З3 и П4 превращаются в одно «Свари 3 яйца»).
    forms: три формы слова для числа qty: («яйцо», «яйца», «яиц»).
    text: шаблон с подстановками:
        {qty}      сумма qty со словом из forms («3 яйца»);
        {run}      дни серии («Пт и Сб»);
        {title}    название блюда;
        {minutes}  время приготовления.
    """

    text: str
    offset: int = 0
    when: Literal["any", "first", "cook", "leftover"] = "any"
    key: str = ""
    qty: float = 0
    forms: tuple[str, str, str] | None = None


@dataclass(frozen=True)
class SecondPortion:
    """Ручная порция второго профиля вместо стандартного коэффициента (бургеры)."""

    macros: Macros
    lines: tuple[Line, ...]


@dataclass(frozen=True)
class Recipe:
    id: str
    code: str  # «З1», «У7»
    slot: Slot
    title: str
    macros: Macros  # на порцию первого профиля
    lines: tuple[Line, ...]
    steps: tuple[str, ...] = ()
    minutes: str = ""
    storage: str = ""
    notes: tuple[str, ...] = ()
    prep: tuple[Prep, ...] = ()
    second: SecondPortion | None = None
    # Явный состав «готовки на 2 дня», если он не равен сумме порций.
    batch: tuple[Line, ...] | None = None


@dataclass(frozen=True)
class Day:
    """Один день цикла. Пустые слоты и cheat=True означают cheat day."""

    breakfast: str | None = None
    snack: str | None = None
    dinner: str | None = None
    cook: bool = False  # в этот день ужин готовится на 2 дня
    cheat: bool = False


@dataclass(frozen=True)
class Profile:
    id: ProfileId
    default_name: str
    slots: tuple[Slot, ...]  # какие приёмы пищи показываем
    target: Macros  # цель на домашнюю еду
    day_kcal: float  # полная дневная норма
    portion_factor: float  # множитель порции ужина относительно первого профиля
    work_kcal: float = 0  # сколько съедается вне дома


@dataclass(frozen=True)
class WeekdayRule:
    """Напоминание, привязанное к дню недели, а не к рецепту (закупка в субботу)."""

    weekday: int  # 0 = Пн
    text: str
    link: str = ""


@dataclass(frozen=True)
class Reminder:
    text: str
    link: str = ""


@dataclass
class ShoppingItem:
    id: str
    name: str
    unit: Unit
    amount: float | None  # None: количество не задано («по вкусу»)


@dataclass
class ShoppingGroup:
    id: str
    title: str
    items: list[ShoppingItem] = field(default_factory=list)
