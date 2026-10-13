// Фото блюд и значки. Пути к фото в plan.json относительные: сайт живёт
// в подпапке GitHub Pages, поэтому добавляем BASE_URL.
import {
  Bread,
  Carrot,
  Cheese,
  Coffee,
  CookingPot,
  Cookie,
  Egg,
  Fish,
  Flame,
  ForkKnife,
  Grains,
  Oven,
  ShoppingCart,
  Snowflake,
  Timer,
  type Icon,
} from '@phosphor-icons/react'
import type { Recipe, Slot } from '../../plan'

export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

export const SLOT_ICONS: Record<Slot, Icon> = {
  breakfast: Coffee,
  snack: Cookie,
  dinner: ForkKnife,
}

export const GROUP_ICONS: Record<string, Icon> = {
  meat: Fish,
  dairy: Cheese,
  produce: Carrot,
  bread: Bread,
  grocery: Grains,
  frozen: Snowflake,
}

const REMINDER_ICONS: Record<string, Icon> = {
  egg: Egg,
  pot: CookingPot,
  oven: Oven,
  pan: Flame,
  timer: Timer,
  cart: ShoppingCart,
}

export function ReminderIcon({ name }: { name: string }) {
  const I = REMINDER_ICONS[name]
  return I ? <I size={22} weight="duotone" className="shrink-0 text-accent" /> : null
}

/** Квадратное превью блюда; без фото — значок приёма пищи на тоновой плашке. */
export function Thumb({ recipe, size = 64 }: { recipe: Recipe; size?: number }) {
  const style = { width: size, height: size }
  if (!recipe.photo) {
    const I = SLOT_ICONS[recipe.slot]
    return (
      <span style={style} className="grid shrink-0 place-items-center rounded-2xl bg-raised text-muted">
        <I size={size * 0.42} />
      </span>
    )
  }
  return (
    <img
      src={asset(recipe.photo.thumb)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={style}
      className="shrink-0 rounded-2xl bg-raised object-cover"
    />
  )
}
