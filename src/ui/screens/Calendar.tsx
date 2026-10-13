import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useState } from 'react'
import { addDays, formatRange, mondayOf } from '../../logic/dates'
import { weekDays, type DayInfo } from '../../logic/schedule'
import { plan, type ProfileId } from '../../plan'
import { useProfile, useSettings } from '../../state/storage'
import { Chip } from '../components/ui'
import { href } from '../router'
import { useToday } from '../useToday'

export function CalendarScreen() {
  const date = useToday()
  const [profile] = useProfile()
  const [settings] = useSettings()
  const [monday, setMonday] = useState(() => mondayOf(date))
  const days = weekDays(monday, settings.cycleStart)
  const isCurrent = monday === mondayOf(date)

  return (
    <div>
      <header className="mb-5 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">
            Неделя {days[0].week + 1} из 3
          </h1>
          <p className="mt-2 text-muted">
            {formatRange(monday, addDays(monday, 6))}
            {!isCurrent && (
              <>
                {' · '}
                <button type="button" className="font-medium text-accent" onClick={() => setMonday(mondayOf(date))}>
                  к сегодня
                </button>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Предыдущая неделя"
            onClick={() => setMonday(addDays(monday, -7))}
            className="press grid size-12 place-items-center rounded-full bg-raised"
          >
            <CaretLeft size={22} weight="bold" />
          </button>
          <button
            type="button"
            aria-label="Следующая неделя"
            onClick={() => setMonday(addDays(monday, 7))}
            className="press grid size-12 place-items-center rounded-full bg-raised"
          >
            <CaretRight size={22} weight="bold" />
          </button>
        </div>
      </header>

      <ol className="grid gap-2 md:grid-cols-7">
        {days.map((d, i) => (
          <DayCell key={d.date} info={d} profile={profile} isToday={d.date === date} index={i} />
        ))}
      </ol>
    </div>
  )
}

function DayCell({
  info,
  profile,
  isToday,
  index,
}: {
  info: DayInfo
  profile: ProfileId
  isToday: boolean
  index: number
}) {
  const { day } = info
  const dayNum = Number(info.date.slice(8))
  return (
    <li
      style={{ ['--i' as string]: index }}
      aria-current={isToday ? 'date' : undefined}
      className={`rise rounded-3xl p-4 ${isToday ? 'bg-accent-soft' : day.cheat ? 'bg-raised' : 'bg-surface'}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[19px] font-semibold">
          {plan.weekdays[info.weekday]} {dayNum}
        </span>
        {isToday && <span className="text-[15px] text-accent">сегодня</span>}
        <span className="ml-auto md:hidden">
          <Chip mode={day.dinnerMode} />
        </span>
      </div>
      {day.cheat ? (
        <p className="mt-2 text-[17px] font-medium">Cheat day</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {plan.profiles[profile].slots.map((slot) => {
            const id = day.meals[slot]
            if (!id) return null
            const r = plan.recipes[id]
            return (
              <li key={slot}>
                <a
                  href={href(`/recipes/${id}`)}
                  className="press -mx-2 block rounded-xl px-2 py-1.5 hover:bg-raised"
                >
                  <span className="block text-[13px] text-muted">{plan.slotTitles[slot]}</span>
                  <span className="block leading-snug">{r.title}</span>
                </a>
              </li>
            )
          })}
          <li className="hidden pt-1 md:block">
            <Chip mode={day.dinnerMode} />
          </li>
        </ul>
      )}
    </li>
  )
}
