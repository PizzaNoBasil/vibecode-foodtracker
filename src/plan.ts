// Типы для src/generated/plan.json. Сам файл собирает Python: npm run data.
import raw from './generated/plan.json'

export type Slot = 'breakfast' | 'snack' | 'dinner'
export type ProfileId = 'first' | 'second'
export type Unit = 'g' | 'ml' | 'pcs' | 'clove'

export interface Macros {
  kcal: number
  protein: number
  fat: number
  carbs: number
}

export interface IngredientLine {
  id: string
  name: string
  unit: Unit
  amount: number | null
  note: string
}

export interface Portion {
  macros: Macros
  grams: number
  lines: IngredientLine[]
}

export interface Recipe {
  id: string
  code: string
  slot: Slot
  title: string
  minutes: string
  steps: string[]
  storage: string
  notes: string[]
  portions: { first: Portion; second?: Portion; batch?: Portion }
  photo: Photo | null
}

export interface Photo {
  src: string
  thumb: string
  title: string
  creator: string
  license: string
  licenseUrl: string
  page: string
}

export interface Reminder {
  text: string
  link: string
  icon: string
}

export interface CycleDay {
  cheat: boolean
  meals: Record<Slot, string | null>
  dinnerMode: 'cook' | 'leftover' | null
  totals: Record<ProfileId, Macros>
  reminders: Reminder[]
}

export interface ShoppingItem {
  id: string
  name: string
  unit: Unit
  amount: number | null
}

export interface ShoppingWeek {
  groups: { id: string; title: string; items: ShoppingItem[] }[]
  pantry: ShoppingItem[]
}

export interface Profile {
  id: ProfileId
  defaultName: string
  slots: Slot[]
  target: Macros
  dayKcal: number
  workKcal: number
}

export interface Plan {
  version: number
  defaultCycleStart: string
  weekdays: string[]
  slotTitles: Record<Slot, string>
  profiles: Record<ProfileId, Profile>
  protein: { scoops: number; scoopGrams: number; recipe: string; warnBelow: number }
  recipes: Record<string, Recipe>
  cycle: CycleDay[][]
  shopping: ShoppingWeek[]
}

export const plan = raw as Plan
