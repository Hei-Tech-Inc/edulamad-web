/** Last 5 academic years as "YYYY/YYYY+1" (Ghana-style: Sept+ = new year start). */
export function getAcademicYears(): string[] {
  const current = new Date().getFullYear()
  const startYear = new Date().getMonth() >= 8 ? current : current - 1
  return Array.from({ length: 5 }, (_, i) => {
    const y = startYear - i
    return `${y}/${y + 1}`
  })
}

/** Current academic year label (same Sept rule as `getAcademicYears`). */
export function getCurrentAcademicYearLabel(now = new Date()): string {
  const y = now.getFullYear()
  const startYear = now.getMonth() >= 8 ? y : y - 1
  return `${startYear}/${startYear + 1}`
}
