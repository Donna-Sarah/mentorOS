'use client'

import { useCallback, useMemo, useState } from 'react'
import { useNextUpStorage } from '@/hooks/useNextUpStorage'
import { useLanguage } from '@/lib/i18n'
import { filterTasks } from '@/lib/nextup/filters'
import { formatDate, todayKey } from '@/lib/nextup/dates'
import type {
  NextUpGenResult,
  NextUpLog,
  NextUpStructGroup,
  NextUpTab,
  NextUpTask,
} from '@/types/nextup'
import { ErrorBox } from './ErrorBox'
import { ExportModal } from './ExportModal'
import { FilterBar } from './FilterBar'
import { GenerateButton } from './GenerateButton'
import { LogSection } from './LogSection'
import { PlanSection } from './PlanSection'
import { TabBar } from './TabBar'
import { TaskList } from './TaskList'
import { WeekView } from './WeekView'
import {
  NextUpAnalyzing,
  tabToAnalyzingMode,
  type NextUpAnalyzingMode,
} from './NextUpAnalyzing'

export function NextUpClient() {
  const { t } = useLanguage()
  const { state, hydrated, setState, updateState } = useNextUpStorage()
  const [error, setError] = useState<string | null>(null)
  const [analyzingMode, setAnalyzingMode] = useState<NextUpAnalyzingMode | null>(
    null,
  )
  const [exportOpen, setExportOpen] = useState(false)

  const isAnalyzing = analyzingMode !== null

  const today = todayKey()
  const todayLogs = state.logs[today] ?? []

  const currentGen = state.gen[state.tab]
  const tabDone = state.done[state.tab]

  const allTasks: NextUpTask[] = useMemo(() => {
    if (!currentGen?.data.tasks) return []
    return currentGen.data.tasks
  }, [currentGen])

  const filteredTasks = useMemo(
    () =>
      filterTasks(
        allTasks,
        tabDone,
        state.filterStatus,
        state.filterPriority,
        state.searchQuery,
      ),
    [
      allTasks,
      tabDone,
      state.filterStatus,
      state.filterPriority,
      state.searchQuery,
    ],
  )

  const completedCount = useMemo(() => {
    const total = allTasks.length
    const done = allTasks.filter((task) => tabDone?.[task.id]).length
    return { done, total }
  }, [allTasks, tabDone])

  const showFilterBar =
    Boolean(currentGen) && state.tab !== 'week' && allTasks.length > 0

  const exportJson = useMemo(() => {
    if (!currentGen) return ''
    return JSON.stringify(
      {
        at: new Date().toLocaleString('vi-VN'),
        tab: state.tab,
        plan: state.plan,
        struct: state.struct,
        data: currentGen.data,
        done: tabDone ?? {},
        logs: state.logs,
      },
      null,
      2,
    )
  }, [currentGen, state.tab, state.plan, state.struct, state.logs, tabDone])

  const handleAddLog = useCallback(
    (log: NextUpLog) => {
      setState((prev) => {
        const dayLogs = [...(prev.logs[today] ?? []), log]
        return {
          ...prev,
          logs: { ...prev.logs, [today]: dayLogs },
        }
      })
    },
    [setState, today],
  )

  const handleRemoveLog = useCallback(
    (index: number) => {
      setState((prev) => {
        const dayLogs = [...(prev.logs[today] ?? [])]
        dayLogs.splice(index, 1)
        return {
          ...prev,
          logs: { ...prev.logs, [today]: dayLogs },
        }
      })
    },
    [setState, today],
  )

  const handleToggleDone = useCallback(
    (taskId: number) => {
      setState((prev) => {
        const tab = prev.tab
        const prevDone = prev.done[tab] ?? {}
        return {
          ...prev,
          done: {
            ...prev.done,
            [tab]: { ...prevDone, [taskId]: !prevDone[taskId] },
          },
        }
      })
    },
    [setState],
  )

  const handleTabChange = useCallback(
    (tab: NextUpTab) => {
      updateState({ tab, filterStatus: 'all', filterPriority: 'all', searchQuery: '' })
      setError(null)
    },
    [updateState],
  )

  const handleGenerate = useCallback(async () => {
    if (state.loading || isAnalyzing) return

    updateState({ loading: true })
    setAnalyzingMode(tabToAnalyzingMode(state.tab))
    setError(null)

    try {
      const res = await fetch('/api/nextup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab: state.tab,
          plan: state.plan,
          logs: state.logs,
        }),
      })

      const json = (await res.json()) as {
        data: NextUpGenResult | null
        error: string | null
      }

      if (json.error || !json.data) {
        setError(json.error ?? t.common.error)
        return
      }

      setState((prev) => ({
        ...prev,
        gen: { ...prev.gen, [prev.tab]: json.data as NextUpGenResult },
      }))
    } catch {
      setError(t.common.error)
    } finally {
      setAnalyzingMode(null)
      updateState({ loading: false })
    }
  }, [
    state.loading,
    state.tab,
    state.plan,
    state.logs,
    isAnalyzing,
    setState,
    updateState,
    t.common.error,
  ])

  const handleSavePlan = useCallback(
    async (text: string) => {
      if (isAnalyzing) return

      setAnalyzingMode('plan')
      setError(null)

      try {
        const res = await fetch('/api/nextup/parse-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        const json = (await res.json()) as {
          struct: NextUpStructGroup[] | null
          error: string | null
        }

        if (json.error) {
          setError(json.error)
          updateState({ plan: text, struct: null })
          return
        }

        updateState({
          plan: text,
          struct: json.struct,
        })
      } catch {
        setError(t.common.error)
        updateState({ plan: text, struct: null })
      } finally {
        setAnalyzingMode(null)
      }
    },
    [isAnalyzing, updateState, t.common.error],
  )

  const handleConfirmUpload = useCallback(
    (plan: string, struct: NextUpStructGroup[]) => {
      updateState({ plan, struct })
    },
    [updateState],
  )

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[700px] py-12 text-center text-[13px]" style={{ color: 'var(--nu-text3)' }}>
        {t.common.loading}
      </div>
    )
  }

  const weekDays = currentGen?.data.days ?? []

  return (
    <div className="mx-auto max-w-[700px]">
      <header
        className="mb-10 flex items-center gap-4 border-b pb-8"
        style={{ borderColor: 'var(--nu-border)' }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-[22px]"
          style={{
            borderColor: 'var(--nu-border2)',
            background: 'linear-gradient(135deg, var(--nu-bg3), var(--nu-bg2))',
          }}
          aria-hidden
        >
          💼
        </div>
        <div className="min-w-0">
          <h1
            className="font-[family-name:var(--font-nextup-display)] text-[22px] font-normal tracking-wide"
            style={{ color: 'var(--nu-text)' }}
          >
            {t.nextup.page_title}
          </h1>
          <p className="mt-0.5 text-[12px]" style={{ color: 'var(--nu-text3)' }}>
            {formatDate(today)} · {t.nextup.page_subtitle}
          </p>
        </div>
        <span
          className="ml-auto shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wider"
          style={{
            borderColor: 'rgba(201, 168, 76, 0.2)',
            backgroundColor: 'var(--nu-gold-dim)',
            color: 'var(--nu-gold)',
          }}
        >
          {t.nextup.badge_pro}
        </span>
      </header>

      <LogSection
        logs={todayLogs}
        disabled={isAnalyzing}
        onAddLog={handleAddLog}
        onRemoveLog={handleRemoveLog}
      />

      <TabBar
        activeTab={state.tab}
        disabled={isAnalyzing}
        onTabChange={handleTabChange}
      />

      <GenerateButton
        tab={state.tab}
        loading={state.loading}
        disabled={isAnalyzing}
        onGenerate={() => void handleGenerate()}
      />

      <div className="mb-4">
        {analyzingMode ? (
          <NextUpAnalyzing mode={analyzingMode} />
        ) : (
          <>
            {showFilterBar ? (
              <FilterBar
                filterStatus={state.filterStatus}
                filterPriority={state.filterPriority}
                searchQuery={state.searchQuery}
                onFilterStatusChange={(filterStatus) =>
                  updateState({ filterStatus })
                }
                onFilterPriorityChange={(filterPriority) =>
                  updateState({ filterPriority })
                }
                onSearchChange={(searchQuery) => updateState({ searchQuery })}
                onExport={() => setExportOpen(true)}
              />
            ) : null}

            <ErrorBox message={error} />

            {state.tab === 'week' ? (
              weekDays.length > 0 ? (
                <WeekView days={weekDays} generatedAt={currentGen?.at} />
              ) : (
                <TaskList
                  tasks={[]}
                  tabDone={tabDone}
                  onToggleDone={handleToggleDone}
                  showEmpty
                />
              )
            ) : currentGen ? (
              <TaskList
                tasks={filteredTasks}
                tabDone={tabDone}
                onToggleDone={handleToggleDone}
                showNoMatch={filteredTasks.length === 0 && allTasks.length > 0}
                completedCount={completedCount}
                generatedAt={currentGen.at}
              />
            ) : (
              <TaskList
                tasks={[]}
                tabDone={tabDone}
                onToggleDone={handleToggleDone}
                showEmpty
              />
            )}
          </>
        )}
      </div>

      <PlanSection
        plan={state.plan}
        struct={state.struct}
        planMode={state.planMode}
        disabled={isAnalyzing}
        onPlanModeChange={(planMode) => updateState({ planMode })}
        onSavePlan={handleSavePlan}
        onConfirmUpload={handleConfirmUpload}
      />

      <ExportModal
        open={exportOpen}
        jsonText={exportJson}
        onClose={() => setExportOpen(false)}
      />
    </div>
  )
}
