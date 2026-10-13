"""Фото блюд из открытых коллекций (Wikimedia Commons, Flickr через Openverse).

Файлы лежат в public/recipes: <id>.webp (960×720) и <id>-s.webp (192×192).
Фото иллюстрируют блюдо и обрезаны под формат карточки. Лицензии разрешают
такое использование при указании автора, поэтому автор и ссылка показываются
в карточке рецепта.
"""

from planner.model import Photo

PHOTOS: dict[str, Photo] = {
    "B1": Photo(
        title="SMOKED SALMON TOAST - 17 GRAMS 2025-09-20",
        creator="Andy Li",
        license="CC0",
        license_url="https://creativecommons.org/publicdomain/zero/1.0/deed.en",
        page="https://commons.wikimedia.org/wiki/File:SMOKED_SALMON_TOAST_-_17_GRAMS_2025-09-20.jpg",
    ),
    "B2": Photo(
        title="Breakfast Burrito with Tomato Ketchup - Cafe Traditionale 2026-01-28",
        creator="Andy Li",
        license="CC0",
        license_url="https://creativecommons.org/publicdomain/zero/1.0/deed.en/",
        page="https://commons.wikimedia.org/w/index.php?curid=182842255",
    ),
    "B3": Photo(
        title="Liat Portal for Foodie Disorder - Scrambled Eggs on Whole Grain Toast with Yellow Tomatoes",
        creator="HaJunkiyada",
        license="CC BY-SA 4.0",
        license_url="https://creativecommons.org/licenses/by-sa/4.0/",
        page="https://commons.wikimedia.org/w/index.php?curid=182599031",
    ),
    "B4": Photo(
        title="Banana Smoothie",
        creator="автор не указан",
        license="CC0",
        license_url="https://creativecommons.org/publicdomain/zero/1.0/",
        page="https://www.rawpixel.com/image/5970856/banana-smoothie",
    ),
    "B5": Photo(
        title="Recipes cottage cheese pie named misa",
        creator="FDominec",
        license="CC BY-SA 4.0",
        license_url="https://creativecommons.org/licenses/by-sa/4.0",
        page="https://commons.wikimedia.org/wiki/File:Recipes_cottage_cheese_pie_named_misa.jpg",
    ),
    "S1": Photo(
        title="Protein shake",
        creator="Sandstein",
        license="CC BY 3.0",
        license_url="https://creativecommons.org/licenses/by/3.0/",
        page="https://commons.wikimedia.org/w/index.php?curid=6068429",
    ),
    "S2": Photo(
        title="Summer Desert",
        creator="Anna",
        license="CC BY 3.0",
        license_url="https://creativecommons.org/licenses/by/3.0/",
        page="https://commons.wikimedia.org/w/index.php?curid=71649700",
    ),
    "S3": Photo(
        title="Yoghurt met appelmoes en walnoten 2025",
        creator="JopkeB",
        license="CC BY-SA 4.0",
        license_url="https://creativecommons.org/licenses/by-sa/4.0",
        page="https://commons.wikimedia.org/wiki/File:Yoghurt_met_appelmoes_en_walnoten_2025.jpg",
    ),
    "S4": Photo(
        title="Tuna Salad with sweet corn",
        creator="Adesolive",
        license="CC0",
        license_url="https://creativecommons.org/publicdomain/zero/1.0/deed.en/",
        page="https://commons.wikimedia.org/w/index.php?curid=163926746",
    ),
    "D1": Photo(
        title="Egg Fried Rice from a Chinese Home",
        creator="Tofu fighting",
        license="CC BY-SA 4.0",
        license_url="https://creativecommons.org/licenses/by-sa/4.0/",
        page="https://commons.wikimedia.org/w/index.php?curid=104598082",
    ),
    "D2": Photo(
        title="Spaghetti bolognese (hozinja)",
        creator="hozinja",
        license="CC BY 2.0",
        license_url="https://creativecommons.org/licenses/by/2.0",
        page="https://commons.wikimedia.org/wiki/File:Spaghetti_bolognese_(hozinja).jpg",
    ),
    "D3": Photo(
        title="Fried chicken and roasted potatoes 01",
        creator="Roenashy",
        license="CC BY-SA 4.0",
        license_url="https://creativecommons.org/licenses/by-sa/4.0",
        page="https://commons.wikimedia.org/wiki/File:Fried_chicken_and_roasted_potatoes_01.jpg",
    ),
    "D4": Photo(
        title="Chicken fajitas - La Hacienda - Sarah Stierch",
        creator="Missvain",
        license="CC BY 4.0",
        license_url="https://creativecommons.org/licenses/by/4.0",
        page="https://commons.wikimedia.org/wiki/File:Chicken_fajitas_-_La_Hacienda_-_Sarah_Stierch.jpg",
    ),
    "D5": Photo(
        title="Chili con carne (5034005470)",
        creator="cyclonebill from Copenhagen, Denmark",
        license="CC BY-SA 2.0",
        license_url="https://creativecommons.org/licenses/by-sa/2.0",
        page="https://commons.wikimedia.org/wiki/File:Chili_con_carne_(5034005470).jpg",
    ),
    "D6": Photo(
        title="Гречка (каша)",
        creator="Ijon",
        license="CC BY-SA 4.0",
        license_url="https://creativecommons.org/licenses/by-sa/4.0",
        page="https://commons.wikimedia.org/wiki/File:%D0%93%D1%80%D0%B5%D1%87%D0%BA%D0%B0_(%D0%BA%D0%B0%D1%88%D0%B0).jpg",
    ),
    "D7": Photo(
        title="Double Cheese Cheeseburger",
        creator="Michael Dorausch from Venice",
        license="CC BY-SA 2.0",
        license_url="https://creativecommons.org/licenses/by-sa/2.0",
        page="https://commons.wikimedia.org/wiki/File:Double_Cheese_Cheeseburger.jpg",
    ),
    "D8": Photo(
        title="Goulash ~ Savory beef stew with mushrooms and carrots (44301070064)",
        creator="Prayitno / Thank you for (12 millions +) view from Los Angeles, USA",
        license="CC BY 2.0",
        license_url="https://creativecommons.org/licenses/by/2.0",
        page="https://commons.wikimedia.org/wiki/File:Goulash_~_Savory_beef_stew_with_mushrooms_and_carrots_(44301070064).jpg",
    ),
    "D9": Photo(
        title="Philippine Chicken curry",
        creator="Ramon FVelasquez",
        license="CC BY-SA 3.0",
        license_url="https://creativecommons.org/licenses/by-sa/3.0/",
        page="https://commons.wikimedia.org/w/index.php?curid=21866878",
    ),
}
