import { ArrowLeft, ArrowRight, Clock } from '@phosphor-icons/react'
import { useState } from 'react'
import { formatAmount } from '../../logic/format'
import { plan, type Recipe, type Slot } from '../../plan'
import { useProfile, useSettings, useStored } from '../../state/storage'
import { Card, displayName, MacroLine, Segmented } from '../components/ui'
import { href } from '../router'

type Filter = 'all' | Slot

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'breakfast', label: 'Завтраки' },
  { value: 'snack', label: 'Перекусы' },
  { value: 'dinner', label: 'Ужины' },
]

export function RecipesScreen() {
  const [filter, setFilter] = useStored<Filter>('recipes-filter', 'all')
  const list = Object.values(plan.recipes).filter((r) => filter === 'all' || r.slot === filter)

  return (
    <div>
      <h1 className="mb-5 text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">Рецепты</h1>
      <Segmented label="Тип блюда" options={FILTERS} value={filter} onChange={setFilter} />
      <ul className="mt-4 space-y-2">
        {list.map((r, i) => (
          <li key={r.id} className="rise" style={{ ['--i' as string]: Math.min(i, 8) }}>
            <a href={href(`/recipes/${r.id}`)} className="press flex items-center gap-4 rounded-3xl bg-surface p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-raised font-semibold">
                {r.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] leading-snug font-semibold">{r.title}</span>
                <span className="block text-[15px] text-muted">
                  {r.portions.first.macros.kcal} ккал{r.minutes ? ` · ${r.minutes}` : ''}
                </span>
              </span>
              <ArrowRight size={20} className="shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

type PortionKey = 'first' | 'second' | 'batch'

export function RecipeScreen({ id }: { id: string }) {
  const recipe = plan.recipes[id]
  if (!recipe) {
    return (
      <div>
        <p className="text-[17px]">Рецепт не найден.</p>
        <a href={href('/recipes')} className="mt-3 inline-block font-medium text-accent">
          Ко всем рецептам
        </a>
      </div>
    )
  }
  return <RecipeDetail recipe={recipe} />
}

function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [profile] = useProfile()
  const [settings] = useSettings()
  const isDinner = recipe.slot === 'dinner'
  const [portion, setPortion] = useState<PortionKey>(isDinner ? profile : 'first')
  const other = profile === 'first' ? 'second' : 'first'
  const p = recipe.portions[portion] ?? recipe.portions.first

  return (
    <article>
      <button
        type="button"
        onClick={() => (history.length > 1 ? history.back() : (location.hash = '/recipes'))}
        className="press -ml-1 mb-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-raised px-4 font-medium"
      >
        <ArrowLeft size={18} weight="bold" /> Назад
      </button>

      <header className="mb-5">
        <p className="text-muted">
          {recipe.code} · {plan.slotTitles[recipe.slot]}
        </p>
        <h1 className="mt-1 text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">{recipe.title}</h1>
        {recipe.minutes && (
          <p className="mt-2 flex items-center gap-1.5 text-muted">
            <Clock size={18} /> {recipe.minutes}
          </p>
        )}
      </header>

      {isDinner && (
        <div className="mb-4">
          <Segmented<PortionKey>
            label="Порция"
            value={portion}
            onChange={setPortion}
            options={[
              { value: profile, label: 'Моя порция' },
              { value: other, label: displayName(settings, other) },
              { value: 'batch', label: 'На 2 дня' },
            ]}
          />
        </div>
      )}

      <div className="space-y-3">
        <Card>
          <div className="flex items-baseline gap-2">
            <span className="text-[44px] leading-none font-semibold tracking-[-0.03em]">{p.macros.kcal}</span>
            <span className="text-muted">ккал{portion === 'batch' ? ' на всю готовку' : ''}</span>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {(
              [
                ['Белки', p.macros.protein],
                ['Жиры', p.macros.fat],
                ['Углеводы', p.macros.carbs],
              ] as const
            ).map(([label, v]) => (
              <div key={label} className="rounded-2xl bg-raised px-3 py-2.5">
                <dt className="text-[13px] text-muted">{label}</dt>
                <dd className="text-[20px] font-semibold">{v} г</dd>
              </div>
            ))}
          </dl>
          {portion === 'batch' && (
            <p className="mt-3 text-muted">Готовка на 2 дня: по 2 порции на каждого</p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Ингредиенты</h2>
          <ul className="mt-3 space-y-1">
            {p.lines.map((l) => (
              <li key={l.id + l.note} className="flex items-baseline gap-3 rounded-xl px-3 py-1.5 odd:bg-raised/60">
                <span className="min-w-0 flex-1">
                  {l.name}
                  {l.note && <span className="text-muted">, {l.note}</span>}
                </span>
                <span className="shrink-0 font-medium">{formatAmount(l.amount, l.unit) || 'по вкусу'}</span>
              </li>
            ))}
          </ul>
          {portion !== 'batch' && (
            <p className="mt-3 text-[15px]">
              <MacroLine m={p.macros} grams={p.grams} />
            </p>
          )}
        </Card>

        {recipe.steps.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold">Как готовить</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 marker:text-muted">
              {recipe.steps.map((s) => (
                <li key={s} className="pl-1">
                  {s}
                </li>
              ))}
            </ol>
          </Card>
        )}

        {(recipe.storage || recipe.notes.length > 0) && (
          <Card className="bg-raised">
            <h2 className="text-xl font-semibold">Хранение и заметки</h2>
            <ul className="mt-2 space-y-1">
              {[recipe.storage, ...recipe.notes].filter(Boolean).map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </article>
  )
}
