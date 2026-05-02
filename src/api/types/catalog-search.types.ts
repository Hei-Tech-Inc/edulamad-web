/** GET /search — Convex catalog omnibar (JSON shape per API contract). */

export interface CatalogSearchQuestion {
  _id: string;
  questionText?: string;
  type?: string;
  courseId?: string;
  difficulty?: string | number;
  topic?: string;
}

export interface CatalogSearchCourse {
  _id: string;
  code?: string;
  title?: string;
  level?: string | number;
}

export interface CatalogSearchUniversity {
  _id: string;
  name?: string;
  acronym?: string;
}

export interface CatalogSearchFlashcardDeck {
  _id: string;
  title?: string;
  courseId?: string;
}

export interface CatalogSearchPracticeQuestion {
  _id: string;
  questionText?: string;
  courseId?: string;
  difficulty?: string | number;
}

export interface CatalogSearchResponse {
  questions: CatalogSearchQuestion[];
  courses: CatalogSearchCourse[];
  universities: CatalogSearchUniversity[];
  flashcardDecks: CatalogSearchFlashcardDeck[];
  practiceQuestions: CatalogSearchPracticeQuestion[];
}
