import { describe, expect, it } from 'vitest'
import { addDays, diffDays, formatRange, isValidISO, mondayOf, weekday, weekIndex } from './dates'
import { dayAt, defaultShoppingMonday, scoopsLeft } from './schedule'
import { plan } from '../plan'

const START = '2026-10-19' // понедельник

describe('weekIndex', () => {
  it('считает недели от старта', () => {
    expect(weekIndex(START, START)).toBe(0)
    expect(weekIndex('2026-10-25', START)).toBe(0)
    expect(weekIndex('2026-10-26', START)).toBe(1)
    expect(weekIndex('2026-11-02', START)).toBe(2)
    expect(weekIndex('2026-11-09', START)).toBe(0)
  })

  it('работает для дат до старта', () => {
    expect(weekIndex('2026-10-18', START)).toBe(2)
    expect(weekIndex('2026-10-13', START)).toBe(2)
    expect(weekIndex('2026-10-11', START)).toBe(1)
    expect(weekIndex('2026-09-28', START)).toBe(0)
  })

  it('не сбивается на переходе на летнее время', () => {
    // В Европе 28.03.2027 переход на летнее время: в сутках 23 часа.
    expect(diffDays('2027-03-29', '2027-03-28')).toBe(1)
    expect(diffDays('2027-03-28', '2027-03-27')).toBe(1)
    expect(diffDays('2027-04-05', START)).toBe(168) // ровно 24 недели
    expect(weekIndex('2027-04-05', START)).toBe(0)
    expect(weekIndex('2027-04-04', START)).toBe(2)
  })
})

describe('даты', () => {
  it('день недели и понедельник', () => {
    expect(weekday(START)).toBe(0)
    expect(weekday('2026-10-25')).toBe(6)
    expect(mondayOf('2026-10-25')).toBe(START)
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
  })

  it('проверка формата', () => {
    expect(isValidISO('2026-10-19')).toBe(true)
    expect(isValidISO('2026-02-30')).toBe(false)
    expect(isValidISO('19.10.2026')).toBe(false)
  })

  it('диапазон', () => {
    expect(formatRange('2026-10-19', '2026-10-24')).toBe('19–24 окт')
    expect(formatRange('2026-10-26', '2026-11-01')).toBe('26 окт – 1 ноя')
  })
})

describe('расписание по датам', () => {
  it('ужин в среду первой недели — болоньезе, готовим', () => {
    const { day } = dayAt('2026-10-21', START)
    expect(day.meals.dinner).toBe('D2')
    expect(day.dinnerMode).toBe('cook')
  })

  it('воскресенье — cheat day', () => {
    expect(dayAt('2026-10-25', START).day.cheat).toBe(true)
  })

  it('с субботы список покупок на следующую неделю', () => {
    expect(defaultShoppingMonday('2026-10-23')).toBe('2026-10-19')
    expect(defaultShoppingMonday('2026-10-24')).toBe('2026-10-26')
    expect(defaultShoppingMonday('2026-10-25')).toBe('2026-10-26')
  })
})

describe('протеин', () => {
  it('3 коктейля в неделю', () => {
    // Открыли в понедельник: Пн, Ср, Пт, затем Пн, Ср → 5 скупов к среде.
    expect(scoopsLeft(START, '2026-10-28', START)).toBe(plan.protein.scoops - 5)
  })

  it('не уходит в минус', () => {
    expect(scoopsLeft('2026-01-05', '2026-12-31', START)).toBe(0)
  })
})
