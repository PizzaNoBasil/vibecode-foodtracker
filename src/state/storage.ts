// Состояние устройства в localStorage. Любое чтение и запись может бросить
// исключение (приватный режим, запрет сайта), поэтому всё в try/catch:
// приложение тогда просто работает без памяти между запусками.
import { useCallback, useSyncExternalStore } from 'react'
import { plan, type ProfileId } from '../plan'

const PREFIX = 'meals:'

export function readKey<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeKey(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // нет доступа к хранилищу: значение живёт только в памяти
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ничего
  }
}

export function listKeys(prefix: string): string[] {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length))
    }
    return keys
  } catch {
    return []
  }
}

// Общий кэш и подписчики, чтобы изменение на одном экране сразу видели другие.
const cache = new Map<string, unknown>()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getCached<T>(key: string, fallback: T): T {
  if (!cache.has(key)) cache.set(key, readKey(key, fallback))
  return cache.get(key) as T
}

export function useStored<T>(key: string, fallback: T): [T, (value: T) => void] {
  const value = useSyncExternalStore(subscribe, () => getCached(key, fallback))
  const set = useCallback(
    (next: T) => {
      cache.set(key, next)
      writeKey(key, next)
      listeners.forEach((l) => l())
    },
    [key],
  )
  return [value, set]
}

export function clearStored(key: string): void {
  cache.delete(key)
  removeKey(key)
  listeners.forEach((l) => l())
}

// Настройки

export interface Settings {
  names: Record<ProfileId, string>
  cycleStart: string
  proteinOpened: string | null
}

export const DEFAULT_SETTINGS: Settings = {
  names: { first: plan.profiles.first.defaultName, second: plan.profiles.second.defaultName },
  cycleStart: plan.defaultCycleStart,
  proteinOpened: null,
}

/** Имена из старой версии хранились под другими ключами профилей: переносим их по порядку. */
function migrateNames(names: Record<string, string> | undefined): Partial<Record<ProfileId, string>> {
  if (!names) return {}
  const ids = Object.keys(plan.profiles) as ProfileId[]
  if (ids.some((id) => id in names)) return names
  const values = Object.values(names)
  return Object.fromEntries(ids.map((id, i) => [id, values[i]]).filter(([, v]) => typeof v === 'string'))
}

export function useSettings(): [Settings, (s: Settings) => void] {
  const [stored, set] = useStored<Partial<Settings>>('settings', DEFAULT_SETTINGS)
  // Старые или неполные сохранения дополняем значениями по умолчанию.
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    ...stored,
    names: { ...DEFAULT_SETTINGS.names, ...migrateNames(stored.names) },
  }
  return [settings, set]
}

export function useProfile(): [ProfileId, (p: ProfileId) => void] {
  const [stored, set] = useStored<ProfileId>('profile', 'first')
  // Сохранённое значение могло остаться от старой версии.
  return [stored in plan.profiles ? stored : 'first', set]
}
