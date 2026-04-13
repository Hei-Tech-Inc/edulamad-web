import { create } from 'zustand'

export type StudyMode = 'regular' | 'distance'

export interface Step3Data {
  studyMode: StudyMode
  level: 100 | 200 | 300 | 400 | 500
  semester: 1 | 2
  academicYear: string
  indexNumber?: string
}

interface OnboardingState {
  currentStep: number
  universityId: string | null
  universityName: string | null
  collegeId: string | null
  departmentId: string | null
  departmentName: string | null
  studyMode: StudyMode | null
  level: number | null
  semester: number | null
  academicYear: string | null
  indexNumber: string | null
  setStep: (step: number) => void
  setUniversity: (id: string, name: string) => void
  setDepartment: (collegeId: string, deptId: string, deptName: string) => void
  setProgramme: (data: Step3Data) => void
  complete: () => Promise<void>
  reset: () => void
}

const initialState = {
  currentStep: 1,
  universityId: null,
  universityName: null,
  collegeId: null,
  departmentId: null,
  departmentName: null,
  studyMode: null,
  level: null,
  semester: null,
  academicYear: null,
  indexNumber: null,
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setStep: (step) => set({ currentStep: Math.min(Math.max(step, 1), 4) }),
  setUniversity: (id, name) =>
    set({
      universityId: id,
      universityName: name,
      collegeId: null,
      departmentId: null,
      departmentName: null,
    }),
  setDepartment: (collegeId, deptId, deptName) =>
    set({
      collegeId,
      departmentId: deptId,
      departmentName: deptName,
    }),
  setProgramme: (data) =>
    set({
      studyMode: data.studyMode,
      level: data.level,
      semester: data.semester,
      academicYear: data.academicYear,
      indexNumber: data.indexNumber?.trim() || null,
    }),
  complete: async () => {
    set({ currentStep: 4 })
  },
  reset: () => set({ ...initialState }),
}))
