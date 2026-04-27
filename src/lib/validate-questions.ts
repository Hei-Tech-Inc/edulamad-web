import type {
  UploadQuestion,
  ValidationError,
} from '@/types/question-upload.types';

const VALID_TYPES = [
  'mcq',
  'essay',
  'calculation',
  'short_answer',
  'true_false',
] as const;
const VALID_DIFF = ['easy', 'medium', 'hard'];
const CURRENT_YEAR = new Date().getFullYear();

function normalizeYear(raw: unknown): { year: number } | { error: string } {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return { year: raw };
  }
  if (typeof raw === 'string' && /^\d{4}$/.test(raw.trim())) {
    return { year: parseInt(raw.trim(), 10) };
  }
  return { error: 'year must be a number' };
}

function normalizeQuestionNumber(
  raw: unknown,
): { n: number } | { error: string } {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return { n: raw };
  }
  if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
    return { n: parseInt(raw.trim(), 10) };
  }
  return { error: 'questionNumber must be a number' };
}

export function validateQuestions(questions: unknown[]): {
  valid: UploadQuestion[];
  errors: ValidationError[];
  warnings: ValidationError[];
} {
  const valid: UploadQuestion[] = [];
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  questions.forEach((q, i) => {
    if (!q || typeof q !== 'object' || Array.isArray(q)) {
      errors.push({
        index: i,
        field: 'root',
        message: 'Expected an object for each question',
      });
      return;
    }
    const item = q as Record<string, unknown>;
    let hasError = false;

    const addError = (field: string, message: string) => {
      errors.push({ index: i, field, message });
      hasError = true;
    };
    const addWarning = (field: string, message: string) => {
      warnings.push({ index: i, field, message });
    };

    if (!item.courseCode || typeof item.courseCode !== 'string') {
      addError('courseCode', 'courseCode is required and must be a string');
    }
    if (!item.university || typeof item.university !== 'string') {
      addError('university', 'university is required');
    }

    const y = normalizeYear(item.year);
    if ('error' in y) {
      addError('year', y.error);
    } else if (y.year < 1990 || y.year > CURRENT_YEAR + 1) {
      addError(
        'year',
        `year must be between 1990 and ${CURRENT_YEAR + 1}`,
      );
    }

    if (!item.examSession || typeof item.examSession !== 'string') {
      addError('examSession', 'examSession is required (e.g. "Final 2023")');
    }

    const qn = normalizeQuestionNumber(item.questionNumber);
    if ('error' in qn) {
      addError('questionNumber', qn.error);
    } else if (qn.n < 1) {
      addError('questionNumber', 'questionNumber must be at least 1');
    }

    if (
      !item.questionText ||
      typeof item.questionText !== 'string' ||
      item.questionText.trim().length < 5
    ) {
      addError(
        'questionText',
        'questionText is required (minimum 5 characters)',
      );
    }
    if (!item.type || typeof item.type !== 'string') {
      addError('type', `type is required: ${VALID_TYPES.join(', ')}`);
    } else if (!VALID_TYPES.includes(item.type as (typeof VALID_TYPES)[number])) {
      addError('type', `type must be one of: ${VALID_TYPES.join(', ')}`);
    }

    if (item.type === 'mcq') {
      if (!Array.isArray(item.options) || item.options.length < 2) {
        addError('options', 'MCQ questions must have at least 2 options');
      }
      const sol = item.solution;
      if (sol && typeof sol === 'object' && !Array.isArray(sol)) {
        const s = sol as Record<string, unknown>;
        if (!s.correctAnswer) {
          addWarning(
            'solution.correctAnswer',
            'MCQ question has no correct answer set',
          );
        }
      }
    }

    if (item.type === 'true_false') {
      const sol = item.solution;
      if (sol && typeof sol === 'object' && !Array.isArray(sol)) {
        const s = sol as Record<string, unknown>;
        if (!s.correctAnswer) {
          addWarning(
            'solution.correctAnswer',
            'True/false question has no correct answer',
          );
        }
      }
    }

    if (item.difficulty) {
      if (typeof item.difficulty !== 'string') {
        addWarning('difficulty', 'difficulty should be a string');
      } else if (!VALID_DIFF.includes(item.difficulty)) {
        addWarning(
          'difficulty',
          `difficulty should be: ${VALID_DIFF.join(', ')}`,
        );
      }
    }
    if (item.marks !== undefined && typeof item.marks !== 'number') {
      addWarning('marks', 'marks should be a number');
    }

    if (!hasError) {
      const out: Record<string, unknown> = { ...item };
      if (!('error' in y)) out.year = y.year;
      if (!('error' in qn)) out.questionNumber = qn.n;
      valid.push(out as unknown as UploadQuestion);
    }
  });

  return { valid, errors, warnings };
}

export function parseJSON(raw: string): {
  data: unknown[] | null;
  error: string | null;
} {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return {
        data: null,
        error:
          'JSON must be an array of questions. Wrap your object in [ ] brackets.',
      };
    }
    return { data: parsed, error: null };
  } catch (err) {
    return {
      data: null,
      error: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
