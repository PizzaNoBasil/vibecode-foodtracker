import unittest

from planner.data.cycle import CYCLE
from planner.data.recipes import RECIPES
from planner.model import Day
from planner.reminders import plural, reminders_for


def texts(cycle, index):
    return [r.text for r in reminders_for(cycle, RECIPES, index)]


def pos(week, weekday):
    return week * 7 + weekday


class RemindersTest(unittest.TestCase):
    def test_eggs_day_before_b3(self):
        # З3 в Чт недели 1 → в Ср «Свари 2 яйца».
        self.assertIn("Свари 2 яйца", texts(CYCLE, pos(0, 2)))

    def test_eggs_on_sunday_before_monday_b3(self):
        # З3 в Пн недели 2 → напоминание в воскресенье недели 1.
        self.assertIn("Свари 2 яйца", texts(CYCLE, pos(0, 6)))

    def test_eggs_day_before_s4(self):
        self.assertIn("Свари 1 яйцо", texts(CYCLE, pos(0, 4)))  # П4 в Сб недели 1

    def test_eggs_summed(self):
        week = (Day(), Day("B3", "S4"), Day(), Day(), Day(), Day(), Day(cheat=True))
        t = texts((week,), 0)
        self.assertIn("Свари 3 яйца", t)
        self.assertEqual(sum("яй" in x for x in t), 1)

    def test_casserole_thursday_only(self):
        self.assertIn("Испечь запеканку на Пт и Сб", texts(CYCLE, pos(1, 3)))
        self.assertFalse(any("запеканк" in x for x in texts(CYCLE, pos(1, 4))))

    def test_cook_day(self):
        t = texts(CYCLE, pos(0, 0))
        self.assertIn("Готовим: Egg fried rice с индейкой на 2 дня, 20 мин", t)
        self.assertFalse(any("Готовим:" in x for x in texts(CYCLE, pos(0, 1))))

    def test_bolognese_second_day(self):
        self.assertIn("Свари свежую пасту к болоньезе", texts(CYCLE, pos(0, 3)))
        self.assertNotIn("Свари свежую пасту к болоньезе", texts(CYCLE, pos(0, 2)))

    def test_burgers_second_day(self):
        self.assertIn("Пожарь вторую половину котлет", texts(CYCLE, pos(2, 1)))

    def test_goulash_day(self):
        self.assertIn("Гуляш тушится 1,5 часа, начни сразу", texts(CYCLE, pos(2, 2)))

    def test_saturday_shopping(self):
        rs = reminders_for(CYCLE, RECIPES, pos(1, 5))
        shop = [r for r in rs if r.text == "Закупка на следующую неделю"]
        self.assertEqual(len(shop), 1)
        self.assertEqual(shop[0].link, "/shopping")

    def test_plural(self):
        forms = ("яйцо", "яйца", "яиц")
        self.assertEqual(
            [plural(n, forms) for n in (1, 2, 4, 5, 11, 12, 21, 22)],
            ["яйцо", "яйца", "яйца", "яиц", "яиц", "яиц", "яйцо", "яйца"],
        )


if __name__ == "__main__":
    unittest.main()
