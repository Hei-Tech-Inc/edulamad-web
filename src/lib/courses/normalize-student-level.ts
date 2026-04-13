/** Coerce profile / UI level to a valid bachelor year band (API `GET /students/me/courses` query). */
export function normalizeStudentLevel(raw: unknown): 100 | 200 | 300 | 400 {
  const v = Math.round(Number(raw));
  if (v === 100 || v === 200 || v === 300 || v === 400) return v;
  return 300;
}
