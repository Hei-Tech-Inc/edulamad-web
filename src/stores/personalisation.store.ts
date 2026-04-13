import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PersonalisationState {
  currentSemesterCourseIds: string[];
  setCurrentSemesterCourses: (ids: string[]) => void;
  mergeCourseIds: (ids: string[]) => void;
  reset: () => void;
}

export const usePersonalisationStore = create<PersonalisationState>()(
  persist(
    (set, get) => ({
      currentSemesterCourseIds: [],
      setCurrentSemesterCourses: (ids) =>
        set({
          currentSemesterCourseIds: [...new Set(ids.filter(Boolean))],
        }),
      mergeCourseIds: (ids) => {
        const cur = get().currentSemesterCourseIds;
        set({
          currentSemesterCourseIds: [...new Set([...cur, ...ids.filter(Boolean)])],
        });
      },
      reset: () => set({ currentSemesterCourseIds: [] }),
    }),
    {
      name: 'edu-personalisation',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ currentSemesterCourseIds: s.currentSemesterCourseIds }),
    },
  ),
);
