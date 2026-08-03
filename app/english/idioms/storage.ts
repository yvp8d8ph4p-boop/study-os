import type {
  Idiom,
  IdiomFolder,
  IdiomMeaning,
  IdiomStudySet,
  IdiomStudyStats,
  ReviewGrade,
} from "./types";

const FOLDERS_KEY = "study-os-idioms-folders";
const IDIOMS_KEY = "study-os-idioms";
const STATS_KEY = "study-os-idioms-stats";
const STUDY_SETS_KEY = "study-os-idioms-study-sets";

const REVIEW_INTERVALS_MINUTES = [
  10,
  60 * 24,
  60 * 24 * 3,
  60 * 24 * 7,
  60 * 24 * 14,
  60 * 24 * 30,
  60 * 24 * 60,
  60 * 24 * 120,
];

const EMPTY_STATS: IdiomStudyStats = {
  totalSeconds: 0,
  quizAnswers: 0,
  quizCorrect: 0,
  listenCount: 0,
  reviewAnswers: 0,
  lastStudiedAt: null,
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function createId(prefix: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));

  window.dispatchEvent(
    new CustomEvent("study-os-idioms-updated", {
      detail: {
        key,
      },
    }),
  );
}

function normalizeMeaning(
  input: Partial<IdiomMeaning>,
): IdiomMeaning {
  return {
    id: input.id ?? createId("meaning"),
    meaning: input.meaning?.trim() ?? "",
    example: input.example?.trim() ?? "",
    note: input.note?.trim() ?? "",

    reviewStage: input.reviewStage ?? 0,
    dueAt: input.dueAt ?? Date.now(),
    lastReviewedAt: input.lastReviewedAt ?? null,

    reviewCount: input.reviewCount ?? 0,
    correctCount: input.correctCount ?? 0,
    mistakeCount: input.mistakeCount ?? 0,
    streak: input.streak ?? 0,
  };
}

function normalizeFolder(
  input: Partial<IdiomFolder>,
): IdiomFolder {
  const now = Date.now();

  return {
    id: input.id ?? createId("folder"),
    name: input.name?.trim() || "新しいフォルダ",
    description: input.description?.trim() ?? "",
    icon: input.icon || "📘",
    color: input.color || "#7C3AED",

    pinned: input.pinned ?? false,
    archived: input.archived ?? false,
    sortOrder: input.sortOrder ?? now,

    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

type IdiomInput = Omit<Partial<Idiom>, "meanings"> & {
  meanings?: Partial<IdiomMeaning>[];
};

function normalizeIdiom(
  input: IdiomInput,
): Idiom {
  const now = Date.now();

  return {
    id: input.id ?? createId("idiom"),
    phrase: input.phrase?.trim() ?? "",

    meanings: (input.meanings ?? []).map(normalizeMeaning),

    folderIds: input.folderIds ?? [],
    tags: input.tags ?? [],

    family: input.family?.trim() ?? "",
    breakdown: input.breakdown?.trim() ?? "",

    favorite: input.favorite ?? false,

    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

const DEFAULT_FOLDERS: IdiomFolder[] = [
  normalizeFolder({
    id: "eiken-2",
    name: "英検2級",
    description: "英検2級で覚えたい熟語",
    icon: "📘",
    color: "#7C3AED",
    pinned: true,
    sortOrder: 1,
  }),
  normalizeFolder({
    id: "school",
    name: "学校",
    description: "学校や定期テストの熟語",
    icon: "🏫",
    color: "#16A34A",
    sortOrder: 2,
  }),
];

const DEFAULT_IDIOMS: Idiom[] = [
  normalizeIdiom({
    id: "take-off",
    phrase: "take off",
    family: "take",
    breakdown: "take（取る）+ off（離れて）",
    tags: ["頻出"],
    folderIds: ["eiken-2"],
    meanings: [
      {
        id: "take-off-meaning-1",
        meaning: "脱ぐ",
        example: "He took off his coat.",
        note: "服や帽子などを脱ぐ",
      },
      {
        id: "take-off-meaning-2",
        meaning: "離陸する",
        example: "The plane took off on time.",
        note: "飛行機が地面を離れる",
      },
      {
        id: "take-off-meaning-3",
        meaning: "急に人気が出る",
        example: "The new app really took off.",
        note: "人気や売上などが急に伸びる",
      },
    ],
  }),
  normalizeIdiom({
    id: "look-forward-to",
    phrase: "look forward to",
    family: "look",
    breakdown: "look（見る）+ forward（前へ）+ to（〜へ）",
    tags: ["重要"],
    folderIds: ["eiken-2", "school"],
    favorite: true,
    meanings: [
      {
        id: "look-forward-to-meaning-1",
        meaning: "〜を楽しみにする",
        example: "I look forward to seeing you.",
        note: "to の後ろは名詞または動名詞",
      },
    ],
  }),
];

export function getIdiomFolders(): IdiomFolder[] {
  const saved = readJson<Partial<IdiomFolder>[]>(
    FOLDERS_KEY,
    [],
  );

  if (saved.length === 0) {
    writeJson(FOLDERS_KEY, DEFAULT_FOLDERS);
    return DEFAULT_FOLDERS;
  }

  return saved.map(normalizeFolder);
}

export function saveIdiomFolders(
  folders: IdiomFolder[],
): void {
  writeJson(FOLDERS_KEY, folders);
}

export function createIdiomFolder(input: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): IdiomFolder {
  const folders = getIdiomFolders();

  const nextSortOrder =
    Math.max(
      0,
      ...folders.map((folder) => folder.sortOrder),
    ) + 1;

  const folder = normalizeFolder({
    name: input.name,
    description: input.description ?? "",
    icon: input.icon ?? "📘",
    color: input.color ?? "#7C3AED",
    sortOrder: nextSortOrder,
  });

  saveIdiomFolders([...folders, folder]);

  return folder;
}

export function updateIdiomFolder(
  folderId: string,
  patch: Partial<
    Omit<IdiomFolder, "id" | "createdAt">
  >,
): void {
  saveIdiomFolders(
    getIdiomFolders().map((folder) =>
      folder.id === folderId
        ? normalizeFolder({
            ...folder,
            ...patch,
            updatedAt: Date.now(),
          })
        : folder,
    ),
  );
}

export function deleteIdiomFolder(
  folderId: string,
): void {
  saveIdiomFolders(
    getIdiomFolders().filter(
      (folder) => folder.id !== folderId,
    ),
  );

  saveIdioms(
    getIdioms().map((idiom) => ({
      ...idiom,
      folderIds: idiom.folderIds.filter(
        (id) => id !== folderId,
      ),
      updatedAt: Date.now(),
    })),
  );

  saveIdiomStudySets(
    getIdiomStudySets().map((studySet) => ({
      ...studySet,
      folderIds: studySet.folderIds.filter(
        (id) => id !== folderId,
      ),
    })),
  );
}

export function reorderIdiomFolders(
  orderedIds: string[],
): void {
  const orderMap = new Map(
    orderedIds.map((id, index) => [id, index]),
  );

  saveIdiomFolders(
    getIdiomFolders().map((folder) => ({
      ...folder,
      sortOrder:
        orderMap.get(folder.id) ?? folder.sortOrder,
      updatedAt: Date.now(),
    })),
  );
}

export function getIdioms(): Idiom[] {
  const saved = readJson<Partial<Idiom>[]>(
    IDIOMS_KEY,
    [],
  );

  if (saved.length === 0) {
    writeJson(IDIOMS_KEY, DEFAULT_IDIOMS);
    return DEFAULT_IDIOMS;
  }

  return saved.map(normalizeIdiom);
}

export function saveIdioms(
  idioms: Idiom[],
): void {
  writeJson(IDIOMS_KEY, idioms);
}

export function createIdiom(input: {
  phrase: string;
  meanings: Array<{
    meaning: string;
    example?: string;
    note?: string;
  }>;
  folderIds?: string[];
  tags?: string[];
  family?: string;
  breakdown?: string;
}): Idiom {
  const now = Date.now();

  const idiom = normalizeIdiom({
    phrase: input.phrase,
    meanings: input.meanings.map((meaning) =>
      normalizeMeaning({
        meaning: meaning.meaning,
        example: meaning.example ?? "",
        note: meaning.note ?? "",
        dueAt: now,
      }),
    ),
    folderIds: input.folderIds ?? [],
    tags: input.tags ?? [],
    family: input.family ?? "",
    breakdown: input.breakdown ?? "",
    createdAt: now,
    updatedAt: now,
  });

  saveIdioms([...getIdioms(), idiom]);

  return idiom;
}

export function updateIdiom(
  idiomId: string,
  patch: Partial<
    Omit<Idiom, "id" | "createdAt">
  >,
): void {
  saveIdioms(
    getIdioms().map((idiom) =>
      idiom.id === idiomId
        ? normalizeIdiom({
            ...idiom,
            ...patch,
            updatedAt: Date.now(),
          })
        : idiom,
    ),
  );
}

export function deleteIdiom(
  idiomId: string,
): void {
  saveIdioms(
    getIdioms().filter(
      (idiom) => idiom.id !== idiomId,
    ),
  );
}

export function addMeaningToIdiom(
  idiomId: string,
  input: {
    meaning: string;
    example?: string;
    note?: string;
  },
): void {
  const idiom = getIdioms().find(
    (item) => item.id === idiomId,
  );

  if (!idiom) {
    return;
  }

  updateIdiom(idiomId, {
    meanings: [
      ...idiom.meanings,
      normalizeMeaning({
        meaning: input.meaning,
        example: input.example ?? "",
        note: input.note ?? "",
        dueAt: Date.now(),
      }),
    ],
  });
}

export function updateIdiomMeaning(
  idiomId: string,
  meaningId: string,
  patch: Partial<
    Omit<IdiomMeaning, "id">
  >,
): void {
  const idiom = getIdioms().find(
    (item) => item.id === idiomId,
  );

  if (!idiom) {
    return;
  }

  updateIdiom(idiomId, {
    meanings: idiom.meanings.map((meaning) =>
      meaning.id === meaningId
        ? normalizeMeaning({
            ...meaning,
            ...patch,
          })
        : meaning,
    ),
  });
}

export function deleteIdiomMeaning(
  idiomId: string,
  meaningId: string,
): void {
  const idiom = getIdioms().find(
    (item) => item.id === idiomId,
  );

  if (!idiom) {
    return;
  }

  updateIdiom(idiomId, {
    meanings: idiom.meanings.filter(
      (meaning) => meaning.id !== meaningId,
    ),
  });
}

export function getIdiomsByFolder(
  folderId: string,
): Idiom[] {
  if (folderId === "all") {
    return getIdioms();
  }

  return getIdioms().filter((idiom) =>
    idiom.folderIds.includes(folderId),
  );
}

export function getIdiomsForFolders(
  folderIds: string[],
): Idiom[] {
  if (folderIds.length === 0) {
    return [];
  }

  const selectedIds = new Set(folderIds);

  return getIdioms().filter((idiom) =>
    idiom.folderIds.some((folderId) =>
      selectedIds.has(folderId),
    ),
  );
}

export function getFavoriteIdioms(): Idiom[] {
  return getIdioms().filter(
    (idiom) => idiom.favorite,
  );
}

export function getIdiomsByFamily(
  family: string,
): Idiom[] {
  const normalizedFamily = family
    .trim()
    .toLowerCase();

  return getIdioms().filter(
    (idiom) =>
      idiom.family.trim().toLowerCase() ===
      normalizedFamily,
  );
}

export function searchIdioms(
  query: string,
): Idiom[] {
  const normalizedQuery = query
    .trim()
    .toLowerCase();

  if (!normalizedQuery) {
    return getIdioms();
  }

  return getIdioms().filter((idiom) => {
    const phraseMatched = idiom.phrase
      .toLowerCase()
      .includes(normalizedQuery);

    const meaningMatched = idiom.meanings.some(
      (meaning) =>
        meaning.meaning
          .toLowerCase()
          .includes(normalizedQuery) ||
        meaning.example
          .toLowerCase()
          .includes(normalizedQuery) ||
        meaning.note
          .toLowerCase()
          .includes(normalizedQuery),
    );

    const tagMatched = idiom.tags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery),
    );

    const familyMatched = idiom.family
      .toLowerCase()
      .includes(normalizedQuery);

    const breakdownMatched = idiom.breakdown
      .toLowerCase()
      .includes(normalizedQuery);

    return (
      phraseMatched ||
      meaningMatched ||
      tagMatched ||
      familyMatched ||
      breakdownMatched
    );
  });
}

export function flattenIdiomMeanings(
  idioms: Idiom[] = getIdioms(),
): Array<{
  idiom: Idiom;
  meaning: IdiomMeaning;
}> {
  return idioms.flatMap((idiom) =>
    idiom.meanings.map((meaning) => ({
      idiom,
      meaning,
    })),
  );
}

export function getDueIdiomMeanings(
  now = Date.now(),
): Array<{
  idiom: Idiom;
  meaning: IdiomMeaning;
}> {
  return flattenIdiomMeanings()
    .filter(
      ({ meaning }) => meaning.dueAt <= now,
    )
    .sort(
      (a, b) =>
        a.meaning.dueAt - b.meaning.dueAt,
    );
}

export function getWeakIdiomMeanings(): Array<{
  idiom: Idiom;
  meaning: IdiomMeaning;
}> {
  return flattenIdiomMeanings()
    .filter(({ meaning }) => {
      const hasMoreMistakes =
        meaning.mistakeCount >
        meaning.correctCount;

      const failedAfterReviews =
        meaning.reviewCount >= 2 &&
        meaning.streak === 0;

      return (
        hasMoreMistakes || failedAfterReviews
      );
    })
    .sort((a, b) => {
      const aWeakness =
        a.meaning.mistakeCount -
        a.meaning.correctCount;

      const bWeakness =
        b.meaning.mistakeCount -
        b.meaning.correctCount;

      return bWeakness - aWeakness;
    });
}

export function reviewIdiomMeaning(
  idiomId: string,
  meaningId: string,
  grade: ReviewGrade,
): IdiomMeaning | null {
  const idioms = getIdioms();

  const idiom = idioms.find(
    (item) => item.id === idiomId,
  );

  if (!idiom) {
    return null;
  }

  const targetMeaning = idiom.meanings.find(
    (meaning) => meaning.id === meaningId,
  );

  if (!targetMeaning) {
    return null;
  }

  let nextStage = targetMeaning.reviewStage;
  let intervalMinutes =
    REVIEW_INTERVALS_MINUTES[
      Math.min(
        nextStage,
        REVIEW_INTERVALS_MINUTES.length - 1,
      )
    ];

  if (grade === "again") {
    nextStage = 0;
    intervalMinutes = 10;
  }

  if (grade === "hard") {
    intervalMinutes = Math.max(
      30,
      Math.round(intervalMinutes * 0.5),
    );
  }

  if (grade === "good") {
    nextStage = Math.min(
      nextStage + 1,
      REVIEW_INTERVALS_MINUTES.length - 1,
    );

    intervalMinutes =
      REVIEW_INTERVALS_MINUTES[nextStage];
  }

  if (grade === "easy") {
    nextStage = Math.min(
      nextStage + 2,
      REVIEW_INTERVALS_MINUTES.length - 1,
    );

    intervalMinutes = Math.round(
      REVIEW_INTERVALS_MINUTES[nextStage] * 1.25,
    );
  }

  const correct =
    grade === "good" || grade === "easy";

  const reviewedMeaning: IdiomMeaning = {
    ...targetMeaning,

    reviewStage: nextStage,
    dueAt:
      Date.now() +
      intervalMinutes * 60_000,
    lastReviewedAt: Date.now(),

    reviewCount:
      targetMeaning.reviewCount + 1,

    correctCount:
      targetMeaning.correctCount +
      (correct ? 1 : 0),

    mistakeCount:
      targetMeaning.mistakeCount +
      (correct ? 0 : 1),

    streak: correct
      ? targetMeaning.streak + 1
      : 0,
  };

  updateIdiom(idiomId, {
    meanings: idiom.meanings.map((meaning) =>
      meaning.id === meaningId
        ? reviewedMeaning
        : meaning,
    ),
  });

  incrementIdiomStats(
    "reviewAnswers",
    1,
  );

  return reviewedMeaning;
}

export function getIdiomStats(): IdiomStudyStats {
  return {
    ...EMPTY_STATS,
    ...readJson<
      Partial<IdiomStudyStats>
    >(STATS_KEY, {}),
  };
}

export function saveIdiomStats(
  stats: IdiomStudyStats,
): void {
  writeJson(STATS_KEY, stats);
}

export function incrementIdiomStats(
  key: keyof Omit<
    IdiomStudyStats,
    "lastStudiedAt"
  >,
  amount: number,
): void {
  const stats = getIdiomStats();

  saveIdiomStats({
    ...stats,
    [key]: stats[key] + amount,
    lastStudiedAt: Date.now(),
  });
}

export function addIdiomStudySeconds(
  seconds: number,
): void {
  incrementIdiomStats(
    "totalSeconds",
    Math.max(0, seconds),
  );
}

export function recordIdiomQuizResult(
  correct: boolean,
): void {
  const stats = getIdiomStats();

  saveIdiomStats({
    ...stats,
    quizAnswers: stats.quizAnswers + 1,
    quizCorrect:
      stats.quizCorrect +
      (correct ? 1 : 0),
    lastStudiedAt: Date.now(),
  });
}

export function recordIdiomListen(): void {
  incrementIdiomStats("listenCount", 1);
}

export function getIdiomStudySets(): IdiomStudySet[] {
  return readJson<IdiomStudySet[]>(
    STUDY_SETS_KEY,
    [],
  );
}

export function saveIdiomStudySets(
  studySets: IdiomStudySet[],
): void {
  writeJson(STUDY_SETS_KEY, studySets);
}

export function createIdiomStudySet(input: {
  name: string;
  icon?: string;
  folderIds?: string[];
  includeFavorites?: boolean;
  includeWeak?: boolean;
  includeDue?: boolean;
}): IdiomStudySet {
  const studySet: IdiomStudySet = {
    id: createId("study-set"),
    name: input.name.trim(),
    icon: input.icon ?? "🎯",

    folderIds: input.folderIds ?? [],

    includeFavorites:
      input.includeFavorites ?? false,

    includeWeak:
      input.includeWeak ?? false,

    includeDue:
      input.includeDue ?? true,

    createdAt: Date.now(),
  };

  saveIdiomStudySets([
    ...getIdiomStudySets(),
    studySet,
  ]);

  return studySet;
}

export function updateIdiomStudySet(
  studySetId: string,
  patch: Partial<
    Omit<
      IdiomStudySet,
      "id" | "createdAt"
    >
  >,
): void {
  saveIdiomStudySets(
    getIdiomStudySets().map((studySet) =>
      studySet.id === studySetId
        ? {
            ...studySet,
            ...patch,
          }
        : studySet,
    ),
  );
}

export function deleteIdiomStudySet(
  studySetId: string,
): void {
  saveIdiomStudySets(
    getIdiomStudySets().filter(
      (studySet) =>
        studySet.id !== studySetId,
    ),
  );
}

export function getIdiomsForStudySet(
  studySet: IdiomStudySet,
): Idiom[] {
  const selected = new Map<
    string,
    Idiom
  >();

  for (const idiom of getIdiomsForFolders(
    studySet.folderIds,
  )) {
    selected.set(idiom.id, idiom);
  }

  if (studySet.includeFavorites) {
    for (const idiom of getFavoriteIdioms()) {
      selected.set(idiom.id, idiom);
    }
  }

  if (studySet.includeWeak) {
    for (const { idiom } of getWeakIdiomMeanings()) {
      selected.set(idiom.id, idiom);
    }
  }

  if (studySet.includeDue) {
    for (const { idiom } of getDueIdiomMeanings()) {
      selected.set(idiom.id, idiom);
    }
  }

  return [...selected.values()];
}

export function resetIdiomData(): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(FOLDERS_KEY);
  localStorage.removeItem(IDIOMS_KEY);
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(STUDY_SETS_KEY);

  window.dispatchEvent(
    new Event("study-os-idioms-updated"),
  );
}