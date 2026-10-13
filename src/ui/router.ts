// Маршруты в hash (#/recipes/D1): GitHub Pages не знает о путях приложения,
// а hash не уходит на сервер, поэтому обновление страницы не даёт 404.
import { useSyncExternalStore } from 'react'

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

function current(): string {
  const path = window.location.hash.replace(/^#/, '')
  return path.startsWith('/') ? path : '/'
}

export function useRoute(): string {
  return useSyncExternalStore(subscribe, current)
}

export function href(path: string): string {
  return `#${path}`
}

export function navigate(path: string): void {
  window.location.hash = path
}
