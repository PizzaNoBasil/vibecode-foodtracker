import { useEffect, useState } from 'react'
import { today } from '../logic/dates'

/** Сегодняшняя дата; обновляется, когда приложение снова открыли после полуночи. */
export function useToday(): string {
  const [date, setDate] = useState(today)
  useEffect(() => {
    const update = () => setDate(today())
    document.addEventListener('visibilitychange', update)
    const timer = window.setInterval(update, 60_000)
    return () => {
      document.removeEventListener('visibilitychange', update)
      window.clearInterval(timer)
    }
  }, [])
  return date
}
