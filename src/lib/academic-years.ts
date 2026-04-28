/** Academic years like `"2024/2025"` (second year = first + 1). */
export function generateAcademicYears(count = 10): string[] {
  const now = new Date();
  const baseYear =
    now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: count }, (_, i) => {
    const y = baseYear - i;
    return `${y}/${y + 1}`;
  });
}

export function currentAcademicYear(): string {
  return generateAcademicYears(1)[0];
}
