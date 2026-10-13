// Связка календарных дат с готовыми днями цикла из plan.json.
import { plan, type CycleDay } from '../plan'
import { addDays, diffDays, mondayOf, weekday, weekIndex, type ISODate } from './dates'

export interface DayInfo {
  date: ISODate
  week: number // 0..2
  weekday: number // 0 = Пн
  day: CycleDay
}

export function dayAt(date: ISODate, start: ISODate, cycle = plan.cycle): DayInfo {
  const week = weekIndex(date, start, cycle.length)
  const wd = weekday(date)
  return { date, week, weekday: wd, day: cycle[week][wd] }
}

export function weekDays(monday: ISODate, start: ISODate): DayInfo[] {
  return Array.from({ length: 7 }, (_, i) => dayAt(addDays(monday, i), start))
}

/** Неделя закупки: с субботы показываем следующую. */
export function defaultShoppingMonday(date: ISODate): ISODate {
  const monday = mondayOf(date)
  return weekday(date) >= 5 ? addDays(monday, 7) : monday
}

/**
 * Сколько скупов протеина осталось: банка минус коктейли по расписанию
 * от даты открытия до сегодня включительно.
 */
export function scoopsLeft(
  opened: ISODate,
  date: ISODate,
  start: ISODate,
  jar = plan.protein,
  cycle = plan.cycle,
): number {
  let used = 0
  const days = diffDays(date, opened)
  for (let i = 0; i <= days; i++) {
    if (dayAt(addDays(opened, i), start, cycle).day.meals.snack === jar.recipe) used++
  }
  return Math.max(0, jar.scoops - used)
}
