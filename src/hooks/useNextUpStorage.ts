'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_NEXTUP_STATE,
  NEXTUP_STORAGE_KEYS,
  type NextUpState,
} from '@/types/nextup'

function loadPersistedState(): Partial<NextUpState> {
  if (typeof window === 'undefined') return {}

  try {
    const plan = localStorage.getItem(NEXTUP_STORAGE_KEYS.plan) ?? ''
    let struct: NextUpState['struct'] = null
    try {
      struct = JSON.parse(
        localStorage.getItem(NEXTUP_STORAGE_KEYS.struct) ?? 'null',
      ) as NextUpState['struct']
    } catch {
      struct = null
    }

    let logs: NextUpState['logs'] = {}
    try {
      logs = JSON.parse(
        localStorage.getItem(NEXTUP_STORAGE_KEYS.logs) ?? '{}',
      ) as NextUpState['logs']
    } catch {
      logs = {}
    }

    let gen: NextUpState['gen'] = {}
    try {
      gen = JSON.parse(
        localStorage.getItem(NEXTUP_STORAGE_KEYS.gen) ?? '{}',
      ) as NextUpState['gen']
    } catch {
      gen = {}
    }

    let done: NextUpState['done'] = {}
    try {
      done = JSON.parse(
        localStorage.getItem(NEXTUP_STORAGE_KEYS.done) ?? '{}',
      ) as NextUpState['done']
    } catch {
      done = {}
    }

    return { plan, struct, logs, gen, done }
  } catch {
    return {}
  }
}

interface PersistedSlice {
  plan: string
  struct: NextUpState['struct']
  logs: NextUpState['logs']
  gen: NextUpState['gen']
  done: NextUpState['done']
}

function persistState(slice: PersistedSlice): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(NEXTUP_STORAGE_KEYS.plan, slice.plan)
    localStorage.setItem(
      NEXTUP_STORAGE_KEYS.struct,
      JSON.stringify(slice.struct),
    )
    localStorage.setItem(NEXTUP_STORAGE_KEYS.logs, JSON.stringify(slice.logs))
    localStorage.setItem(NEXTUP_STORAGE_KEYS.gen, JSON.stringify(slice.gen))
    localStorage.setItem(NEXTUP_STORAGE_KEYS.done, JSON.stringify(slice.done))
  } catch {
    // quota or private mode — ignore
  }
}

export interface UseNextUpStorageReturn {
  state: NextUpState
  hydrated: boolean
  setState: React.Dispatch<React.SetStateAction<NextUpState>>
  updateState: (patch: Partial<NextUpState>) => void
}

export function useNextUpStorage(): UseNextUpStorageReturn {
  const [state, setState] = useState<NextUpState>(DEFAULT_NEXTUP_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const persisted = loadPersistedState()
    setState((prev) => ({ ...prev, ...persisted }))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    persistState({
      plan: state.plan,
      struct: state.struct,
      logs: state.logs,
      gen: state.gen,
      done: state.done,
    })
  }, [
    hydrated,
    state.plan,
    state.struct,
    state.logs,
    state.gen,
    state.done,
  ])

  const updateState = useCallback((patch: Partial<NextUpState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  return { state, hydrated, setState, updateState }
}
