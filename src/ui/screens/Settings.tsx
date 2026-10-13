import { useState, type ReactNode } from 'react'
import { isValidISO, mondayOf, weekday } from '../../logic/dates'
import { dayAt } from '../../logic/schedule'
import type { ProfileId } from '../../plan'
import { clearStored, DEFAULT_SETTINGS, listKeys, useSettings } from '../../state/storage'
import { Card } from '../components/ui'
import { useToday } from '../useToday'

const input = 'min-h-12 w-full rounded-2xl bg-raised px-4 text-[17px] text-ink'

function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[15px] text-muted">{hint}</span>}
    </label>
  )
}

export function SettingsScreen() {
  const date = useToday()
  const [settings, setSettings] = useSettings()
  const [startNote, setStartNote] = useState('')
  const [cleared, setCleared] = useState(false)
  const week = dayAt(date, settings.cycleStart).week

  const setName = (id: ProfileId, name: string) =>
    setSettings({ ...settings, names: { ...settings.names, [id]: name } })

  const setStart = (value: string) => {
    if (!isValidISO(value)) return
    // Неделя цикла начинается с понедельника, поэтому дату сдвигаем на него.
    const monday = mondayOf(value)
    setStartNote(weekday(value) === 0 ? '' : 'Дата сдвинута на понедельник этой недели.')
    setSettings({ ...settings, cycleStart: monday })
  }

  const clearChecks = () => {
    listKeys('shop:').forEach(clearStored)
    setCleared(true)
  }

  return (
    <div>
      <h1 className="mb-5 text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">Настройки</h1>
      <div className="space-y-3">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Имена</h2>
          <div className="space-y-4">
            <Field label="Первый профиль, три приёма пищи">
              <input
                className={input}
                value={settings.names.first}
                placeholder={DEFAULT_SETTINGS.names.first}
                onChange={(e) => setName('first', e.target.value)}
              />
            </Field>
            <Field label="Второй профиль, только ужин">
              <input
                className={input}
                value={settings.names.second}
                placeholder={DEFAULT_SETTINGS.names.second}
                onChange={(e) => setName('second', e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Цикл</h2>
          <Field
            label="Начало первой недели"
            hint={startNote || `Сейчас неделя ${week + 1} из 3. На всех устройствах дата должна совпадать.`}
          >
            <input
              type="date"
              className={input}
              value={settings.cycleStart}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          {settings.cycleStart !== DEFAULT_SETTINGS.cycleStart && (
            <button
              type="button"
              onClick={() => setSettings({ ...settings, cycleStart: DEFAULT_SETTINGS.cycleStart })}
              className="press mt-3 min-h-11 rounded-full bg-raised px-4 font-medium"
            >
              Вернуть 19 октября 2026
            </button>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Протеин</h2>
          <Field label="Банку открыли" hint="Остаток считается по коктейлям в расписании с этой даты.">
            <input
              type="date"
              className={input}
              value={settings.proteinOpened ?? ''}
              onChange={(e) =>
                setSettings({ ...settings, proteinOpened: isValidISO(e.target.value) ? e.target.value : null })
              }
            />
          </Field>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, proteinOpened: date })}
            className="press mt-3 min-h-11 rounded-full bg-accent px-5 font-semibold text-accent-ink"
          >
            Открыли новую сегодня
          </button>
        </Card>

        <Card className="bg-raised">
          <h2 className="mb-2 text-xl font-semibold">Список покупок</h2>
          <p className="text-muted">Отметки хранятся только на этом устройстве.</p>
          <button
            type="button"
            onClick={clearChecks}
            className="press mt-3 min-h-11 rounded-full bg-surface px-4 font-medium"
          >
            {cleared ? 'Отметки сброшены' : 'Сбросить все отметки'}
          </button>
        </Card>
      </div>
    </div>
  )
}
