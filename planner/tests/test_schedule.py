import unittest
from datetime import date, timedelta

from planner.data.cycle import CYCLE
from planner.data.recipes import RECIPES
from planner.model import Day
from planner.schedule import check_cycle, day_of, min_repeat_gap, week_index

START = date(2026, 10, 19)  # понедельник
DINNERS = {r.id for r in RECIPES.values() if r.slot == "dinner"}


class WeekIndexTest(unittest.TestCase):
    def test_first_week(self):
        self.assertEqual(week_index(START, START), 0)
        self.assertEqual(week_index(START + timedelta(days=6), START), 0)

    def test_next_weeks_and_wrap(self):
        self.assertEqual(week_index(START + timedelta(days=7), START), 1)
        self.assertEqual(week_index(START + timedelta(days=14), START), 2)
        self.assertEqual(week_index(START + timedelta(days=21), START), 0)
        self.assertEqual(week_index(START + timedelta(days=7 * 100), START), 100 % 3)

    def test_before_start(self):
        # Неделя перед стартом — третья неделя предыдущего цикла.
        self.assertEqual(week_index(START - timedelta(days=1), START), 2)
        self.assertEqual(week_index(START - timedelta(days=7), START), 2)
        self.assertEqual(week_index(START - timedelta(days=8), START), 1)
        self.assertEqual(week_index(START - timedelta(days=21), START), 0)
        self.assertEqual(week_index(date(2026, 10, 13), START), 2)  # неделя перед стартом

    def test_day_of(self):
        w, wd, day = day_of(CYCLE, date(2026, 10, 21), START)
        self.assertEqual((w, wd, day.dinner, day.cook), (0, 2, "D2", True))


class CycleTest(unittest.TestCase):
    def test_cycle_is_valid(self):
        self.assertEqual(check_cycle(CYCLE, DINNERS), [])

    def test_every_dinner_cooked_once(self):
        cooks = [d.dinner for week in CYCLE for d in week if d.cook]
        self.assertEqual(sorted(cooks), sorted(DINNERS))

    def test_cook_days_mon_wed_fri(self):
        for week in CYCLE:
            self.assertEqual([i for i, d in enumerate(week) if d.cook], [0, 2, 4])

    def test_sunday_is_cheat(self):
        for week in CYCLE:
            self.assertTrue(week[6].cheat)

    def test_protein_shake_mon_wed_fri(self):
        for week in CYCLE:
            self.assertEqual([i for i, d in enumerate(week) if d.snack == "S1"], [0, 2, 4])

    def test_no_dinner_repeats_within_21_days(self):
        # Окно с запасом до и после старта, чтобы поймать стык циклов.
        gap = min_repeat_gap(CYCLE, START, START - timedelta(days=60), START + timedelta(days=200))
        self.assertIsNotNone(gap)
        self.assertGreaterEqual(gap, 21)

    def test_detects_repeated_dinner(self):
        broken = (
            (Day("B1", "S1", "D1", cook=True), Day("B1", "S1", "D1"),
             Day("B1", "S1", "D1", cook=True), Day("B1", "S1", "D1"),
             Day(), Day(), Day(cheat=True)),
        )
        self.assertTrue(any("D1" in e for e in check_cycle(broken, {"D1"})))
        gap = min_repeat_gap(broken, START, START, START + timedelta(days=30))
        self.assertLess(gap, 21)


if __name__ == "__main__":
    unittest.main()
