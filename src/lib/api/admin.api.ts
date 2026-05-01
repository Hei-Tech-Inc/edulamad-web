import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { pickArray } from '@/lib/admin/pick-array';

type Row = Record<string, unknown>;

function asRow(v: unknown): Row | null {
  return v && typeof v === 'object' ? (v as Row) : null;
}

function asRows(data: unknown): Row[] {
  return pickArray(data).map((v) => asRow(v)).filter((v): v is Row => Boolean(v));
}

async function listDepartmentsForUniversity(
  universityId: string,
  signal?: AbortSignal,
): Promise<Row[]> {
  const { data: collegesData } = await apiClient.get<unknown>(
    API.institutions.universities.colleges(universityId),
    { signal, params: { activeOnly: true } },
  );
  const colleges = asRows(collegesData);
  const out: Row[] = [];
  await Promise.all(
    colleges.map(async (college) => {
      const cid = typeof college.id === 'string' ? college.id : '';
      if (!cid) return;
      const { data: deptsData } = await apiClient.get<unknown>(
        API.institutions.colleges.departments(cid),
        { signal, params: { activeOnly: true } },
      );
      const depts = asRows(deptsData).map((d) => ({ ...d, collegeId: cid }));
      out.push(...depts);
    }),
  );
  return out;
}

async function listCoursesForDepartments(
  departments: Row[],
  signal?: AbortSignal,
): Promise<Row[]> {
  const out: Row[] = [];
  await Promise.all(
    departments.map(async (dept) => {
      const deptId =
        typeof dept.id === 'string'
          ? dept.id
          : typeof dept._id === 'string'
            ? dept._id
            : '';
      if (!deptId) return;
      const { data: coursesData } = await apiClient.get<unknown>(
        API.institutions.departments.courses(deptId),
        { signal, params: { activeOnly: true } },
      );
      const courses = asRows(coursesData).map((c) => ({ ...c, deptId: deptId }));
      out.push(...courses);
    }),
  );
  return out;
}

export const adminApi = {
  universityDetail: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(API.institutions.universities.detail(id), {
      signal,
    });
    return asRow(data);
  },
  collegeDetail: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(API.institutions.colleges.detail(id), { signal });
    return asRow(data);
  },
  departmentDetail: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(API.institutions.departments.detail(id), {
      signal,
    });
    return asRow(data);
  },
  courseDetail: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(API.institutions.courses.detail(id), { signal });
    return asRow(data);
  },
  universityStats: async (id: string, signal?: AbortSignal) => {
    try {
      const dashboard = (await adminApi.universityDashboard(id, signal)) as Record<
        string,
        unknown
      >;
      const students = asRow(dashboard.students) ?? {};
      const content = asRow(dashboard.content) ?? {};
      const gaps = asRow(dashboard.contentGaps) ?? {};
      return {
        collegeCount: Number(content.collegeCount ?? 0),
        deptCount: Number(content.departmentCount ?? 0),
        courseCount: Number(content.courseCount ?? 0),
        questionCount: Number(content.questionCount ?? 0),
        studentCount: Number(students.total ?? students.studentCount ?? 0),
        gapCount: Number(gaps.total ?? gaps.gapCount ?? 0),
      };
    } catch {
      const { data: collegesData } = await apiClient.get<unknown>(
        API.institutions.universities.colleges(id),
        { signal, params: { activeOnly: true } },
      );
      const colleges = asRows(collegesData);
      const departments = await listDepartmentsForUniversity(id, signal);
      const courses = await listCoursesForDepartments(departments, signal);
      return {
        collegeCount: colleges.length,
        deptCount: departments.length,
        courseCount: courses.length,
        questionCount: 0,
        studentCount: 0,
        gapCount: 0,
      };
    }
  },
  collegeStats: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(`/admin/colleges/${id}/dashboard`, { signal });
    const dashboard = asRow(data) ?? {};
    const content = asRow(dashboard.content) ?? {};
    const students = asRow(dashboard.students) ?? {};
    const gaps = asRow(dashboard.contentGaps) ?? {};
    return {
      deptCount: Number(content.departmentCount ?? content.deptCount ?? 0),
      courseCount: Number(content.courseCount ?? 0),
      questionCount: Number(content.questionCount ?? 0),
      studentCount: Number(students.total ?? students.studentCount ?? 0),
      gapCount: Number(gaps.total ?? gaps.gapCount ?? 0),
    };
  },
  departmentStats: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(`/admin/departments/${id}/dashboard`, {
      signal,
    });
    const dashboard = asRow(data) ?? {};
    const content = asRow(dashboard.content) ?? {};
    const students = asRow(dashboard.students) ?? {};
    const gaps = asRow(dashboard.contentGaps) ?? {};
    return {
      courseCount: Number(content.courseCount ?? 0),
      questionCount: Number(content.questionCount ?? 0),
      studentCount: Number(students.total ?? students.studentCount ?? 0),
      coursesWithContent: Number(content.coursesWithContent ?? 0),
      gapCount: Number(gaps.total ?? gaps.gapCount ?? 0),
    };
  },
  courseStats: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(`/admin/courses/${id}/dashboard`, {
      signal,
    });
    const dashboard = asRow(data) ?? {};
    const content = asRow(dashboard.content) ?? {};
    const students = asRow(dashboard.students) ?? {};
    return {
      offeringCount: Number(content.offeringCount ?? 0),
      questionCount: Number(content.questionCount ?? 0),
      solutionCount: Number(content.solutionCount ?? 0),
      flashcardDeckCount: Number(content.flashcardDeckCount ?? 0),
      enrolledCount: Number(students.enrolledCount ?? students.total ?? 0),
      avgScore:
        typeof students.avgScore === 'number' ? students.avgScore : (null as number | null),
    };
  },
  contentGaps: async (universityId?: string, signal?: AbortSignal) => {
    if (!universityId) return [];
    const { data } = await apiClient.get<unknown>(`/admin/universities/${universityId}/content-gaps`, {
      signal,
    });
    return asRows(data);
  },
  listUniversityColleges: async (universityId: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(
      API.institutions.universities.colleges(universityId),
      { signal, params: { activeOnly: true } },
    );
    return asRows(data);
  },
  listCollegeDepartments: async (collegeId: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(API.institutions.colleges.departments(collegeId), {
      signal,
      params: { activeOnly: true },
    });
    return asRows(data);
  },
  listDepartmentCourses: async (deptId: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(API.institutions.departments.courses(deptId), {
      signal,
      params: { activeOnly: true },
    });
    return asRows(data);
  },
  universityDashboard: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(`/admin/universities/${id}/dashboard`, { signal });
    return data;
  },
  universityStudents: async (
    id: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal,
  ) => {
    const { data } = await apiClient.get<unknown>(`/admin/universities/${id}/students`, {
      params,
      signal,
    });
    return data;
  },
  universityPromoCodes: async (id: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(`/admin/universities/${id}/promo-codes`, { signal });
    return data;
  },
  createUniversityPromo: async (id: string, dto: Record<string, unknown>) => {
    const { data } = await apiClient.post<unknown>(`/admin/universities/${id}/promo-codes`, dto);
    return data;
  },
  topicCoverage: async (courseId: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<unknown>(`/admin/courses/${courseId}/topic-coverage`, {
      signal,
    });
    return data;
  },
};
