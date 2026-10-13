import { ArrowRight, BellSimple, Briefcase, Confetti } from '@phosphor-icons/react'
import { addDays } from '../../logic/dates'
import { dayAt, scoopsLeft } from '../../logic/schedule'
import { plan, type ProfileId, type Reminder } from '../../plan'
import { useProfile, useSettings } from '../../state/storage'
import { asset, ReminderIcon, Thumb } from '../components/media'
import { Bar, Card, Chip, MacroLine } from '../components/ui'
import { href } from '../router'
import { useToday } from '../useToday'

const DATE_FMT = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function TodayScreen() {
  const date = useToday()
  const [profile] = useProfile()
  const [settings] = useSettings()
  const info = dayAt(date, settings.cycleStart)
  const tomorrow = dayAt(addDays(date, 1), settings.cycleStart)
  const title = capitalize(DATE_FMT.format(new Date(`${date}T12:00:00`)))

  return (
    <div className="space-y-4">
      <header className="mb-2">
        <h1 className="text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">{title}</h1>
        <p className="mt-2 text-muted">Неделя {info.week + 1} из 3</p>
      </header>

      {info.day.cheat ? <CheatDay /> : <Meals profile={profile} date={date} start={settings.cycleStart} />}

      {profile === 'first' && <ProteinWidget date={date} />}

      <Card className="rise [--i:3]">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <BellSimple size={22} weight="bold" className="text-accent" /> Не забыть
        </h2>
        <ReminderList title="Сегодня" items={info.day.reminders} />
        <ReminderList title="Завтра" items={tomorrow.day.reminders} />
      </Card>
    </div>
  )
}

function CheatDay() {
  return (
    <section className="rise rounded-3xl bg-cook-bg p-6 text-cook-ink">
      <Confetti size={40} weight="duotone" />
      <h2 className="mt-3 text-[40px] leading-none font-semibold tracking-[-0.03em]">Cheat day</h2>
      <p className="mt-3 text-[17px]">Сегодня ничего не планируем. Ешьте что хочется.</p>
    </section>
  )
}

function Meals({ profile, date, start }: { profile: ProfileId; date: string; start: string }) {
  const { day } = dayAt(date, start)
  const p = plan.profiles[profile]
  const total = day.totals[profile]

  return (
    <>
      <div className="space-y-2">
        {p.slots.map((slot, i) => {
          const id = day.meals[slot]
          if (!id) return null
          const r = plan.recipes[id]
          const portion = r.portions[profile] ?? r.portions.first
          // Ужин — главный приём, у него фото во всю ширину; остальные с превью слева.
          const hero = slot === 'dinner' && r.photo
          return (
            <a
              key={slot}
              href={href(`/recipes/${id}`)}
              style={{ ['--i' as string]: i }}
              className="press rise block overflow-hidden rounded-3xl bg-surface"
            >
              {hero && (
                <img
                  src={asset(r.photo!.src)}
                  alt={r.title}
                  className="aspect-[16/9] w-full bg-raised object-cover"
                  decoding="async"
                />
              )}
              <div className="flex items-center gap-4 p-4">
                {!hero && <Thumb recipe={r} size={72} />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[15px] text-muted">
                    {plan.slotTitles[slot]}
                    {slot === 'dinner' && <Chip mode={day.dinnerMode} />}
                  </div>
                  <div className="mt-0.5 text-[19px] leading-snug font-semibold">{r.title}</div>
                  <div className="mt-1 text-[15px]">
                    <MacroLine m={portion.macros} grams={portion.grams} />
                  </div>
                </div>
                <ArrowRight size={20} className="shrink-0 text-muted" />
              </div>
            </a>
          )
        })}
      </div>

      {profile === 'second' && (
        <div className="rise flex items-center gap-3 rounded-3xl bg-raised p-5 [--i:1]">
          <Briefcase size={24} className="shrink-0 text-muted" />
          <span className="text-[17px]">Остальное на работе, ~{p.workKcal}{'\u00a0'}ккал</span>
        </div>
      )}

      <Card className="rise [--i:2]">
        <div className="flex items-baseline gap-2">
          <span className="text-[44px] leading-none font-semibold tracking-[-0.03em]">{total.kcal}</span>
          <span className="text-muted">
            из {p.target.kcal} ккал{profile === 'second' ? ' дома' : ''}
          </span>
        </div>
        <div className="mt-5 space-y-4">
          <Bar label="Калории" value={total.kcal} target={p.target.kcal} unit="ккал" warnOver />
          {p.target.protein > 0 && (
            <>
              <Bar label="Белки" value={total.protein} target={p.target.protein} unit="г" />
              <Bar label="Жиры" value={total.fat} target={p.target.fat} unit="г" />
              <Bar label="Углеводы" value={total.carbs} target={p.target.carbs} unit="г" />
            </>
          )}
        </div>
        {profile === 'second' && (
          <p className="mt-4 text-muted">
            За день вместе с работой ≈ {total.kcal + p.workKcal} из {p.dayKcal} ккал
          </p>
        )}
      </Card>
    </>
  )
}

function ProteinWidget({ date }: { date: string }) {
  const [settings] = useSettings()
  const jar = plan.protein
  if (!settings.proteinOpened) {
    return (
      <a href={href('/settings')} className="press rise flex items-center gap-4 rounded-3xl bg-surface p-5 [--i:2]">
        <div className="flex-1">
          <div className="text-[19px] font-semibold">Протеин</div>
          <div className="text-muted">Укажи дату открытия банки, чтобы считать остаток</div>
        </div>
        <ArrowRight size={20} className="text-muted" />
      </a>
    )
  }
  const left = scoopsLeft(settings.proteinOpened, date, settings.cycleStart)
  const low = left < jar.warnBelow
  return (
    <section className={`rise rounded-3xl p-5 [--i:2] ${low ? 'bg-warn-bg text-warn-ink' : 'bg-surface'}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[19px] font-semibold">Протеин</h2>
        <span className={low ? '' : 'text-muted'}>банка {jar.scoops} скупов</span>
      </div>
      <p className="mt-1 text-[17px]">
        Осталось ≈ <span className="font-semibold">{left}</span> {portionsWord(left)}
      </p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-track">
        <div
          className={`bar-fill h-full rounded-full ${low ? 'bg-warn-ink' : 'bg-accent'}`}
          style={{ width: `${(left / jar.scoops) * 100}%` }}
        />
      </div>
      {low && <p className="mt-3 font-medium">Пора купить новую банку</p>}
    </section>
  )
}

function portionsWord(n: number) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'порция'
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'порции'
  return 'порций'
}

function ReminderList({ title, items }: { title: string; items: Reminder[] }) {
  return (
    <div className="mt-4">
      <h3 className="text-[15px] text-muted">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-muted">Ничего заранее</p>
      ) : (
        <ul className="mt-1.5 space-y-1.5">
          {items.map((r) => (
            <li key={r.text}>
              {r.link ? (
                <a
                  href={href(r.link)}
                  className="press flex min-h-12 items-center gap-3 rounded-2xl bg-accent-soft px-4 py-2.5 font-medium"
                >
                  <ReminderIcon name={r.icon} />
                  <span className="flex-1">{r.text}</span>
                  <ArrowRight size={18} className="shrink-0" />
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-raised px-4 py-2.5 text-[17px]">
                  <ReminderIcon name={r.icon} />
                  <span>{r.text}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
