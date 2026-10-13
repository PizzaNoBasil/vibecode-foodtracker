"""Справочник продуктов.

unit задаёт, в чём продукт считается в рецептах и в списке покупок.
Штучные (pcs) и зубчики (clove) в списке покупок округляются вверх.
"""

from planner.model import Ingredient

GROUP_TITLES = {
    "meat": "Мясо и рыба",
    "dairy": "Молочное и яйца",
    "produce": "Овощи и фрукты",
    "bread": "Хлеб",
    "grocery": "Бакалея",
    "frozen": "Заморозка",
}

_ALL = [
    # Мясо и рыба
    Ingredient("salmon", "Лосось слабосолёный", "meat", "g"),
    Ingredient("turkey_ham", "Ветчина из индейки", "meat", "g"),
    Ingredient("turkey_mince", "Фарш индейки", "meat", "g"),
    Ingredient("turkey_fillet", "Филе индейки", "meat", "g"),
    Ingredient("beef_mince", "Говяжий фарш 5%", "meat", "g"),
    Ingredient("beef_shoulder", "Говядина постная (лопатка)", "meat", "g"),
    Ingredient("chicken_breast", "Куриная грудка", "meat", "g"),
    Ingredient("tuna", "Тунец в собственном соку, банка", "meat", "pcs", piece_grams=120),
    # Молочное и яйца
    Ingredient("egg", "Яйца", "dairy", "pcs", piece_grams=55),
    Ingredient("skyr", "Скир", "dairy", "g"),
    Ingredient("cottage_cheese", "Творог 5%", "dairy", "g"),
    Ingredient("cream_cheese", "Творожный сыр лёгкий", "dairy", "g"),
    Ingredient("cheese", "Сыр", "dairy", "g"),
    Ingredient("cheese_slice", "Сыр в ломтиках", "dairy", "pcs", piece_grams=20),
    Ingredient("parmesan", "Пармезан", "dairy", "g"),
    Ingredient("milk", "Молоко 1,5%", "dairy", "ml"),
    Ingredient("sour_cream", "Сметана 15%", "dairy", "g"),
    Ingredient("butter", "Масло сливочное", "dairy", "g", pantry=True),
    # Овощи и фрукты
    Ingredient("banana", "Бананы", "produce", "pcs", piece_grams=120),
    Ingredient("apple", "Яблоки", "produce", "pcs", piece_grams=150),
    Ingredient("cucumber", "Огурцы", "produce", "g"),
    Ingredient("tomato", "Помидоры", "produce", "pcs", piece_grams=100),
    Ingredient("onion", "Лук репчатый", "produce", "pcs", piece_grams=75),
    Ingredient("garlic", "Чеснок", "produce", "clove", piece_grams=5),
    Ingredient("herbs", "Зелень", "produce", "g"),
    Ingredient("lettuce", "Салат листовой", "produce", "g"),
    Ingredient("potato", "Картофель", "produce", "g"),
    Ingredient("carrot", "Морковь", "produce", "g"),
    Ingredient("bell_pepper", "Перец болгарский", "produce", "g"),
    Ingredient("zucchini", "Кабачок", "produce", "g"),
    Ingredient("mushrooms", "Шампиньоны", "produce", "g"),
    Ingredient("avocado", "Авокадо", "produce", "g"),
    Ingredient("lime", "Лайм", "produce", "pcs", piece_grams=60),
    # Хлеб
    Ingredient("rye_bread", "Хлеб ржаной", "bread", "g"),
    Ingredient("wholegrain_bread", "Хлеб цельнозерновой", "bread", "g"),
    Ingredient("lavash", "Лаваш тонкий, листы", "bread", "pcs", piece_grams=50),
    Ingredient("tortilla", "Тортильи цельнозерновые", "bread", "pcs", piece_grams=40),
    Ingredient("bun", "Булочки цельнозерновые", "bread", "pcs", piece_grams=70),
    Ingredient("crispbread", "Хлебцы", "bread", "pcs", piece_grams=10),
    # Бакалея
    Ingredient("rice", "Рис", "grocery", "g"),
    Ingredient("pasta", "Паста", "grocery", "g"),
    Ingredient("buckwheat", "Гречка", "grocery", "g"),
    Ingredient("canned_tomatoes", "Томаты в собственном соку", "grocery", "g"),
    Ingredient("red_beans", "Фасоль красная консервированная", "grocery", "g"),
    Ingredient("coconut_milk", "Кокосовое молоко лёгкое", "grocery", "ml"),
    Ingredient("salsa", "Сальса", "grocery", "g"),
    Ingredient("walnuts", "Грецкие орехи", "grocery", "g"),
    Ingredient("pickles", "Огурцы маринованные", "grocery", "g"),
    Ingredient("protein", "Протеин Platinum Hydrowhey", "grocery", "g", shopping=False),
    # Бакалея: долгие продукты, «Проверить дома»
    Ingredient("oil", "Масло растительное", "grocery", "g", pantry=True),
    Ingredient("soy_sauce", "Соевый соус", "grocery", "ml", pantry=True),
    Ingredient("spices", "Специи", "grocery", "g", pantry=True),
    Ingredient("curry_paste", "Паста карри", "grocery", "g", pantry=True),
    Ingredient("honey", "Мёд", "grocery", "g", pantry=True),
    Ingredient("peanut_butter", "Арахисовая паста", "grocery", "g", pantry=True),
    Ingredient("ketchup", "Кетчуп", "grocery", "g", pantry=True),
    Ingredient("mustard", "Горчица", "grocery", "g", pantry=True),
    Ingredient("flour", "Мука", "grocery", "g", pantry=True),
    Ingredient("semolina", "Манка", "grocery", "g", pantry=True),
    Ingredient("tomato_paste", "Томатная паста", "grocery", "g", pantry=True),
    # Заморозка
    Ingredient("berries", "Ягоды замороженные", "frozen", "g"),
    Ingredient("veg_mix", "Смесь овощей (горошек, морковь, кукуруза)", "frozen", "g"),
    Ingredient("peas", "Горошек замороженный", "frozen", "g"),
]

INGREDIENTS: dict[str, Ingredient] = {i.id: i for i in _ALL}
