export interface UploadQuestion {
  courseCode: string;
  university: string;
  year: number;
  examSession: string;
  questionNumber: number;
  questionText: string;
  type:
    | 'mcq'
    | 'essay'
    | 'calculation'
    | 'short_answer'
    | 'true_false';

  subPart?: string;
  options?: string[];
  sectionLabel?: string;
  marks?: number;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';

  solution?: {
    correctAnswer?: string;
    modelAnswer?: string;
    explanation?: string;
    keyPoints?: string[];
  };
}

export interface UploadResult {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  errors: Array<{
    questionNumber: number;
    courseCode: string;
    error: string;
  }>;
}

export interface ValidationError {
  index: number;
  field: string;
  message: string;
}
