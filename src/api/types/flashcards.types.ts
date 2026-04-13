/** Deck list item from GET /flashcards/courses/:courseId */
export type FlashcardDeckListItem = {
  _id: string;
  courseId?: string;
  title: string;
  description?: string;
  topic?: string;
  cardCount: number;
  sourceType?: string;
  isPublished?: boolean;
};

export type FlashcardCardDto = {
  _id: string;
  deckId?: string;
  courseId?: string;
  front: string;
  back: string;
  explanation?: string;
  mnemonic?: string;
  example?: string;
  topic?: string;
  difficulty?: string;
  cardType?: string;
  position?: number;
};

export type FlashcardSrState = {
  nextReviewDate?: string;
  interval?: number;
  easeFactor?: number;
  repetitions?: number;
  totalReviews?: number;
  correctCount?: number;
  lastRating?: number;
} | null;

export type DueCardRow = {
  card: FlashcardCardDto;
  srState: FlashcardSrState;
};

export type FlashcardDeckDetailResponse = {
  deck: {
    _id: string;
    title: string;
    cardCount: number;
    topic?: string;
    isPublished?: boolean;
  };
  cards: FlashcardCardDto[];
};

export type FlashcardProgress = {
  totalCards: number;
  studiedCards: number;
  masteredCards: number;
  dueCards: number;
  weakCards: number;
  lastStudiedAt?: number;
  nextReviewDate?: string;
};

export type FlashcardSessionMode =
  | 'spaced_repetition'
  | 'quick_fire'
  | 'full_review'
  | 'weak_cards';

export type StartFlashcardSessionResponse = {
  sessionId: string;
  cards: DueCardRow[];
};

export type ReviewFlashcardResponse = {
  nextReviewDate: string;
  interval: number;
  easeFactor: number;
};

export type CompleteFlashcardSessionResponse = {
  xpEarned: number;
  completedAt: number;
};
