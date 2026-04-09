import { create } from 'zustand'

type LoadingBarStatus = 'idle' | 'loading' | 'success' | 'error'

interface LoadingBarStore {
  isVisible: boolean
  progress: number
  status: LoadingBarStatus
  start: () => void
  done: () => void
  error: () => void
  reset: () => void
}

export const useLoadingBarStore = create<LoadingBarStore>((set) => ({
  isVisible: false,
  progress: 0,
  status: 'idle',
  start: () =>
    set(() => ({
      isVisible: true,
      progress: 0,
      status: 'loading',
    })),
  done: () =>
    set((s) => ({
      isVisible: true,
      progress: Math.max(s.progress, 72),
      status: 'success',
    })),
  error: () =>
    set((s) => ({
      isVisible: true,
      progress: Math.max(s.progress, 72),
      status: 'error',
    })),
  reset: () =>
    set(() => ({
      isVisible: false,
      progress: 0,
      status: 'idle',
    })),
}))

export const loadingBarActions = {
  start: () => useLoadingBarStore.getState().start(),
  done: () => useLoadingBarStore.getState().done(),
  error: () => useLoadingBarStore.getState().error(),
  reset: () => useLoadingBarStore.getState().reset(),
}
