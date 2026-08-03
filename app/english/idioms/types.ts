export type ReviewGrade = "again" | "hard" | "good" | "easy";

export type IdiomMeaning = {
  id: string;
  meaning: string;
  example: string;
  note: string;

  reviewStage: number;
  dueAt: number;
  lastReviewedAt: number | null;

  reviewCount: number;
  correctCount: number;
  mistakeCount: number;
  streak: number;
};

export type IdiomFolder = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;

  pinned: boolean;
  archived: boolean;
  sortOrder: number;

  createdAt: number;
  updatedAt: number;
};

export type Idiom = {
  id: string;
  phrase: string;

  meanings: IdiomMeaning[];

  folderIds: string[];
  tags: string[];

  family: string;
  breakdown: string;

  favorite: boolean;

  createdAt: number;
  updatedAt: number;
};

export type IdiomStudyStats = {
  totalSeconds: number;

  quizAnswers: number;
  quizCorrect: number;

  listenCount: number;
  reviewAnswers: number;

  lastStudiedAt: number | null;
};

export type IdiomStudySet = {
  id: string;
  name: string;
  icon: string;

  folderIds: string[];

  includeFavorites: boolean;
  includeWeak: boolean;
  includeDue: boolean;

  createdAt: number;
};

export type IdiomQuestion = {
  idiomId: string;
  phrase: string;

  meaningId: string;
  meaning: string;
  example: string;
  note: string;
};