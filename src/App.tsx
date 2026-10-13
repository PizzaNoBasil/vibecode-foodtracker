import { BookOpen, CalendarBlank, GearSix, ShoppingCart, SunHorizon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useEffect } from 'react'
import type { ProfileId } from './plan'
import { useProfile, useSettings } from './state/storage'
import { displayName, Segmented } from './ui/components/ui'
import { href, useRoute } from './ui/router'
import { CalendarScreen } from './ui/screens/Calendar'
import { RecipeScreen, RecipesScreen } from './ui/screens/Recipes'
import { SettingsScreen } from './ui/screens/Settings'
import { ShoppingScreen } from './ui/screens/Shopping'
import { TodayScreen } from './ui/screens/Today'

const TABS: { path: string; label: string; icon: Icon }[] = [
  { path: '/', label: 'Сегодня', icon: SunHorizon },
  { path: '/calendar', label: 'Календарь', icon: CalendarBlank },
  { path: '/recipes', label: 'Рецепты', icon: BookOpen },
  { path: '/shopping', label: 'Покупки', icon: ShoppingCart },
]

function Screen({ route }: { route: string }) {
  const recipe = route.match(/^\/recipes\/(\w+)/)
  if (recipe) return <RecipeScreen id={recipe[1]} />
  switch (route) {
    case '/calendar':
      return <CalendarScreen />
    case '/recipes':
      return <RecipesScreen />
    case '/shopping':
      return <ShoppingScreen />
    case '/settings':
      return <SettingsScreen />
    default:
      return <TodayScreen />
  }
}

export default function App() {
  const route = useRoute()
  const [profile, setProfile] = useProfile()
  const [settings] = useSettings()
  const wide = route === '/calendar'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  return (
    <div className="min-h-dvh pb-[calc(84px+env(safe-area-inset-bottom))]">
      <div className={`mx-auto px-4 pt-[max(16px,env(safe-area-inset-top))] ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <div className="mb-6 flex items-center gap-3">
          <div className="max-w-sm flex-1">
            <Segmented<ProfileId>
              label="Чей план показывать"
              value={profile}
              onChange={setProfile}
              options={[
                { value: 'first', label: displayName(settings, 'first') },
                { value: 'second', label: displayName(settings, 'second') },
              ]}
            />
          </div>
          <a
            href={href('/settings')}
            aria-label="Настройки"
            className={`press ml-auto grid size-12 place-items-center rounded-full ${
              route === '/settings' ? 'bg-ink text-ground' : 'bg-raised text-ink'
            }`}
          >
            <GearSix size={22} weight="bold" />
          </a>
        </div>
        <main key={route}>
          <Screen route={route} />
        </main>
      </div>

      <nav
        aria-label="Разделы"
        className="fixed inset-x-0 bottom-0 z-10 bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto flex max-w-2xl">
          {TABS.map(({ path, label, icon: TabIcon }) => {
            const active = path === '/' ? route === '/' : route.startsWith(path)
            return (
              <li key={path} className="flex-1">
                <a
                  href={href(path)}
                  aria-current={active ? 'page' : undefined}
                  className={`press flex h-16 flex-col items-center justify-center gap-0.5 text-[13px] font-medium ${
                    active ? 'text-accent' : 'text-muted'
                  }`}
                >
                  <TabIcon size={26} weight={active ? 'fill' : 'regular'} />
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
