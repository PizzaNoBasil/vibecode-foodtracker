import unittest
from pathlib import Path

from planner.data.photos import PHOTOS
from planner.data.recipes import RECIPES

PUBLIC = Path(__file__).resolve().parents[2] / "public" / "recipes"


class PhotosTest(unittest.TestCase):
    def test_every_recipe_has_photo_files(self):
        for rid in RECIPES:
            self.assertIn(rid, PHOTOS, rid)
            self.assertTrue((PUBLIC / f"{rid}.webp").is_file(), rid)
            self.assertTrue((PUBLIC / f"{rid}-s.webp").is_file(), rid)

    def test_credits_complete(self):
        for rid, p in PHOTOS.items():
            self.assertIn(rid, RECIPES, rid)
            self.assertTrue(p.creator and p.license and p.page.startswith("https://"), rid)


if __name__ == "__main__":
    unittest.main()
