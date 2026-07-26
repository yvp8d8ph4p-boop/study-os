"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Category =
  | "四字熟語"
  | "慣用句"
  | "ことわざ"
  | "類義語"
  | "対義語"
  | "同音異義語"
  | "同訓異字"
  | "カタカナ語"
  | "入試頻出語";

type Vocabulary = {
  id: number;
  word: string;
  meaning: string;
  category: Category;
  example: string;
  memo: string;
  favorite: boolean;
  learned: boolean;
  correct: number;
  wrong: number;
  createdAt: number;
};

type StudyStats = {
  totalAnswers: number;
  correctAnswers: number;
  listeningCount: number;
  cardCount: number;
};

type Tab =
  | "register"
  | "list"
  | "cards"
  | "quiz"
  | "listening"
  | "stats"
  | "settings";

type QuizMode = "wordToMeaning" | "meaningToWord" | "choice";

const VOCABULARY_STORAGE_KEY = "study-os-japanese-vocabulary";
const STATS_STORAGE_KEY = "study-os-japanese-vocabulary-stats";

const categories: Category[] = [
  "四字熟語",
  "慣用句",
  "ことわざ",
  "類義語",
  "対義語",
  "同音異義語",
  "同訓異字",
  "カタカナ語",
  "入試頻出語",
];

const emptyStats: StudyStats = {
  totalAnswers: 0,
  correctAnswers: 0,
  listeningCount: 0,
  cardCount: 0,
};

function shuffleItems<T>(items: T[]) {
  const copied = [...items];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[randomIndex]] = [
      copied[randomIndex],
      copied[index],
    ];
  }

  return copied;
}

function normalizeAnswer(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[。．、,.・！!？?「」『』（）()]/g, "");
}

function isCorrectAnswer(input: string, answer: string) {
  const normalizedInput = normalizeAnswer(input);

  if (normalizedInput === "") {
    return false;
  }

  const possibleAnswers = answer
    .split(/[、,，/／;；|・]/)
    .map((item) => normalizeAnswer(item))
    .filter(Boolean);

  return possibleAnswers.some(
    (possibleAnswer) =>
      normalizedInput === possibleAnswer ||
      possibleAnswer.includes(normalizedInput),
  );
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    categories.includes(value as Category)
  );
}

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("register");

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [category, setCategory] =
    useState<Category>("入試頻出語");
  const [example, setExample] = useState("");
  const [memo, setMemo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );

  const [items, setItems] = useState<Vocabulary[]>([]);
  const [stats, setStats] =
    useState<StudyStats>(emptyStats);
  const [isLoaded, setIsLoaded] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    Category | "すべて"
  >("すべて");
  const [showWeakOnly, setShowWeakOnly] = useState(false);
  const [showFavoriteOnly, setShowFavoriteOnly] =
    useState(false);
  const [showUnlearnedOnly, setShowUnlearnedOnly] =
    useState(false);
  const [sortMode, setSortMode] = useState<
    "newest" | "oldest" | "kana" | "weak" | "favorite"
  >("newest");

  const [cardItems, setCardItems] = useState<Vocabulary[]>(
    [],
  );
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardWeakOnly, setCardWeakOnly] = useState(false);
  const [cardFavoriteOnly, setCardFavoriteOnly] =
    useState(false);

  const [quizItems, setQuizItems] = useState<Vocabulary[]>(
    [],
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizMode, setQuizMode] =
    useState<QuizMode>("wordToMeaning");
  const [quizInput, setQuizInput] = useState("");
  const [quizFeedback, setQuizFeedback] = useState("");
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizWrong, setQuizWrong] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizWeakOnly, setQuizWeakOnly] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState<
    string[]
  >([]);

  const [speechRate, setSpeechRate] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [currentListeningItem, setCurrentListeningItem] =
    useState<Vocabulary | null>(null);
  const listeningRef = useRef(false);
  const importInputRef = useRef<HTMLInputElement | null>(
    null,
  );

  useEffect(() => {
    const savedItems = localStorage.getItem(
      VOCABULARY_STORAGE_KEY,
    );
    const savedStats = localStorage.getItem(
      STATS_STORAGE_KEY,
    );

    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems) as Partial<Vocabulary>[];

        const repairedItems: Vocabulary[] = parsed
          .filter(
            (item) =>
              typeof item.id === "number" &&
              typeof item.word === "string" &&
              typeof item.meaning === "string",
          )
          .map((item) => ({
            id: item.id as number,
            word: item.word as string,
            meaning: item.meaning as string,
            category: isCategory(item.category)
              ? item.category
              : "入試頻出語",
            example:
              typeof item.example === "string"
                ? item.example
                : "",
            memo:
              typeof item.memo === "string"
                ? item.memo
                : "",
            favorite:
              typeof item.favorite === "boolean"
                ? item.favorite
                : false,
            learned:
              typeof item.learned === "boolean"
                ? item.learned
                : false,
            correct:
              typeof item.correct === "number"
                ? item.correct
                : 0,
            wrong:
              typeof item.wrong === "number"
                ? item.wrong
                : 0,
            createdAt:
              typeof item.createdAt === "number"
                ? item.createdAt
                : item.id as number,
          }));

        setItems(repairedItems);
      } catch {
        console.error("語彙データを読み込めませんでした。");
      }
    }

    if (savedStats) {
      try {
        const parsed = JSON.parse(
          savedStats,
        ) as Partial<StudyStats>;

        setStats({
          totalAnswers:
            typeof parsed.totalAnswers === "number"
              ? parsed.totalAnswers
              : 0,
          correctAnswers:
            typeof parsed.correctAnswers === "number"
              ? parsed.correctAnswers
              : 0,
          listeningCount:
            typeof parsed.listeningCount === "number"
              ? parsed.listeningCount
              : 0,
          cardCount:
            typeof parsed.cardCount === "number"
              ? parsed.cardCount
              : 0,
        });
      } catch {
        console.error("学習記録を読み込めませんでした。");
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(
      VOCABULARY_STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(
      STATS_STORAGE_KEY,
      JSON.stringify(stats),
    );
  }, [stats, isLoaded]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const weakItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.wrong > 0 && item.wrong >= item.correct,
      ),
    [items],
  );

  const favoriteItems = useMemo(
    () => items.filter((item) => item.favorite),
    [items],
  );

  const learnedItems = useMemo(
    () => items.filter((item) => item.learned),
    [items],
  );

  const displayedItems = useMemo(() => {
    const normalizedSearch = searchText
      .trim()
      .toLowerCase();

    const filtered = items.filter((item) => {
      const matchesSearch =
        normalizedSearch === "" ||
        item.word.toLowerCase().includes(normalizedSearch) ||
        item.meaning
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.example
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.memo.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "すべて" ||
        item.category === categoryFilter;

      const matchesWeak =
        !showWeakOnly ||
        (item.wrong > 0 && item.wrong >= item.correct);

      const matchesFavorite =
        !showFavoriteOnly || item.favorite;

      const matchesUnlearned =
        !showUnlearnedOnly || !item.learned;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWeak &&
        matchesFavorite &&
        matchesUnlearned
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "oldest") {
        return a.createdAt - b.createdAt;
      }

      if (sortMode === "kana") {
        return a.word.localeCompare(b.word, "ja");
      }

      if (sortMode === "weak") {
        return (
          b.wrong -
          b.correct -
          (a.wrong - a.correct)
        );
      }

      if (sortMode === "favorite") {
        return Number(b.favorite) - Number(a.favorite);
      }

      return b.createdAt - a.createdAt;
    });
  }, [
    items,
    searchText,
    categoryFilter,
    showWeakOnly,
    showFavoriteOnly,
    showUnlearnedOnly,
    sortMode,
  ]);

  const totalAnswers = items.reduce(
    (total, item) => total + item.correct + item.wrong,
    0,
  );

  const totalCorrect = items.reduce(
    (total, item) => total + item.correct,
    0,
  );

  const correctRate =
    stats.totalAnswers === 0
      ? 0
      : Math.round(
          (stats.correctAnswers / stats.totalAnswers) * 100,
        );

  const quizRate =
    quizCorrect + quizWrong === 0
      ? 0
      : Math.round(
          (quizCorrect / (quizCorrect + quizWrong)) * 100,
        );

  const panelStyle: CSSProperties = {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "clamp(18px, 4vw, 30px)",
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 10px 32px rgba(15, 23, 42, 0.08)",
  };

  const buttonStyle: CSSProperties = {
    padding: "13px 18px",
    border: "none",
    borderRadius: "13px",
    fontSize: "17px",
    fontWeight: 800,
    cursor: "pointer",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "14px",
    fontSize: "18px",
    borderRadius: "13px",
    border: "1px solid #CBD5E1",
    boxSizing: "border-box",
    background: "white",
    color: "#0F172A",
  };

  function resetForm() {
    setWord("");
    setMeaning("");
    setCategory("入試頻出語");
    setExample("");
    setMemo("");
    setEditingId(null);
  }

  function saveItem() {
    const trimmedWord = word.trim();
    const trimmedMeaning = meaning.trim();

    if (trimmedWord === "" || trimmedMeaning === "") {
      alert("語句と意味を両方入力してね！");
      return;
    }

    if (editingId !== null) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                word: trimmedWord,
                meaning: trimmedMeaning,
                category,
                example: example.trim(),
                memo: memo.trim(),
              }
            : item,
        ),
      );

      resetForm();
      setActiveTab("list");
      return;
    }

    const duplicate = items.some(
      (item) =>
        normalizeAnswer(item.word) ===
        normalizeAnswer(trimmedWord),
    );

    if (
      duplicate &&
      !window.confirm(
        "同じ語句がすでにあります。それでも登録しますか？",
      )
    ) {
      return;
    }

    const now = Date.now();

    setItems((current) => [
      ...current,
      {
        id: now,
        word: trimmedWord,
        meaning: trimmedMeaning,
        category,
        example: example.trim(),
        memo: memo.trim(),
        favorite: false,
        learned: false,
        correct: 0,
        wrong: 0,
        createdAt: now,
      },
    ]);

    resetForm();
  }

  function startEditing(item: Vocabulary) {
    setWord(item.word);
    setMeaning(item.meaning);
    setCategory(item.category);
    setExample(item.example);
    setMemo(item.memo);
    setEditingId(item.id);
    setActiveTab("register");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteItem(item: Vocabulary) {
    if (
      !window.confirm(`「${item.word}」を削除しますか？`)
    ) {
      return;
    }

    setItems((current) =>
      current.filter(
        (currentItem) => currentItem.id !== item.id,
      ),
    );

    if (editingId === item.id) {
      resetForm();
    }
  }

  function toggleFavorite(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, favorite: !item.favorite }
          : item,
      ),
    );
  }

  function toggleLearned(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, learned: !item.learned }
          : item,
      ),
    );
  }

  function handleRegisterEnter(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      saveItem();
    }
  }

  function startCards() {
    let available = items;

    if (cardWeakOnly) {
      available = available.filter(
        (item) =>
          item.wrong > 0 && item.wrong >= item.correct,
      );
    }

    if (cardFavoriteOnly) {
      available = available.filter(
        (item) => item.favorite,
      );
    }

    if (available.length === 0) {
      alert("条件に合う語彙がありません。");
      return;
    }

    setCardItems(shuffleItems(available));
    setCardIndex(0);
    setCardFlipped(false);
    setStats((current) => ({
      ...current,
      cardCount: current.cardCount + 1,
    }));
  }

  function goToNextCard() {
    if (cardItems.length === 0) return;

    setCardIndex(
      (current) => (current + 1) % cardItems.length,
    );
    setCardFlipped(false);
  }

  function goToPreviousCard() {
    if (cardItems.length === 0) return;

    setCardIndex(
      (current) =>
        (current - 1 + cardItems.length) %
        cardItems.length,
    );
    setCardFlipped(false);
  }

  function generateChoiceOptions(
    target: Vocabulary,
    source: Vocabulary[],
  ) {
    const wrongMeanings = shuffleItems(
      source
        .filter((item) => item.id !== target.id)
        .map((item) => item.meaning)
        .filter(
          (value, index, array) =>
            array.indexOf(value) === index,
        ),
    ).slice(0, 3);

    setChoiceOptions(
      shuffleItems([target.meaning, ...wrongMeanings]),
    );
  }

  function startQuiz() {
    const available = quizWeakOnly ? weakItems : items;

    if (available.length === 0) {
      alert(
        quizWeakOnly
          ? "苦手な語彙がまだありません。"
          : "先に語彙を登録してね！",
      );
      return;
    }

    if (quizMode === "choice" && available.length < 2) {
      alert("四択クイズには2語以上必要です。");
      return;
    }

    const shuffled = shuffleItems(available);

    setQuizItems(shuffled);
    setQuizIndex(0);
    setQuizInput("");
    setQuizFeedback("");
    setQuizCorrect(0);
    setQuizWrong(0);
    setQuizFinished(false);

    if (quizMode === "choice") {
      generateChoiceOptions(shuffled[0], available);
    }
  }

  function recordQuizResult(
    target: Vocabulary,
    correct: boolean,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === target.id
          ? {
              ...item,
              correct: item.correct + (correct ? 1 : 0),
              wrong: item.wrong + (correct ? 0 : 1),
            }
          : item,
      ),
    );

    setStats((current) => ({
      ...current,
      totalAnswers: current.totalAnswers + 1,
      correctAnswers:
        current.correctAnswers + (correct ? 1 : 0),
    }));

    if (correct) {
      setQuizCorrect((current) => current + 1);
    } else {
      setQuizWrong((current) => current + 1);
    }
  }

  function submitQuizAnswer(selectedChoice?: string) {
    if (
      quizFinished ||
      quizItems.length === 0 ||
      quizFeedback !== ""
    ) {
      return;
    }

    const current = quizItems[quizIndex];
    let correct = false;
    let answerText = "";

    if (quizMode === "wordToMeaning") {
      if (quizInput.trim() === "") {
        alert("意味を入力してね！");
        return;
      }

      correct = isCorrectAnswer(
        quizInput,
        current.meaning,
      );
      answerText = current.meaning;
    } else if (quizMode === "meaningToWord") {
      if (quizInput.trim() === "") {
        alert("語句を入力してね！");
        return;
      }

      correct = isCorrectAnswer(quizInput, current.word);
      answerText = current.word;
    } else {
      if (!selectedChoice) return;

      correct =
        normalizeAnswer(selectedChoice) ===
        normalizeAnswer(current.meaning);
      answerText = current.meaning;
    }

    setQuizFeedback(
      correct ? "⭕ 正解！" : `❌ 不正解　正解：${answerText}`,
    );

    recordQuizResult(current, correct);
  }

  function goToNextQuiz() {
    if (quizIndex + 1 >= quizItems.length) {
      setQuizFinished(true);
      setQuizFeedback("");
      return;
    }

    const nextIndex = quizIndex + 1;

    setQuizIndex(nextIndex);
    setQuizInput("");
    setQuizFeedback("");

    if (quizMode === "choice") {
      generateChoiceOptions(
        quizItems[nextIndex],
        quizWeakOnly ? weakItems : items,
      );
    }
  }

  function handleQuizEnter(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Enter") return;

    if (quizFeedback === "") {
      submitQuizAnswer();
    } else {
      goToNextQuiz();
    }
  }

  function speakText(text: string) {
    return new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = "ja-JP";
      utterance.rate = speechRate;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  async function startListening() {
    if (items.length === 0) {
      alert("先に語彙を登録してね！");
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("このブラウザは音声読み上げに対応していません。");
      return;
    }

    window.speechSynthesis.cancel();
    listeningRef.current = true;
    setIsListening(true);
    setStats((current) => ({
      ...current,
      listeningCount: current.listeningCount + 1,
    }));

    for (const item of items) {
      if (!listeningRef.current) break;

      setCurrentListeningItem(item);
      await speakText(item.word);

      if (!listeningRef.current) break;

      await wait(500);
      await speakText(item.meaning);

      if (!listeningRef.current) break;

      await wait(900);
    }

    listeningRef.current = false;
    setIsListening(false);
    setCurrentListeningItem(null);
  }

  function stopListening() {
    listeningRef.current = false;
    setIsListening(false);
    setCurrentListeningItem(null);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function exportData() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
      stats,
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `study-os-vocabulary-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(
          String(reader.result),
        ) as {
          items?: Partial<Vocabulary>[];
          stats?: Partial<StudyStats>;
        };

        if (!Array.isArray(parsed.items)) {
          throw new Error("items is not an array");
        }

        const repairedItems: Vocabulary[] =
          parsed.items
            .filter(
              (item) =>
                typeof item.id === "number" &&
                typeof item.word === "string" &&
                typeof item.meaning === "string",
            )
            .map((item) => ({
              id: item.id as number,
              word: item.word as string,
              meaning: item.meaning as string,
              category: isCategory(item.category)
                ? item.category
                : "入試頻出語",
              example:
                typeof item.example === "string"
                  ? item.example
                  : "",
              memo:
                typeof item.memo === "string"
                  ? item.memo
                  : "",
              favorite:
                typeof item.favorite === "boolean"
                  ? item.favorite
                  : false,
              learned:
                typeof item.learned === "boolean"
                  ? item.learned
                  : false,
              correct:
                typeof item.correct === "number"
                  ? item.correct
                  : 0,
              wrong:
                typeof item.wrong === "number"
                  ? item.wrong
                  : 0,
              createdAt:
                typeof item.createdAt === "number"
                  ? item.createdAt
                  : item.id as number,
            }));

        if (
          !window.confirm(
            `現在のデータを上書きして、${repairedItems.length}語を読み込みますか？`,
          )
        ) {
          return;
        }

        setItems(repairedItems);

        if (parsed.stats) {
          setStats({
            totalAnswers:
              typeof parsed.stats.totalAnswers ===
              "number"
                ? parsed.stats.totalAnswers
                : 0,
            correctAnswers:
              typeof parsed.stats.correctAnswers ===
              "number"
                ? parsed.stats.correctAnswers
                : 0,
            listeningCount:
              typeof parsed.stats.listeningCount ===
              "number"
                ? parsed.stats.listeningCount
                : 0,
            cardCount:
              typeof parsed.stats.cardCount === "number"
                ? parsed.stats.cardCount
                : 0,
          });
        }

        alert("データを読み込みました！");
      } catch {
        alert("このJSONファイルは読み込めませんでした。");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function resetAllData() {
    if (
      !window.confirm(
        "登録語彙と学習記録をすべて削除します。本当にいいですか？",
      )
    ) {
      return;
    }

    stopListening();
    setItems([]);
    setStats(emptyStats);
    setCardItems([]);
    setQuizItems([]);
    setQuizFinished(false);
    setQuizFeedback("");
    resetForm();

    localStorage.removeItem(VOCABULARY_STORAGE_KEY);
    localStorage.removeItem(STATS_STORAGE_KEY);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "register", label: "✏️ 登録" },
    { id: "list", label: "📚 一覧" },
    { id: "cards", label: "🃏 カード" },
    { id: "quiz", label: "📝 クイズ" },
    { id: "listening", label: "🔊 流し聞き" },
    { id: "stats", label: "📊 記録" },
    { id: "settings", label: "⚙️ 設定" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #ECFEFF 0%, #F8FAFC 48%, #FFFFFF 100%)",
        padding: "32px 16px 70px",
        color: "#0F172A",
      }}
    >
      <header
        style={{
          maxWidth: "860px",
          margin: "0 auto 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 13px",
            borderRadius: "999px",
            background: "#CFFAFE",
            color: "#0E7490",
            fontWeight: 900,
            marginBottom: "10px",
          }}
        >
          STUDY OS・国語
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(38px, 8vw, 62px)",
            color: "#0891B2",
            letterSpacing: "-0.04em",
          }}
        >
          📚 語彙
        </h1>

        <p
          style={{
            color: "#64748B",
            fontSize: "18px",
            margin: "10px 0 0",
          }}
        >
          登録・カード学習・クイズ・復習をひとまとめ
        </p>
      </header>

      <nav
        style={{
          maxWidth: "860px",
          margin: "0 auto 24px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(112px, 1fr))",
          gap: "9px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              stopListening();
              setActiveTab(tab.id);
            }}
            style={{
              ...buttonStyle,
              padding: "12px 10px",
              background:
                activeTab === tab.id ? "#0891B2" : "white",
              color:
                activeTab === tab.id ? "white" : "#334155",
              boxShadow:
                "0 5px 16px rgba(15, 23, 42, 0.08)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {!isLoaded ? (
        <section style={panelStyle}>
          <p
            style={{
              textAlign: "center",
              fontSize: "20px",
            }}
          >
            読み込み中...
          </p>
        </section>
      ) : (
        <>
          {activeTab === "register" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "29px",
                  marginTop: 0,
                }}
              >
                {editingId === null
                  ? "✏️ 語彙を登録"
                  : "🛠️ 語彙を編集"}
              </h2>

              <div style={{ display: "grid", gap: "14px" }}>
                <input
                  value={word}
                  onChange={(event) =>
                    setWord(event.target.value)
                  }
                  onKeyDown={handleRegisterEnter}
                  placeholder="語句を入力"
                  style={inputStyle}
                />

                <textarea
                  value={meaning}
                  onChange={(event) =>
                    setMeaning(event.target.value)
                  }
                  placeholder="意味を入力"
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value as Category,
                    )
                  }
                  style={inputStyle}
                >
                  {categories.map((categoryName) => (
                    <option
                      key={categoryName}
                      value={categoryName}
                    >
                      {categoryName}
                    </option>
                  ))}
                </select>

                <textarea
                  value={example}
                  onChange={(event) =>
                    setExample(event.target.value)
                  }
                  placeholder="例文（任意）"
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />

                <textarea
                  value={memo}
                  onChange={(event) =>
                    setMemo(event.target.value)
                  }
                  placeholder="メモ（任意）"
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={saveItem}
                    style={{
                      ...buttonStyle,
                      flex: "1 1 220px",
                      background: "#0891B2",
                      color: "white",
                    }}
                  >
                    {editingId === null
                      ? "＋ 登録する"
                      : "✓ 変更を保存"}
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{
                        ...buttonStyle,
                        flex: "1 1 160px",
                        background: "#E2E8F0",
                        color: "#334155",
                      }}
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </div>

              {items.length === 0 && (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "24px",
                    borderRadius: "18px",
                    background: "#ECFEFF",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      color: "#0E7490",
                    }}
                  >
                    まだ語彙が登録されていません
                  </div>
                  <p
                    style={{
                      marginBottom: 0,
                      color: "#64748B",
                    }}
                  >
                    最初の語彙を追加しましょう
                  </p>
                </div>
              )}
            </section>
          )}

          {activeTab === "list" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "29px",
                  marginTop: 0,
                }}
              >
                📚 語彙一覧
              </h2>

              <p
                style={{
                  textAlign: "center",
                  color: "#64748B",
                }}
              >
                全{items.length}語・苦手{weakItems.length}語・
                お気に入り{favoriteItems.length}語
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "10px",
                  margin: "20px 0",
                }}
              >
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  placeholder="語句・意味・例文・メモを検索"
                  style={inputStyle}
                />

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value as
                        | Category
                        | "すべて",
                    )
                  }
                  style={inputStyle}
                >
                  <option value="すべて">
                    すべてのカテゴリ
                  </option>
                  {categories.map((categoryName) => (
                    <option
                      key={categoryName}
                      value={categoryName}
                    >
                      {categoryName}
                    </option>
                  ))}
                </select>

                <select
                  value={sortMode}
                  onChange={(event) =>
                    setSortMode(
                      event.target.value as typeof sortMode,
                    )
                  }
                  style={inputStyle}
                >
                  <option value="newest">新しい順</option>
                  <option value="oldest">古い順</option>
                  <option value="kana">あいうえお順</option>
                  <option value="weak">苦手順</option>
                  <option value="favorite">
                    お気に入り優先
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowWeakOnly((current) => !current)
                  }
                  style={{
                    ...buttonStyle,
                    background: showWeakOnly
                      ? "#F59E0B"
                      : "#E2E8F0",
                    color: showWeakOnly
                      ? "white"
                      : "#334155",
                  }}
                >
                  🔥 苦手だけ
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowFavoriteOnly(
                      (current) => !current,
                    )
                  }
                  style={{
                    ...buttonStyle,
                    background: showFavoriteOnly
                      ? "#EC4899"
                      : "#E2E8F0",
                    color: showFavoriteOnly
                      ? "white"
                      : "#334155",
                  }}
                >
                  ★ お気に入り
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowUnlearnedOnly(
                      (current) => !current,
                    )
                  }
                  style={{
                    ...buttonStyle,
                    background: showUnlearnedOnly
                      ? "#7C3AED"
                      : "#E2E8F0",
                    color: showUnlearnedOnly
                      ? "white"
                      : "#334155",
                  }}
                >
                  未学習だけ
                </button>
              </div>

              {displayedItems.length === 0 ? (
                <div
                  style={{
                    padding: "30px 10px",
                    textAlign: "center",
                    color: "#64748B",
                    fontSize: "18px",
                  }}
                >
                  {items.length === 0
                    ? "まだ語彙が登録されていません"
                    : "条件に合う語彙がありません"}
                </div>
              ) : (
                <div style={{ display: "grid", gap: "13px" }}>
                  {displayedItems.map((item) => (
                    <article
                      key={item.id}
                      style={{
                        padding: "18px",
                        border: "1px solid #E2E8F0",
                        borderRadius: "17px",
                        background: "#F8FAFC",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: "1 1 280px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "9px",
                              flexWrap: "wrap",
                            }}
                          >
                            <strong
                              style={{
                                fontSize: "23px",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {item.word}
                            </strong>

                            <span
                              style={{
                                padding: "5px 9px",
                                borderRadius: "999px",
                                background: "#CFFAFE",
                                color: "#0E7490",
                                fontSize: "13px",
                                fontWeight: 800,
                              }}
                            >
                              {item.category}
                            </span>
                          </div>

                          <p
                            style={{
                              margin: "9px 0 0",
                              fontSize: "18px",
                              color: "#334155",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {item.meaning}
                          </p>

                          {item.example && (
                            <p
                              style={{
                                margin: "10px 0 0",
                                color: "#475569",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              <strong>例文：</strong>
                              {item.example}
                            </p>
                          )}

                          {item.memo && (
                            <p
                              style={{
                                margin: "8px 0 0",
                                color: "#64748B",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              <strong>メモ：</strong>
                              {item.memo}
                            </p>
                          )}

                          <p
                            style={{
                              margin: "10px 0 0",
                              color: "#64748B",
                              fontSize: "14px",
                            }}
                          >
                            ⭕ {item.correct}回　❌{" "}
                            {item.wrong}回　
                            {item.learned
                              ? "✅ 覚えた"
                              : "⬜ 未学習"}
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "7px",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleFavorite(item.id)
                            }
                            title="お気に入り"
                            style={{
                              ...buttonStyle,
                              padding: "10px 12px",
                              background: item.favorite
                                ? "#FCE7F3"
                                : "#E2E8F0",
                              color: item.favorite
                                ? "#BE185D"
                                : "#475569",
                            }}
                          >
                            {item.favorite ? "★" : "☆"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleLearned(item.id)
                            }
                            title="学習済み"
                            style={{
                              ...buttonStyle,
                              padding: "10px 12px",
                              background: item.learned
                                ? "#DCFCE7"
                                : "#E2E8F0",
                            }}
                          >
                            {item.learned ? "✅" : "⬜"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              startEditing(item)
                            }
                            title="編集"
                            style={{
                              ...buttonStyle,
                              padding: "10px 12px",
                              background: "#DBEAFE",
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteItem(item)}
                            title="削除"
                            style={{
                              ...buttonStyle,
                              padding: "10px 12px",
                              background: "#FEE2E2",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "cards" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "29px",
                  marginTop: 0,
                }}
              >
                🃏 カード学習
              </h2>

              {cardItems.length === 0 ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "18px",
                      flexWrap: "wrap",
                      marginBottom: "22px",
                    }}
                  >
                    <label
                      style={{
                        display: "inline-flex",
                        gap: "8px",
                        alignItems: "center",
                        fontWeight: 800,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={cardWeakOnly}
                        onChange={(event) =>
                          setCardWeakOnly(
                            event.target.checked,
                          )
                        }
                      />
                      🔥 苦手だけ
                    </label>

                    <label
                      style={{
                        display: "inline-flex",
                        gap: "8px",
                        alignItems: "center",
                        fontWeight: 800,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={cardFavoriteOnly}
                        onChange={(event) =>
                          setCardFavoriteOnly(
                            event.target.checked,
                          )
                        }
                      />
                      ★ お気に入りだけ
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={startCards}
                    style={{
                      ...buttonStyle,
                      background: "#7C3AED",
                      color: "white",
                      minWidth: "230px",
                    }}
                  >
                    カード学習を始める
                  </button>
                </div>
              ) : (
                <div>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748B",
                    }}
                  >
                    {cardIndex + 1} / {cardItems.length}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setCardFlipped((current) => !current)
                    }
                    style={{
                      width: "100%",
                      minHeight: "310px",
                      border: "none",
                      borderRadius: "24px",
                      background: cardFlipped
                        ? "#ECFEFF"
                        : "#F5F3FF",
                      boxShadow:
                        "0 12px 32px rgba(15, 23, 42, 0.1)",
                      padding: "30px",
                      cursor: "pointer",
                      color: "#0F172A",
                    }}
                  >
                    {!cardFlipped ? (
                      <div>
                        <div
                          style={{
                            color: "#7C3AED",
                            fontWeight: 900,
                            marginBottom: "18px",
                          }}
                        >
                          {cardItems[cardIndex].category}
                        </div>
                        <div
                          style={{
                            fontSize:
                              "clamp(34px, 7vw, 56px)",
                            fontWeight: 900,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {cardItems[cardIndex].word}
                        </div>
                        <p
                          style={{
                            color: "#64748B",
                            marginTop: "28px",
                          }}
                        >
                          タップして意味を見る
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: "27px",
                            fontWeight: 900,
                            color: "#0891B2",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {cardItems[cardIndex].meaning}
                        </div>

                        {cardItems[cardIndex].example && (
                          <p
                            style={{
                              marginTop: "22px",
                              color: "#475569",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            例文：
                            {cardItems[cardIndex].example}
                          </p>
                        )}

                        {cardItems[cardIndex].memo && (
                          <p
                            style={{
                              marginTop: "12px",
                              color: "#64748B",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            メモ：
                            {cardItems[cardIndex].memo}
                          </p>
                        )}
                      </div>
                    )}
                  </button>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={goToPreviousCard}
                      style={{
                        ...buttonStyle,
                        background: "#E2E8F0",
                      }}
                    >
                      ← 前へ
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleLearned(
                          cardItems[cardIndex].id,
                        )
                      }
                      style={{
                        ...buttonStyle,
                        background: "#DCFCE7",
                      }}
                    >
                      ✅ 覚えた
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleFavorite(
                          cardItems[cardIndex].id,
                        )
                      }
                      style={{
                        ...buttonStyle,
                        background: "#FCE7F3",
                      }}
                    >
                      ★ お気に入り
                    </button>

                    <button
                      type="button"
                      onClick={goToNextCard}
                      style={{
                        ...buttonStyle,
                        background: "#0891B2",
                        color: "white",
                      }}
                    >
                      次へ →
                    </button>
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "18px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCardItems([]);
                        setCardFlipped(false);
                      }}
                      style={{
                        ...buttonStyle,
                        background: "#FEE2E2",
                        color: "#B91C1C",
                      }}
                    >
                      カード学習を終了
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "quiz" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "29px",
                  marginTop: 0,
                }}
              >
                📝 語彙クイズ
              </h2>

              {quizItems.length === 0 || quizFinished ? (
                <div style={{ textAlign: "center" }}>
                  {quizFinished && (
                    <div
                      style={{
                        padding: "24px",
                        borderRadius: "18px",
                        background: "#ECFEFF",
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "30px",
                          fontWeight: 900,
                          color: "#0891B2",
                        }}
                      >
                        クイズ終了！
                      </div>
                      <p style={{ fontSize: "22px" }}>
                        ⭕ {quizCorrect}問　❌ {quizWrong}問
                      </p>
                      <strong style={{ fontSize: "25px" }}>
                        正答率：{quizRate}%
                      </strong>
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                      maxWidth: "430px",
                      margin: "0 auto 20px",
                    }}
                  >
                    <select
                      value={quizMode}
                      onChange={(event) =>
                        setQuizMode(
                          event.target.value as QuizMode,
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="wordToMeaning">
                        語句 → 意味を入力
                      </option>
                      <option value="meaningToWord">
                        意味 → 語句を入力
                      </option>
                      <option value="choice">
                        語句 → 意味を選ぶ
                      </option>
                    </select>

                    <label
                      style={{
                        display: "inline-flex",
                        justifyContent: "center",
                        gap: "8px",
                        alignItems: "center",
                        fontWeight: 800,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={quizWeakOnly}
                        onChange={(event) =>
                          setQuizWeakOnly(
                            event.target.checked,
                          )
                        }
                      />
                      🔥 苦手だけ出題
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={startQuiz}
                    style={{
                      ...buttonStyle,
                      background: "#7C3AED",
                      color: "white",
                      minWidth: "230px",
                    }}
                  >
                    🎮 クイズ開始
                  </button>

                  <p
                    style={{
                      color: "#64748B",
                      marginTop: "16px",
                    }}
                  >
                    {quizWeakOnly
                      ? `苦手：${weakItems.length}語`
                      : `登録：${items.length}語`}
                  </p>
                </div>
              ) : (
                <div>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748B",
                    }}
                  >
                    第{quizIndex + 1}問 / {quizItems.length}問
                  </p>

                  <div
                    style={{
                      textAlign: "center",
                      margin: "26px 0",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748B",
                        fontWeight: 800,
                        marginBottom: "10px",
                      }}
                    >
                      {quizMode === "meaningToWord"
                        ? "この意味の語句は？"
                        : "この語句の意味は？"}
                    </div>

                    <div
                      style={{
                        fontSize: "clamp(34px, 7vw, 56px)",
                        fontWeight: 900,
                        color: "#0891B2",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {quizMode === "meaningToWord"
                        ? quizItems[quizIndex].meaning
                        : quizItems[quizIndex].word}
                    </div>
                  </div>

                  {quizMode === "choice" ? (
                    <div
                      style={{
                        display: "grid",
                        gap: "10px",
                      }}
                    >
                      {choiceOptions.map(
                        (option, optionIndex) => (
                          <button
                            key={`${option}-${optionIndex}`}
                            type="button"
                            disabled={quizFeedback !== ""}
                            onClick={() =>
                              submitQuizAnswer(option)
                            }
                            style={{
                              ...buttonStyle,
                              padding: "16px",
                              textAlign: "left",
                              background: "#F8FAFC",
                              border:
                                "1px solid #CBD5E1",
                              color: "#0F172A",
                            }}
                          >
                            {String.fromCharCode(
                              65 + optionIndex,
                            )}
                            . {option}
                          </button>
                        ),
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={quizInput}
                      disabled={quizFeedback !== ""}
                      onChange={(event) =>
                        setQuizInput(event.target.value)
                      }
                      onKeyDown={handleQuizEnter}
                      autoFocus
                      placeholder={
                        quizMode === "wordToMeaning"
                          ? "意味を入力"
                          : "語句を入力"
                      }
                      style={{
                        ...inputStyle,
                        textAlign: "center",
                        fontSize: "21px",
                        border: "2px solid #CBD5E1",
                      }}
                    />
                  )}

                  {quizFeedback && (
                    <div
                      style={{
                        marginTop: "18px",
                        padding: "17px",
                        borderRadius: "14px",
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: 900,
                        background: quizFeedback.startsWith(
                          "⭕",
                        )
                          ? "#DCFCE7"
                          : "#FEE2E2",
                      }}
                    >
                      {quizFeedback}
                    </div>
                  )}

                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "20px",
                    }}
                  >
                    {quizFeedback === "" ? (
                      quizMode !== "choice" && (
                        <button
                          type="button"
                          onClick={() => submitQuizAnswer()}
                          style={{
                            ...buttonStyle,
                            background: "#7C3AED",
                            color: "white",
                            minWidth: "190px",
                          }}
                        >
                          答える
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={goToNextQuiz}
                        style={{
                          ...buttonStyle,
                          background: "#0891B2",
                          color: "white",
                          minWidth: "190px",
                        }}
                      >
                        {quizIndex + 1 >= quizItems.length
                          ? "結果を見る"
                          : "次の問題へ"}
                      </button>
                    )}
                  </div>

                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748B",
                      marginTop: "18px",
                    }}
                  >
                    ⭕ {quizCorrect}　❌ {quizWrong}
                  </p>
                </div>
              )}
            </section>
          )}

          {activeTab === "listening" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "29px",
                  marginTop: 0,
                }}
              >
                🔊 流し聞き
              </h2>

              <p
                style={{
                  textAlign: "center",
                  color: "#64748B",
                }}
              >
                語句のあとに意味を読み上げます
              </p>

              <label
                style={{
                  display: "block",
                  maxWidth: "360px",
                  margin: "25px auto",
                  fontWeight: 800,
                }}
              >
                読み上げ速度：{speechRate}倍
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={speechRate}
                  disabled={isListening}
                  onChange={(event) =>
                    setSpeechRate(
                      Number(event.target.value),
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "10px",
                  }}
                />
              </label>

              <div
                style={{
                  minHeight: "210px",
                  borderRadius: "22px",
                  background: "#ECFEFF",
                  padding: "28px",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  marginBottom: "22px",
                }}
              >
                {currentListeningItem ? (
                  <div>
                    <div
                      style={{
                        fontSize: "clamp(34px, 7vw, 50px)",
                        fontWeight: 900,
                        color: "#0891B2",
                      }}
                    >
                      {currentListeningItem.word}
                    </div>
                    <div
                      style={{
                        fontSize: "23px",
                        marginTop: "16px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {currentListeningItem.meaning}
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      color: "#64748B",
                      fontSize: "20px",
                    }}
                  >
                    登録済みの{items.length}語を読み上げます
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={startListening}
                  disabled={isListening}
                  style={{
                    ...buttonStyle,
                    background: isListening
                      ? "#94A3B8"
                      : "#16A34A",
                    color: "white",
                    minWidth: "210px",
                  }}
                >
                  ▶️ 開始
                </button>

                <button
                  type="button"
                  onClick={stopListening}
                  disabled={!isListening}
                  style={{
                    ...buttonStyle,
                    background: isListening
                      ? "#DC2626"
                      : "#94A3B8",
                    color: "white",
                    minWidth: "150px",
                  }}
                >
                  ⏹ 停止
                </button>
              </div>
            </section>
          )}

          {activeTab === "stats" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "29px",
                  marginTop: 0,
                }}
              >
                📊 学習記録
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(145px, 1fr))",
                  gap: "13px",
                }}
              >
                {[
                  {
                    label: "登録語彙",
                    value: `${items.length}語`,
                  },
                  {
                    label: "覚えた",
                    value: `${learnedItems.length}語`,
                  },
                  {
                    label: "苦手",
                    value: `${weakItems.length}語`,
                  },
                  {
                    label: "お気に入り",
                    value: `${favoriteItems.length}語`,
                  },
                  {
                    label: "クイズ回答",
                    value: `${stats.totalAnswers}問`,
                  },
                  {
                    label: "通算正答率",
                    value: `${correctRate}%`,
                  },
                  {
                    label: "流し聞き",
                    value: `${stats.listeningCount}回`,
                  },
                  {
                    label: "カード学習",
                    value: `${stats.cardCount}回`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: "21px 12px",
                      borderRadius: "17px",
                      background: "#ECFEFF",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748B",
                        fontSize: "15px",
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        color: "#0891B2",
                        fontWeight: 900,
                        fontSize: "27px",
                        marginTop: "7px",
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {totalAnswers > 0 && (
                <div
                  style={{
                    marginTop: "25px",
                    padding: "18px",
                    borderRadius: "16px",
                    background: "#F8FAFC",
                    textAlign: "center",
                  }}
                >
                  語彙別の正解数：{totalCorrect}回 /{" "}
                  {totalAnswers}回
                </div>
              )}

              <h3
                style={{
                  textAlign: "center",
                  marginTop: "30px",
                }}
              >
                カテゴリ別
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "10px",
                }}
              >
                {categories.map((categoryName) => (
                  <div
                    key={categoryName}
                    style={{
                      padding: "15px",
                      borderRadius: "14px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748B",
                        fontSize: "14px",
                      }}
                    >
                      {categoryName}
                    </div>
                    <strong
                      style={{
                        display: "block",
                        marginTop: "6px",
                        fontSize: "22px",
                      }}
                    >
                      {
                        items.filter(
                          (item) =>
                            item.category === categoryName,
                        ).length
                      }
                      語
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "settings" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "29px",
                  marginTop: 0,
                }}
              >
                ⚙️ データ管理
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  maxWidth: "520px",
                  margin: "0 auto",
                }}
              >
                <button
                  type="button"
                  onClick={exportData}
                  style={{
                    ...buttonStyle,
                    background: "#0891B2",
                    color: "white",
                  }}
                >
                  📤 JSONを書き出す
                </button>

                <button
                  type="button"
                  onClick={() =>
                    importInputRef.current?.click()
                  }
                  style={{
                    ...buttonStyle,
                    background: "#7C3AED",
                    color: "white",
                  }}
                >
                  📥 JSONを読み込む
                </button>

                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={importData}
                  style={{ display: "none" }}
                />

                <p
                  style={{
                    margin: 0,
                    color: "#64748B",
                    textAlign: "center",
                    lineHeight: 1.7,
                  }}
                >
                  データはこの端末のブラウザに保存されます。
                  <br />
                  機種変更やバックアップにはJSONを使ってください。
                </p>

                <hr
                  style={{
                    width: "100%",
                    border: "none",
                    borderTop: "1px solid #E2E8F0",
                    margin: "12px 0",
                  }}
                />

                <button
                  type="button"
                  onClick={resetAllData}
                  style={{
                    ...buttonStyle,
                    background: "#FEE2E2",
                    color: "#B91C1C",
                  }}
                >
                  ⚠️ 語彙と記録をすべて削除
                </button>
              </div>
            </section>
          )}
        </>
      )}

      <div
        style={{
          textAlign: "center",
          marginTop: "32px",
        }}
      >
        <Link
          href="/japanese"
          onClick={stopListening}
          style={{
            color: "#0891B2",
            fontWeight: 900,
            fontSize: "20px",
            textDecoration: "none",
          }}
        >
          ← 国語ページへ戻る
        </Link>
      </div>
    </main>
  );
}