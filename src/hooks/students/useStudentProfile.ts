import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { AppApiError } from '@/lib/api-error';
import type {
  StudentCategory,
  StudentProfileDto,
  UpsertStudentProfileDto,
} from '@/api/types/student-profile.types';

const VALID_STUDENT_CATEGORIES: StudentCategory[] = [
  'regular',
  'distance_education',
  'sandwich',
  'evening_weekend',
  'other',
];

function isStudentCategory(value: string): value is StudentCategory {
  return VALID_STUDENT_CATEGORIES.includes(value as StudentCategory);
}

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanOptionalString(value: unknown): string | undefined {
  const next = cleanString(value);
  return next ? next : undefined;
}

function normalizeStudentProfile(raw: unknown): StudentProfileDto {
  if (!raw || typeof raw !== 'object') {
    throw new AppApiError(500, 'Invalid student profile response.');
  }
  const rec = raw as Record<string, unknown>;
  const categoryRaw = cleanString(rec.studentCategory);
  if (!isStudentCategory(categoryRaw)) {
    throw new AppApiError(500, 'Student profile response has invalid category.');
  }
  const levelData =
    typeof rec.levelData === 'number'
      ? rec.levelData
      : typeof rec.level === 'number'
        ? rec.level
        : NaN;
  const semesterData =
    typeof rec.semesterData === 'number'
      ? rec.semesterData
      : typeof rec.semester === 'number'
        ? rec.semester
        : NaN;
  if (!Number.isFinite(levelData) || !Number.isFinite(semesterData)) {
    throw new AppApiError(500, 'Student profile response is missing level/semester.');
  }

  const indexNumber = cleanString(rec.indexNumber);
  const universityId = cleanString(rec.universityId);
  const deptId = cleanString(rec.deptId);
  if (!indexNumber || !universityId || !deptId) {
    throw new AppApiError(500, 'Student profile response is missing required fields.');
  }

  return {
    id: cleanOptionalString(rec.id),
    indexNumber,
    studentCategory: categoryRaw,
    otherStudentCategory: cleanOptionalString(rec.otherStudentCategory),
    universityId,
    deptId,
    levelData,
    semesterData,
    avatarKey: cleanOptionalString(rec.avatarKey),
  };
}

function buildStudentProfilePayload(input: UpsertStudentProfileDto): UpsertStudentProfileDto {
  const payload: UpsertStudentProfileDto = {
    indexNumber: cleanString(input.indexNumber),
    studentCategory: input.studentCategory,
    universityId: cleanString(input.universityId),
    deptId: cleanString(input.deptId),
    levelData: input.levelData,
    semesterData: input.semesterData,
  };

  const avatarKey = cleanOptionalString(input.avatarKey);
  if (avatarKey) payload.avatarKey = avatarKey;

  const otherCategory = cleanOptionalString(input.otherStudentCategory);
  if (input.studentCategory === 'other') {
    if (!otherCategory) {
      throw new AppApiError(
        400,
        'Please provide "otherStudentCategory" when student category is "other".',
      );
    }
    payload.otherStudentCategory = otherCategory;
  }

  if (!payload.indexNumber || !payload.universityId || !payload.deptId) {
    throw new AppApiError(400, 'Student profile requires index number, university and department.');
  }

  const validLevels = new Set([100, 200, 300, 400]);
  const validSemesters = new Set([1, 2]);
  if (!Number.isInteger(payload.levelData) || !validLevels.has(payload.levelData)) {
    throw new AppApiError(
      400,
      'Level must be one of: 100, 200, 300, or 400.',
    );
  }
  if (!Number.isInteger(payload.semesterData) || !validSemesters.has(payload.semesterData)) {
    throw new AppApiError(400, 'Semester must be 1 or 2.');
  }

  return payload;
}

export function useStudentProfile() {
  return useQuery({
    queryKey: queryKeys.students.profile,
    retry: false,
    queryFn: async ({ signal }): Promise<StudentProfileDto> => {
      const { data } = await apiClient.get<unknown>(API.students.meProfile, { signal });
      return normalizeStudentProfile(data);
    },
  });
}

export function useUpsertStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertStudentProfileDto) => {
      const payload = buildStudentProfilePayload(input);
      // Some backends return an ack/envelope for POST instead of the full profile object.
      // Persist first, then fetch canonical profile shape from GET for stable normalization.
      await apiClient.post<unknown>(API.students.meProfile, payload);
      const { data } = await apiClient.get<unknown>(API.students.meProfile);
      return normalizeStudentProfile(data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.profile });
    },
  });
}
