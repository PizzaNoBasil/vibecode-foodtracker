import unittest

from planner.data.recipes import RECIPES
from planner.portions import (
    batch_lines,
    computed_batch,
    portion_grams,
    portion_lines,
    portion_macros,
)


def amounts(lines):
    return {l.ingredient: l.amount for l in lines}


class PortionTest(unittest.TestCase):
    def test_first_portion_is_recipe(self):
        r = RECIPES["D1"]
        self.assertEqual(amounts(portion_lines(r, "first"))["turkey_mince"], 225)
        self.assertEqual(portion_macros(r, "first"), r.macros)

    def test_second_is_08(self):
        r = RECIPES["D1"]
        a = amounts(portion_lines(r, "second"))
        self.assertAlmostEqual(a["turkey_mince"], 180)
        self.assertAlmostEqual(a["egg"], 2.4)
        m = portion_macros(r, "second")
        self.assertAlmostEqual(m.kcal, 856)
        self.assertAlmostEqual(m.protein, 65.6)

    def test_amount_none_stays_none(self):
        a = amounts(portion_lines(RECIPES["D4"], "second"))
        self.assertIsNone(a["lime"])

    def test_burger_exception(self):
        r = RECIPES["D7"]
        a = amounts(portion_lines(r, "second"))
        self.assertEqual(a["beef_mince"], 220)  # 2 котлеты по 110 г, а не 240
        self.assertEqual(a["bun"], 2)  # булочек столько же
        m = portion_macros(r, "second")
        self.assertEqual((m.kcal, m.protein, m.fat, m.carbs), (870, 76, 28, 77))

    def test_batch_is_two_plus_two(self):
        a = amounts(batch_lines(RECIPES["D2"]))
        self.assertAlmostEqual(a["beef_mince"], 250 * 3.6)
        self.assertAlmostEqual(a["onion"], 3.6)

    def test_burger_batch(self):
        a = amounts(batch_lines(RECIPES["D7"]))
        self.assertEqual(a["beef_mince"], 1040)
        self.assertEqual(a["bun"], 8)
        self.assertEqual(a["cheese_slice"], 8)

    def test_explicit_batches_match_portions(self):
        # Явный состав готовки в данных не должен расходиться с суммой порций.
        for r in RECIPES.values():
            if r.batch is not None:
                explicit = {k: v for k, v in amounts(r.batch).items() if v is not None}
                computed = {k: v for k, v in amounts(computed_batch(r)).items() if v is not None}
                self.assertEqual(explicit.keys(), computed.keys(), r.id)
                for k in explicit:
                    self.assertAlmostEqual(explicit[k], computed[k], msg=f"{r.id} {k}")

    def test_portion_grams(self):
        # 3 яйца по 55 + 50 лаваш + 100 ветчина + 30 сыр + 100 помидор + 120 банан
        self.assertEqual(portion_grams(portion_lines(RECIPES["B2"], "first")), 565)


if __name__ == "__main__":
    unittest.main()
