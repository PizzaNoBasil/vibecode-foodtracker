import { CaretDown, Check, ShareNetwork } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { addDays, diffDays, formatRange, mondayOf } from '../../logic/dates'
import { formatAmount, shoppingText } from '../../logic/format'
import { dayAt, defaultShoppingMonday } from '../../logic/schedule'
import { plan, type ShoppingItem } from '../../plan'
import { clearStored, listKeys, useSettings, useStored } from '../../state/storage'
import { GROUP_ICONS } from '../components/media'
import { Segmented } from '../components/ui'
import { useToday } from '../useToday'

type Which = 'this' | 'next'

const EMPTY: string[] = []

/** Удаляет отметки недель, которые давно прошли. */
function pruneOldChecks(today: string) {
  for (const key of listKeys('shop:')) {
    const monday = key.slice('shop:'.length)
    if (diffDays(today, monday) > 28) clearStored(key)
  }
}

export function ShoppingScreen() {
  const date = useToday()
  const [settings] = useSettings()
  const thisMonday = mondayOf(date)
  const [which, setWhich] = useState<Which>(() =>
    defaultShoppingMonday(date) === thisMonday ? 'this' : 'next',
  )
  const monday = which === 'this' ? thisMonday : addDays(thisMonday, 7)
  const week = dayAt(monday, settings.cycleStart).week
  const list = plan.shopping[week]
  const [checkedList, setChecked] = useStored<string[]>(`shop:${monday}`, EMPTY)
  const checked = new Set(checkedList)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    pruneOldChecks(date)
  }, [date])

  const toggle = (id: string) => {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setChecked([...next])
  }

  const total = list.groups.reduce((n, g) => n + g.items.length, 0)
  const done = list.groups.reduce((n, g) => n + g.items.filter((i) => checked.has(i.id)).length, 0)
  const range = formatRange(monday, addDays(monday, 5))

  const share = async () => {
    const text = shoppingText(`Покупки на ${range}`, list, checked)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Список покупок', text })
        return
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return
      }
    }
    if (await copyText(text)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">Покупки на {range}</h1>
        <p className="mt-2 text-muted">
          Неделя {week + 1} из 3 · куплено {done} из {total}
        </p>
      </header>

      <Segmented<Which>
        label="Неделя"
        value={which}
        onChange={setWhich}
        options={[
          { value: 'this', label: 'Эта неделя' },
          { value: 'next', label: 'Следующая неделя' },
        ]}
      />

      <div className="mt-4 space-y-3">
        {list.groups.map((g, gi) => (
          <section key={g.id} className="rise rounded-3xl bg-surface p-2" style={{ ['--i' as string]: gi }}>
            <GroupTitle id={g.id} title={g.title} />
            <ul>
              {g.items.map((item) => (
                <ItemRow key={item.id} item={item} checked={checked.has(item.id)} onToggle={toggle} />
              ))}
            </ul>
          </section>
        ))}

        <details className="group rounded-3xl bg-raised p-2">
          <summary className="press flex min-h-12 cursor-pointer list-none items-center justify-between px-3 text-xl font-semibold [&::-webkit-details-marker]:hidden">
            Проверить дома
            <CaretDown size={20} weight="bold" className="transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-3 pb-2 text-muted">Долгие продукты: купить, только если заканчиваются.</p>
          <ul>
            {list.pantry.map((item) => (
              <ItemRow key={item.id} item={item} checked={checked.has(item.id)} onToggle={toggle} />
            ))}
          </ul>
        </details>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={share}
          className="press flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[17px] font-semibold text-accent-ink"
        >
          <ShareNetwork size={22} weight="bold" />
          {copied ? 'Скопировано' : 'Поделиться списком'}
        </button>
        {checked.size > 0 && (
          <button
            type="button"
            onClick={() => setChecked([])}
            className="press min-h-14 rounded-full bg-raised px-6 text-[17px] font-medium"
          >
            Снять отметки
          </button>
        )}
      </div>
    </div>
  )
}

function GroupTitle({ id, title }: { id: string; title: string }) {
  const I = GROUP_ICONS[id]
  return (
    <h2 className="flex items-center gap-2.5 px-3 pt-2 pb-1 text-xl font-semibold">
      {I && <I size={24} weight="duotone" className="text-accent" />}
      {title}
    </h2>
  )
}

function ItemRow({
  item,
  checked,
  onToggle,
}: {
  item: ShoppingItem
  checked: boolean
  onToggle: (id: string) => void
}) {
  const qty = formatAmount(item.amount, item.unit)
  return (
    <li>
      <label className="press flex min-h-13 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 hover:bg-raised/60">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => onToggle(item.id)} />
        <span
          aria-hidden
          className={`grid size-7 shrink-0 place-items-center rounded-lg peer-focus-visible:outline-2 peer-focus-visible:outline-accent ${
            checked ? 'bg-accent text-accent-ink' : 'bg-surface ring-2 ring-muted/45 ring-inset'
          }`}
        >
          {checked && <Check size={18} weight="bold" />}
        </span>
        <span className={`min-w-0 flex-1 text-[17px] ${checked ? 'text-muted line-through' : ''}`}>{item.name}</span>
        {qty && <span className={`shrink-0 font-medium ${checked ? 'text-muted' : ''}`}>{qty}</span>}
      </label>
    </li>
  )
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Старые браузеры и http: копируем через временное поле.
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}
