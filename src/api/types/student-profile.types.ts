export type StudentCategory =
  | 'regular'
  | 'distance_education'
  | 'sandwich'
  | 'evening_weekend'
  | 'other';

export const STUDENT_CATEGORIES = [
  { value: 'regular', label: 'Regular Students' },
  { value: 'distance_education', label: 'Distance Education Students' },
  { value: 'sandwich', label: 'Sandwich Students' },
  { value: 'evening_weekend', label: 'Evening / Weekend Students' },
  { value: 'other', label: 'Other' },
] as const;

export type UpsertStudentProfileDto = {
  /** Optional in OpenAPI; omit when unknown — some flows allow completing profile without an index yet. */
  indexNumber?: string;
  studentCategory: StudentCategory;
  otherStudentCategory?: string;
  universityId: string;
  deptId: string;
  levelData: number;
  semesterData: number;
  avatarKey?: string;
};

export type StudentProfileDto = UpsertStudentProfileDto & {
  id?: string;
};
