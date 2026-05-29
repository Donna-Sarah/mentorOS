'use client'

import { useMemo, useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { TASKS } from '@/lib/askbetter/tasks'
import type { AskBetterCategory } from '@/types/askbetter'
import { TaskCard } from './TaskCard'

interface TaskLibraryProps {
  onTryTask: (example: string) => void
}

export function TaskLibrary({ onTryTask }: TaskLibraryProps): React.ReactElement {
  const { t } = useLanguage()
  const [activeCat, setActiveCat] = useState<AskBetterCategory['id']>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories: { id: AskBetterCategory['id']; label: string }[] = [
    { id: 'all', label: t.askbetter.cat_all },
    { id: 'write', label: t.askbetter.cat_write },
    { id: 'analyze', label: t.askbetter.cat_analyze },
    { id: 'comms', label: t.askbetter.cat_comms },
    { id: 'plan', label: t.askbetter.cat_plan },
    { id: 'learn', label: t.askbetter.cat_learn },
  ]

  const catLabelMap = Object.fromEntries(
    categories.map((c) => [c.id, c.label]),
  ) as Record<AskBetterCategory['id'], string>

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return TASKS.filter((task) => {
      const catMatch = activeCat === 'all' || task.cat === activeCat
      const searchMatch =
        q === '' ||
        task.title.toLowerCase().includes(q) ||
        task.desc.toLowerCase().includes(q)
      return catMatch && searchMatch
    })
  }, [activeCat, searchQuery])

  return (
    <div className="pb-4">
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.askbetter.library_search}
        className="mb-8 w-full rounded-md border border-soft-gray bg-white-canvas px-5 py-3.5 font-body shadow-subtle-2 outline-none transition-colors focus:border-[#2563EB]/40 md:py-4"
        style={{
          fontSize: '16px',
          color: 'var(--ab-text)',
        }}
      />

      <div className="scroll-hidden mb-10 flex gap-3 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const isActive = activeCat === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCat(cat.id)}
              className="min-h-touch shrink-0 whitespace-nowrap rounded-md border px-4 py-2.5 font-body text-[13px] font-medium transition-all"
              style={{
                borderColor: isActive ? 'transparent' : 'var(--ab-border)',
                background: isActive ? 'var(--ab-grad)' : 'var(--ab-surface)',
                color: isActive ? '#ffffff' : 'var(--ab-muted)',
                boxShadow: isActive ? 'none' : undefined,
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            categoryLabel={catLabelMap[task.cat]}
            onTry={onTryTask}
          />
        ))}
      </div>
    </div>
  )
}
