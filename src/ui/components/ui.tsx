// Небольшие общие элементы интерфейса.
import type { ReactNode } from 'react'
import { plan, type Macros, type ProfileId } from '../../plan'
import type { Settings } from '../../state/storage'

export function displayName(settings: Settings, id: ProfileId): string {
  return settings.names[id].trim() || plan.profiles[id].defaultName
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl bg-surface p-5 ${className}`}>{children}</section>
}

export function Chip({ mode }: { mode: 'cook' | 'leftover' | null }) {
  if (!mode) return null
  const cook = mode === 'cook'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
        cook ? 'bg-cook-bg text-cook-ink' : 'bg-left-bg text-left-ink'
      }`}
    >
      {cook ? 'Готовим' : 'Доедаем'}
    </span>
  )
}

export function MacroLine({ m, grams }: { m: Macros; grams?: number }) {
  const parts = [
    grams ? `≈ ${grams} г` : '',
    `${m.kcal} ккал`,
    m.protein || m.fat || m.carbs ? `Б${m.protein} Ж${m.fat} У${m.carbs}` : '',
  ]
  return <span className="text-muted">{parts.filter(Boolean).join(' · ')}</span>
}

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-full bg-raised p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`press min-h-10 flex-auto truncate rounded-full px-2.5 text-[15px] font-medium ${
              active ? 'bg-surface text-ink' : 'text-muted'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Bar({
  label,
  value,
  target,
  unit,
  warnOver = false,
}: {
  label: string
  value: number
  target: number
  unit: string
  warnOver?: boolean // красить красным заметный перебор (для калорий)
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  const over = warnOver && value > target * 1.1
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[15px]">
        <span>{label}</span>
        <span className="text-muted">
          <span className="font-medium text-ink">{value}</span> / {target} {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-track">
        <div
          className={`bar-fill h-full rounded-full ${over ? 'bg-warn-ink' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function ScreenTitle({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <header className="mb-5">
      <h1 className="text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">{title}</h1>
      {sub && <div className="mt-2 text-muted">{sub}</div>}
    </header>
  )
}
