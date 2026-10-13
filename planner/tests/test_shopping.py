import unittest

from planner.data.cycle import CYCLE
from planner.data.recipes import RECIPES
from planner.model import Day, Line
from planner.shopping import aggregate, shopping_list


def flat_items(groups, pantry):
    items = {i.id: i for g in groups for i in g.items}
    items.update({i.id: i for i in pantry})
    return items


class AggregateTest(unittest.TestCase):
    def test_sums_by_product(self):
        groups, _ = aggregate([Line("skyr", 200), Line("skyr", 250), Line("milk", 300)])
        items = flat_items(groups, [])
        self.assertEqual(items["skyr"].amount, 450)
        self.assertEqual(items["milk"].amount, 300)

    def test_pieces_rounded_up_after_sum(self):
        # 3,6 + 3,6 = 7,2 луковицы → 8, а не 4 + 4.
        groups, _ = aggregate([Line("onion", 3.6), Line("onion", 3.6)])
        self.assertEqual(flat_items(groups, [])["onion"].amount, 8)

    def test_exact_pieces_not_overrounded(self):
        groups, _ = aggregate([Line("egg", 0.8 * 3 * 2), Line("egg", 1 * 3 * 2)])
        self.assertEqual(flat_items(groups, [])["egg"].amount, 11)  # 4,8 + 6 = 10,8
        groups, _ = aggregate([Line("bun", 0.8 * 2.5)])
        self.assertEqual(flat_items(groups, [])["bun"].amount, 2)  # 2.0000000004 → 2

    def test_amount_none_kept_without_number(self):
        groups, _ = aggregate([Line("herbs"), Line("herbs")])
        self.assertIsNone(flat_items(groups, [])["herbs"].amount)

    def test_pantry_separate_and_protein_excluded(self):
        groups, pantry = aggregate([Line("oil", 10), Line("protein", 41), Line("rice", 100)])
        self.assertEqual([i.id for i in pantry], ["oil"])
        ids = {i.id for g in groups for i in g.items}
        self.assertEqual(ids, {"rice"})

    def test_groups_order(self):
        groups, _ = aggregate([Line("berries", 1), Line("salmon", 1), Line("rice", 1)])
        self.assertEqual([g.id for g in groups], ["meat", "grocery", "frozen"])


class WeekListTest(unittest.TestCase):
    def test_dinner_counted_once_per_batch(self):
        week = (
            Day(dinner="D2", cook=True),
            Day(dinner="D2"),
            Day(), Day(), Day(), Day(), Day(cheat=True),
        )
        items = flat_items(*shopping_list(week, RECIPES))
        self.assertEqual(items["beef_mince"].amount, 900)  # 250 × 3,6
        self.assertEqual(items["onion"].amount, 4)  # 3,6 → 4

    def test_week1_real_numbers(self):
        items = flat_items(*shopping_list(CYCLE[0], RECIPES))
        # Яйца: З2 3 + З3 2 + З5 1 + З5 1 + П4 1 + У1 3×3,6 = 18,8 → 19
        self.assertEqual(items["egg"].amount, 19)
        # Бананы: З4 2 + З2 1 + З5 1 + З5 1 + П1 1×3 + П2 1 + П4 1 = 10
        self.assertEqual(items["banana"].amount, 10)
        # Молоко: З4 350 + П1 300×3 = 1250
        self.assertEqual(items["milk"].amount, 1250)

    def test_burgers_week(self):
        items = flat_items(*shopping_list(CYCLE[2], RECIPES))
        self.assertEqual(items["bun"].amount, 8)
        self.assertEqual(items["beef_mince"].amount, 1040)


if __name__ == "__main__":
    unittest.main()
