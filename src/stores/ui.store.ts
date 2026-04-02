import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  activeFarmId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveFarmId: (farmId: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activeFarmId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveFarmId: (farmId) => set({ activeFarmId: farmId }),
}));
