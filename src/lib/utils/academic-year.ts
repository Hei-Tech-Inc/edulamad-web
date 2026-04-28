export function isValidAcademicYear(year: string): boolean {
  const match = year.match(/^(\d{4})\/(\d{4})$/);
  if (!match) return false;
  const first = Number.parseInt(match[1], 10);
  const second = Number.parseInt(match[2], 10);
  return Number.isFinite(first) && Number.isFinite(second) && second === first + 1 && first >= 2000 && first <= 2050;
}

export function generateAcademicYears(count = 10): string[] {
  const now = new Date();
  const baseYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: count }, (_, i) => {
    const y = baseYear - i;
    return `${y}/${y + 1}`;
  });
}

export function currentAcademicYear(): string {
  return generateAcademicYears(1)[0];
}

export function generateAssessmentLabel(
  type: string,
  number: number,
  customLabel?: string,
): string {
  if (customLabel?.trim()) return customLabel.trim();
  const labels: Record<string, string> = {
    interim_assessment: 'Midsem',
    class_quiz: 'Class Quiz',
    class_test: 'Class Test',
    assignment: 'Assignment',
    final_exam: 'Final Exam',
  };
  return `${labels[type] ?? type} ${number}`;
}

export function getSourceTypeLabel(sourceType: string): {
  label: string;
  color: 'orange' | 'blue' | 'green' | 'purple' | 'amber' | 'default';
} {
  const map: Record<string, { label: string; color: 'orange' | 'blue' | 'green' | 'purple' | 'amber' | 'default' }> = {
    final_exam: { label: 'Final Exam', color: 'blue' },
    interim_assessment: { label: 'Midsem', color: 'purple' },
    class_quiz: { label: 'Class Quiz', color: 'green' },
    class_test: { label: 'Class Test', color: 'green' },
    slide_generated: { label: 'From Slides', color: 'amber' },
    practice_bank: { label: 'Practice', color: 'orange' },
    crowdsourced: { label: 'Community', color: 'default' },
  };
  return map[sourceType] ?? { label: sourceType, color: 'default' };
}
