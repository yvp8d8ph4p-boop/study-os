"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ReviewGrade = "again" | "hard" | "good" | "easy";
type ViewMode = "home" | "folder" | "quiz" | "listen" | "review";

type Folder = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  pinned: boolean;
  createdAt: number;
};

type Word = {
  id: string;
  word: string;
  meaning: string;
  example: string;
  partOfSpeech: string;
  tags: string[];
  folderIds: string[];
  favorite: boolean;
  createdAt: number;
  reviewStage: number;
  dueAt: number;
  lastReviewedAt: number | null;
  reviewCount: number;
  correctCount: number;
  mistakeCount: number;
  streak: number;
};

type StudySet = {
  id: string;
  name: string;
  icon: string;
  folderIds: string[];
  includeDue: boolean;
  includeWeak: boolean;
  includeFavorites: boolean;
};

const FOLDERS_KEY = "study-os-vocabulary-folders-ultimate";
const WORDS_KEY = "study-os-vocabulary-words-ultimate";
const SETS_KEY = "study-os-vocabulary-sets-ultimate";
const STATS_KEY = "study-os-vocabulary-stats-ultimate";

const folderColors = [
  "#2563eb",
  "#16a34a",
  "#7c3aed",
  "#ea580c",
  "#dc2626",
  "#0891b2",
  "#0f172a",
];

const folderIcons = ["📘", "📗", "📕", "📙", "🏫", "🔥", "⭐", "🎯", "📁"];
const reviewMinutes = [10, 1440, 4320, 10080, 20160, 43200, 86400, 172800];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatMinutes(seconds: number) {
  return `${Math.floor(seconds / 60)}分`;
}

const initialFolders: Folder[] = [
  {
    id: "eiken-2",
    name: "英検2級",
    description: "英検2級で覚えたい単語",
    icon: "📘",
    color: "#2563eb",
    pinned: true,
    createdAt: 1,
  },
  {
    id: "school",
    name: "学校",
    description: "授業や定期テストの単語",
    icon: "🏫",
    color: "#16a34a",
    pinned: false,
    createdAt: 2,
  },
];

const initialWords: Word[] = [
  {
    id: "sample-receive",
    word: "receive",
    meaning: "受け取る",
    example: "I received a letter yesterday.",
    partOfSpeech: "動詞",
    tags: ["英検2級"],
    folderIds: ["eiken-2"],
    favorite: false,
    createdAt: 1,
    reviewStage: 0,
    dueAt: Date.now(),
    lastReviewedAt: null,
    reviewCount: 0,
    correctCount: 0,
    mistakeCount: 0,
    streak: 0,
  },
  {
    id: "sample-despite",
    word: "despite",
    meaning: "〜にもかかわらず",
    example: "Despite the rain, we went outside.",
    partOfSpeech: "前置詞",
    tags: ["重要"],
    folderIds: ["eiken-2", "school"],
    favorite: true,
    createdAt: 2,
    reviewStage: 0,
    dueAt: Date.now(),
    lastReviewedAt: null,
    reviewCount: 0,
    correctCount: 0,
    mistakeCount: 0,
    streak: 0,
  },
];

export default function VocabularyPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [sets, setSets] = useState<StudySet[]>([]);
  const [stats, setStats] = useState({ totalSeconds: 0, quiz: 0, correct: 0, listen: 0 });
  const [loaded, setLoaded] = useState(false);

  const [view, setView] = useState<ViewMode>("home");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [listenInterval, setListenInterval] = useState(3);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedFolders = readStorage<Folder[]>(FOLDERS_KEY, initialFolders);
    const savedWords = readStorage<Word[]>(WORDS_KEY, initialWords);
    setFolders(savedFolders.length ? savedFolders : initialFolders);
    setWords(savedWords.length ? savedWords : initialWords);
    setSets(readStorage<StudySet[]>(SETS_KEY, []));
    setStats(readStorage(STATS_KEY, { totalSeconds: 0, quiz: 0, correct: 0, listen: 0 }));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    writeStorage(FOLDERS_KEY, folders);
    writeStorage(WORDS_KEY, words);
    writeStorage(SETS_KEY, sets);
    writeStorage(STATS_KEY, stats);
  }, [folders, words, sets, stats, loaded]);

  useEffect(() => {
    if (view !== "listen" || !playing || studyWords.length === 0) return;

    const current = studyWords[studyIndex];
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.lang = "en-US";
    utterance.rate = speechRate;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    setStats((currentStats) => ({ ...currentStats, listen: currentStats.listen + 1 }));

    const timer = window.setTimeout(() => {
      setStudyIndex((index) => (index + 1) % studyWords.length);
    }, listenInterval * 1000);

    return () => window.clearTimeout(timer);
  }, [view, playing, studyIndex, studyWords, listenInterval, speechRate]);

  const dueWords = useMemo(
    () => words.filter((word) => word.dueAt <= Date.now()).sort((a, b) => a.dueAt - b.dueAt),
    [words],
  );

  const weakWords = useMemo(
    () =>
      words
        .filter((word) => word.mistakeCount > word.correctCount || (word.reviewCount >= 2 && word.streak === 0))
        .sort((a, b) => b.mistakeCount - a.mistakeCount),
    [words],
  );

  const favoriteWords = useMemo(() => words.filter((word) => word.favorite), [words]);

  const orderedFolders = useMemo(
    () => [...folders].sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.createdAt - b.createdAt),
    [folders],
  );

  const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? null;

  const folderWords = useMemo(() => {
    if (!activeFolderId) return words;
    return words.filter((word) => word.folderIds.includes(activeFolderId));
  }, [activeFolderId, words]);

  const visibleFolderWords = useMemo(
    () =>
      folderWords.filter(
        (word) =>
          word.word.toLowerCase().includes(search.toLowerCase()) ||
          word.meaning.includes(search) ||
          word.tags.some((tag) => tag.includes(search)),
      ),
    [folderWords, search],
  );

  const currentStudyWord = studyWords[studyIndex];
  const quizFinished = view === "quiz" && studyWords.length > 0 && studyIndex >= studyWords.length;

  useEffect(() => {
    if (view !== "quiz" || !currentStudyWord) return;
    const wrong = shuffle(words.filter((word) => word.id !== currentStudyWord.id).map((word) => word.meaning)).slice(0, 3);
    setOptions(shuffle([currentStudyWord.meaning, ...wrong]));
    setSelectedAnswer(null);
  }, [view, currentStudyWord, words]);

  function saveFolder(folder: Folder) {
    setFolders((current) => [...current, folder]);
  }

  function saveWord(word: Word) {
    setWords((current) => [...current, word]);
  }

  function updateWord(id: string, patch: Partial<Word>) {
    setWords((current) => current.map((word) => (word.id === id ? { ...word, ...patch } : word)));
  }

  function deleteFolder(id: string) {
    setFolders((current) => current.filter((folder) => folder.id !== id));
    setWords((current) =>
      current.map((word) => ({ ...word, folderIds: word.folderIds.filter((folderId) => folderId !== id) })),
    );
  }

  function toggleFolderSelection(id: string) {
    setSelectedFolderIds((current) =>
      current.includes(id) ? current.filter((folderId) => folderId !== id) : [...current, id],
    );
  }

  function getWordsFromSelection() {
    if (selectedFolderIds.length === 0) return [];
    const ids = new Set(selectedFolderIds);
    return words.filter((word) => word.folderIds.some((folderId) => ids.has(folderId)));
  }

  function openFolder(folderId: string) {
    setActiveFolderId(folderId);
    setSearch("");
    setView("folder");
  }

  function startQuiz(source: Word[]) {
    if (source.length < 2) {
      window.alert("クイズには2語以上必要です。");
      return;
    }
    setStudyWords(shuffle(source));
    setStudyIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setView("quiz");
  }

  function startListen(source: Word[]) {
    if (source.length === 0) {
      window.alert("単語がありません。");
      return;
    }
    setStudyWords(source);
    setStudyIndex(0);
    setPlaying(false);
    setView("listen");
  }

  function startReview() {
    setStudyWords(dueWords);
    setStudyIndex(0);
    setShowAnswer(false);
    setView("review");
  }

  function chooseQuiz(answer: string) {
    if (!currentStudyWord || selectedAnswer) return;
    const correct = answer === currentStudyWord.meaning;
    setSelectedAnswer(answer);
    if (correct) setScore((value) => value + 1);
    setStats((current) => ({
      ...current,
      quiz: current.quiz + 1,
      correct: current.correct + (correct ? 1 : 0),
    }));
    gradeWord(currentStudyWord.id, correct ? "good" : "again");
  }

  function gradeWord(id: string, grade: ReviewGrade) {
    setWords((current) =>
      current.map((word) => {
        if (word.id !== id) return word;

        let nextStage = word.reviewStage;
        let minutes = reviewMinutes[Math.min(nextStage, reviewMinutes.length - 1)];
        const correct = grade === "good" || grade === "easy";

        if (grade === "again") {
          nextStage = 0;
          minutes = 10;
        } else if (grade === "hard") {
          minutes = Math.max(30, Math.round(minutes * 0.5));
        } else if (grade === "good") {
          nextStage = Math.min(word.reviewStage + 1, reviewMinutes.length - 1);
          minutes = reviewMinutes[nextStage];
        } else {
          nextStage = Math.min(word.reviewStage + 2, reviewMinutes.length - 1);
          minutes = Math.round(reviewMinutes[nextStage] * 1.25);
        }

        return {
          ...word,
          reviewStage: nextStage,
          dueAt: Date.now() + minutes * 60_000,
          lastReviewedAt: Date.now(),
          reviewCount: word.reviewCount + 1,
          correctCount: word.correctCount + (correct ? 1 : 0),
          mistakeCount: word.mistakeCount + (correct ? 0 : 1),
          streak: correct ? word.streak + 1 : 0,
        };
      }),
    );
  }

  function gradeReview(grade: ReviewGrade) {
    if (!currentStudyWord) return;
    gradeWord(currentStudyWord.id, grade);
    setStudyIndex((value) => value + 1);
    setShowAnswer(false);
  }

  function openSet(set: StudySet) {
    const unique = new Map<string, Word>();
    const ids = new Set(set.folderIds);
    words.filter((word) => word.folderIds.some((folderId) => ids.has(folderId))).forEach((word) => unique.set(word.id, word));
    if (set.includeDue) dueWords.forEach((word) => unique.set(word.id, word));
    if (set.includeWeak) weakWords.forEach((word) => unique.set(word.id, word));
    if (set.includeFavorites) favoriteWords.forEach((word) => unique.set(word.id, word));
    startQuiz([...unique.values()]);
  }

  if (view === "folder") {
    return (
      <PageShell>
        <button onClick={() => setView("home")} className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">
          ← 単語帳
        </button>

        <section className="mt-4 rounded-[32px] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl text-3xl" style={{ backgroundColor: `${activeFolder?.color ?? "#0ea5e9"}25` }}>
              {activeFolder?.icon ?? "📖"}
            </div>
            <div>
              <p className="text-xs font-black tracking-[0.15em] text-sky-300">FOLDER</p>
              <h1 className="mt-1 text-2xl font-black">{activeFolder?.name ?? "すべての単語"}</h1>
              <p className="mt-1 text-sm text-slate-400">{folderWords.length}語</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-300">{activeFolder?.description || "このフォルダの単語を学習します。"}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button onClick={() => startQuiz(folderWords)} className="rounded-2xl bg-violet-600 px-3 py-4 text-sm font-black">📝 クイズ</button>
            <button onClick={() => startListen(folderWords)} className="rounded-2xl bg-sky-500 px-3 py-4 text-sm font-black">🎧 流し聞き</button>
            <button onClick={startReview} className="rounded-2xl bg-emerald-500 px-3 py-4 text-sm font-black">🔁 復習</button>
          </div>
        </section>

        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="単語・意味・タグを検索" className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-400" />

        <div className="mt-4 space-y-3">
          {visibleFolderWords.map((word) => (
            <article key={word.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{word.word}</h2>
                  <p className="mt-1 font-black text-sky-700">{word.meaning}</p>
                  {word.example && <p className="mt-3 text-sm leading-6 text-slate-500">{word.example}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {word.partOfSpeech && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{word.partOfSpeech}</span>}
                    {word.tags.map((tag) => <span key={tag} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">#{tag}</span>)}
                  </div>
                </div>
                <button onClick={() => updateWord(word.id, { favorite: !word.favorite })} className="text-2xl">{word.favorite ? "⭐" : "☆"}</button>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-500">復習 {word.reviewCount}回・正解 {word.correctCount}・ミス {word.mistakeCount}</p>
                  <p className="mt-1 text-[11px] text-slate-400">次回：{new Date(word.dueAt).toLocaleString("ja-JP")}</p>
                </div>
                <button onClick={() => setWords((current) => current.filter((item) => item.id !== word.id))} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600">削除</button>
              </div>
            </article>
          ))}
        </div>
      </PageShell>
    );
  }

  if (view === "quiz") {
    if (quizFinished) {
      const rate = Math.round((score / studyWords.length) * 100);
      return (
        <CenteredPage>
          <p className="text-6xl">{rate >= 80 ? "🏆" : "🔥"}</p>
          <h1 className="mt-4 text-2xl font-black">クイズ完了！</h1>
          <p className="mt-3 text-4xl font-black text-violet-600">{score} / {studyWords.length}</p>
          <p className="mt-2 text-sm text-slate-500">正答率 {rate}%</p>
          <button onClick={() => setView("home")} className="mt-6 w-full rounded-2xl bg-violet-600 py-4 font-black text-white">単語帳へ戻る</button>
        </CenteredPage>
      );
    }

    return (
      <PageShell narrow>
        <button onClick={() => setView("home")} className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">← 終了</button>
        <section className="mt-6 rounded-[34px] bg-white p-7 shadow-xl">
          <p className="text-xs font-black tracking-[0.18em] text-violet-500">MIX QUIZ</p>
          <p className="mt-2 text-right text-sm font-black text-violet-700">{studyIndex + 1} / {studyWords.length}</p>
          <h1 className="mt-8 text-center text-4xl font-black">{currentStudyWord?.word}</h1>
          <p className="mt-3 text-center text-sm text-slate-400">意味を選ぼう</p>
          <div className="mt-8 space-y-3">
            {options.map((option) => {
              const correct = option === currentStudyWord?.meaning;
              const chosen = option === selectedAnswer;
              return (
                <button key={option} onClick={() => chooseQuiz(option)} className={`w-full rounded-2xl border-2 px-4 py-4 text-left font-black ${selectedAnswer && correct ? "border-emerald-500 bg-emerald-50 text-emerald-700" : selectedAnswer && chosen ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200"}`}>
                  {option}
                </button>
              );
            })}
          </div>
          {selectedAnswer && <button onClick={() => setStudyIndex((value) => value + 1)} className="mt-6 w-full rounded-2xl bg-violet-600 py-4 font-black text-white">次へ →</button>}
        </section>
      </PageShell>
    );
  }

  if (view === "listen") {
    return (
      <PageShell narrow>
        <button onClick={() => { setPlaying(false); speechSynthesis.cancel(); setView("home"); }} className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">← 終了</button>
        <section className="mt-6 rounded-[34px] bg-slate-950 p-8 text-center text-white shadow-xl">
          <p className="text-xs font-black tracking-[0.18em] text-sky-300">LISTENING MODE</p>
          <p className="mt-2 text-sm font-black text-sky-300">{studyIndex + 1} / {studyWords.length}</p>
          <div className="my-12">
            <h1 className="text-4xl font-black">{currentStudyWord?.word}</h1>
            <p className="mt-5 text-xl font-black text-sky-300">{currentStudyWord?.meaning}</p>
            {currentStudyWord?.example && <p className="mt-5 text-sm leading-7 text-slate-400">{currentStudyWord.example}</p>}
          </div>
          <button onClick={() => setPlaying((value) => !value)} className="w-full rounded-2xl bg-sky-500 py-4 text-lg font-black">{playing ? "⏸ 一時停止" : "▶ 再生開始"}</button>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={() => setStudyIndex((value) => (value - 1 + studyWords.length) % studyWords.length)} className="rounded-2xl bg-white/10 py-3 font-black">← 前へ</button>
            <button onClick={() => setStudyIndex((value) => (value + 1) % studyWords.length)} className="rounded-2xl bg-white/10 py-3 font-black">次へ →</button>
          </div>
        </section>
        <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block font-black">切り替え間隔：{listenInterval}秒<input type="range" min="2" max="8" value={listenInterval} onChange={(event) => setListenInterval(Number(event.target.value))} className="mt-3 w-full" /></label>
          <label className="mt-5 block font-black">読み上げ速度：{speechRate.toFixed(1)}倍<input type="range" min="0.6" max="1.4" step="0.1" value={speechRate} onChange={(event) => setSpeechRate(Number(event.target.value))} className="mt-3 w-full" /></label>
        </section>
      </PageShell>
    );
  }

  if (view === "review") {
    if (studyWords.length === 0 || studyIndex >= studyWords.length) {
      return (
        <CenteredPage>
          <p className="text-6xl">✨</p>
          <h1 className="mt-4 text-2xl font-black">今日の復習完了！</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">次の復習日は自動で設定されました。</p>
          <button onClick={() => setView("home")} className="mt-6 w-full rounded-2xl bg-sky-500 py-4 font-black text-white">単語帳へ戻る</button>
        </CenteredPage>
      );
    }

    return (
      <PageShell narrow>
        <button onClick={() => setView("home")} className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">← 終了</button>
        <section className="mt-6 rounded-[34px] bg-slate-950 p-7 text-center text-white shadow-xl">
          <p className="text-xs font-black tracking-[0.18em] text-sky-300">SPACED REVIEW</p>
          <p className="mt-2 text-sm font-black text-sky-300">{studyIndex + 1} / {studyWords.length}</p>
          <div className="flex min-h-72 flex-col items-center justify-center">
            <h1 className="text-4xl font-black">{currentStudyWord?.word}</h1>
            {showAnswer ? (
              <>
                <p className="mt-6 text-2xl font-black text-sky-300">{currentStudyWord?.meaning}</p>
                {currentStudyWord?.example && <p className="mt-5 text-sm leading-7 text-slate-400">{currentStudyWord.example}</p>}
              </>
            ) : (
              <button onClick={() => setShowAnswer(true)} className="mt-8 rounded-full bg-white px-6 py-3 font-black text-slate-950">意味を見る</button>
            )}
          </div>
          {showAnswer && (
            <div className="grid grid-cols-2 gap-3">
              <GradeButton label="もう一度" hint="10分後" className="bg-rose-500" onClick={() => gradeReview("again")} />
              <GradeButton label="難しい" hint="短め" className="bg-amber-500" onClick={() => gradeReview("hard")} />
              <GradeButton label="覚えた" hint="通常" className="bg-sky-500" onClick={() => gradeReview("good")} />
              <GradeButton label="余裕" hint="長め" className="bg-emerald-500" onClick={() => gradeReview("easy")} />
            </div>
          )}
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-16 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative">
          <Link href="/english" className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black">← 英語ホーム</Link>
          <p className="mt-6 text-sm font-black tracking-[0.18em] text-sky-300">VOCABULARY OS</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">📚 英単語帳</h1>
          <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-300">自分でフォルダを作り、忘却曲線の復習・まとめクイズ・流し聞きを管理。</p>
          <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
            <HeroStat label="単語" value={`${words.length}語`} />
            <HeroStat label="今日の復習" value={`${dueWords.length}語`} />
            <HeroStat label="苦手" value={`${weakWords.length}語`} />
            <HeroStat label="学習時間" value={formatMinutes(stats.totalSeconds)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-black tracking-[0.15em] text-sky-500">TODAY&apos;S MISSION</p><h2 className="mt-1 text-2xl font-black">今日やること</h2></div>
          <button onClick={startReview} className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-200">▶ 復習を始める</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MissionCard icon="🔁" title="期限が来た復習" value={`${dueWords.length}語`} onClick={startReview} />
          <MissionCard icon="❌" title="苦手な単語" value={`${weakWords.length}語`} onClick={() => startQuiz(weakWords)} />
          <MissionCard icon="⭐" title="お気に入り" value={`${favoriteWords.length}語`} onClick={() => startQuiz(favoriteWords)} />
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="自分のフォルダ" description="何個でも作成でき、色・アイコン・説明も自由。" action={<button onClick={() => setShowFolderModal(true)} className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-black text-white">＋ フォルダ作成</button>} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {orderedFolders.map((folder) => {
            const count = words.filter((word) => word.folderIds.includes(folder.id)).length;
            return (
              <article key={folder.id} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-5">
                <button onClick={() => openFolder(folder.id)} className="w-full text-left">
                  <div className="flex items-start justify-between"><div className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ backgroundColor: `${folder.color}18` }}>{folder.icon}</div>{folder.pinned && <span>📌</span>}</div>
                  <h3 className="mt-4 truncate text-lg font-black">{folder.name}</h3>
                  <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{folder.description || "説明なし"}</p>
                  <p className="mt-4 text-sm font-black" style={{ color: folder.color }}>{count}語 →</p>
                </button>
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => setFolders((current) => current.map((item) => item.id === folder.id ? { ...item, pinned: !item.pinned } : item))} className="flex-1 rounded-xl bg-slate-100 px-2 py-2 text-[11px] font-black">{folder.pinned ? "解除" : "ピン"}</button>
                  <button onClick={() => { const name = window.prompt("新しいフォルダ名", folder.name); if (name?.trim()) setFolders((current) => current.map((item) => item.id === folder.id ? { ...item, name: name.trim() } : item)); }} className="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black">編集</button>
                  <button onClick={() => { if (window.confirm(`「${folder.name}」を削除しますか？`)) deleteFolder(folder.id); }} className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-600">削除</button>
                </div>
              </article>
            );
          })}
          <button onClick={() => setShowFolderModal(true)} className="min-h-56 rounded-[26px] border-2 border-dashed border-sky-200 bg-sky-50/60 p-5 text-center"><span className="text-4xl">＋</span><p className="mt-3 font-black text-sky-700">新しいフォルダ</p></button>
        </div>
      </section>

      <section className="mt-8 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader title="まとめて問題を出す" description="複数フォルダを選び、単語を混ぜて出題。" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {orderedFolders.map((folder) => {
            const checked = selectedFolderIds.includes(folder.id);
            return <button key={folder.id} onClick={() => toggleFolderSelection(folder.id)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${checked ? "border-sky-400 bg-sky-50 ring-2 ring-sky-100" : "border-slate-200"}`}><span className="text-2xl">{folder.icon}</span><span className="min-w-0 flex-1 truncate text-sm font-black">{folder.name}</span><span>{checked ? "✓" : ""}</span></button>;
          })}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={() => startQuiz(getWordsFromSelection())} className="rounded-2xl bg-violet-600 py-4 font-black text-white">📝 選んだフォルダでクイズ</button>
          <button onClick={() => startListen(getWordsFromSelection())} className="rounded-2xl bg-sky-500 py-4 font-black text-white">🎧 選んだフォルダを流し聞き</button>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="保存した学習セット" description="よく使う組み合わせをワンタップで開始。" action={<button onClick={() => setShowSetModal(true)} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">＋ セット作成</button>} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <article key={set.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3"><span className="text-3xl">{set.icon}</span><div><h3 className="font-black">{set.name}</h3><p className="mt-1 text-xs text-slate-500">{set.folderIds.length}フォルダ</p></div></div>
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><button onClick={() => openSet(set)} className="rounded-xl bg-violet-600 py-3 text-sm font-black text-white">クイズ開始</button><button onClick={() => setSets((current) => current.filter((item) => item.id !== set.id))} className="rounded-xl bg-rose-50 px-4 text-sm font-black text-rose-600">削除</button></div>
            </article>
          ))}
          {sets.length === 0 && <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-7 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3">まだ学習セットがありません。</div>}
        </div>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <button onClick={() => setShowWordModal(true)} className="rounded-[26px] bg-white p-5 text-left shadow-sm ring-1 ring-slate-200"><span className="text-3xl">➕</span><h3 className="mt-3 text-lg font-black">単語を追加</h3><p className="mt-1 text-sm text-slate-500">複数フォルダ・品詞・タグに対応</p></button>
        <button onClick={() => { setActiveFolderId(null); setView("folder"); }} className="rounded-[26px] bg-white p-5 text-left shadow-sm ring-1 ring-slate-200"><span className="text-3xl">📖</span><h3 className="mt-3 text-lg font-black">すべての単語</h3><p className="mt-1 text-sm text-slate-500">登録した単語をまとめて確認</p></button>
      </section>

      {showFolderModal && <FolderModal onClose={() => setShowFolderModal(false)} onSave={(folder) => { saveFolder(folder); setShowFolderModal(false); }} />}
      {showWordModal && <WordModal folders={folders} onClose={() => setShowWordModal(false)} onSave={(word) => { saveWord(word); setShowWordModal(false); }} />}
      {showSetModal && <SetModal folders={folders} onClose={() => setShowSetModal(false)} onSave={(set) => { setSets((current) => [...current, set]); setShowSetModal(false); }} />}
    </PageShell>
  );
}

function PageShell({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <main className="min-h-screen bg-[linear-gradient(180deg,#eaf8ff_0%,#f7fbff_42%,#ffffff_100%)] px-4 pb-36 pt-6 text-slate-900"><div className={`mx-auto w-full ${narrow ? "max-w-lg" : "max-w-6xl"}`}>{children}</div></main>;
}

function CenteredPage({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-gradient-to-b from-sky-100 to-white px-4"><div className="w-full max-w-sm rounded-[32px] bg-white p-7 text-center shadow-xl">{children}</div></main>;
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-2 py-4 text-center"><p className="text-[10px] font-bold text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-black text-white">{value}</p></div>;
}

function SectionHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[0.15em] text-sky-500">VOCABULARY</p><h2 className="mt-1 text-2xl font-black">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p></div>{action}</div>;
}

function MissionCard({ icon, title, value, onClick }: { icon: string; title: string; value: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4 text-left transition hover:bg-sky-50"><span className="text-3xl">{icon}</span><div><p className="text-xs font-bold text-slate-500">{title}</p><p className="mt-1 text-xl font-black">{value}</p></div></button>;
}

function GradeButton({ label, hint, className, onClick }: { label: string; hint: string; className: string; onClick: () => void }) {
  return <button onClick={onClick} className={`rounded-2xl px-3 py-4 text-white ${className}`}><p className="font-black">{label}</p><p className="mt-1 text-[10px] font-bold opacity-80">{hint}</p></button>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-[80] flex items-end bg-slate-950/45 p-3 sm:items-center sm:justify-center"><div className="max-h-[92vh] w-full overflow-y-auto rounded-[30px] bg-white p-5 sm:max-w-lg"><div className="flex items-center justify-between"><h2 className="text-xl font-black">{title}</h2><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">✕</button></div><div className="mt-5">{children}</div></div></div>;
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="mt-4 block"><span className="text-sm font-black">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" /></label>;
}

function FolderModal({ onClose, onSave }: { onClose: () => void; onSave: (folder: Folder) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📘");
  const [color, setColor] = useState("#2563eb");
  return <Modal title="新しいフォルダ" onClose={onClose}><InputField label="名前" value={name} onChange={setName} placeholder="英検2級" /><InputField label="説明" value={description} onChange={setDescription} placeholder="英検2級対策" /><p className="mt-5 text-sm font-black">アイコン</p><div className="mt-2 flex flex-wrap gap-2">{folderIcons.map((item) => <button key={item} onClick={() => setIcon(item)} className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${icon === item ? "bg-sky-100 ring-2 ring-sky-500" : "bg-slate-100"}`}>{item}</button>)}</div><p className="mt-5 text-sm font-black">色</p><div className="mt-3 flex flex-wrap gap-3">{folderColors.map((item) => <button key={item} onClick={() => setColor(item)} className="h-9 w-9 rounded-full" style={{ backgroundColor: item, outline: color === item ? `3px solid ${item}55` : "none", outlineOffset: "3px" }} />)}</div><button onClick={() => { if (!name.trim()) return; onSave({ id: createId("folder"), name: name.trim(), description: description.trim(), icon, color, pinned: false, createdAt: Date.now() }); }} className="mt-7 w-full rounded-2xl bg-sky-500 py-4 font-black text-white">作成</button></Modal>;
}

function WordModal({ folders, onClose, onSave }: { folders: Folder[]; onClose: () => void; onSave: (word: Word) => void }) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [tags, setTags] = useState("");
  const [folderIds, setFolderIds] = useState<string[]>([]);
  return <Modal title="単語を追加" onClose={onClose}><InputField label="英単語" value={word} onChange={setWord} placeholder="receive" /><InputField label="意味" value={meaning} onChange={setMeaning} placeholder="受け取る" /><InputField label="例文" value={example} onChange={setExample} placeholder="I received a letter." /><InputField label="品詞" value={partOfSpeech} onChange={setPartOfSpeech} placeholder="動詞" /><InputField label="タグ（カンマ区切り）" value={tags} onChange={setTags} placeholder="英検2級, 重要" /><p className="mt-5 text-sm font-black">保存先（複数選択可）</p><div className="mt-2 space-y-2">{folders.map((folder) => { const checked = folderIds.includes(folder.id); return <button key={folder.id} onClick={() => setFolderIds((current) => checked ? current.filter((id) => id !== folder.id) : [...current, folder.id])} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left ${checked ? "bg-sky-100 ring-2 ring-sky-400" : "bg-slate-100"}`}><span className="font-bold">{folder.icon} {folder.name}</span><span>{checked ? "✓" : ""}</span></button>; })}</div><button onClick={() => { if (!word.trim() || !meaning.trim()) return; onSave({ id: createId("word"), word: word.trim(), meaning: meaning.trim(), example: example.trim(), partOfSpeech: partOfSpeech.trim(), tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), folderIds, favorite: false, createdAt: Date.now(), reviewStage: 0, dueAt: Date.now(), lastReviewedAt: null, reviewCount: 0, correctCount: 0, mistakeCount: 0, streak: 0 }); }} className="mt-7 w-full rounded-2xl bg-sky-500 py-4 font-black text-white">保存</button></Modal>;
}

function SetModal({ folders, onClose, onSave }: { folders: Folder[]; onClose: () => void; onSave: (set: StudySet) => void }) {
  const [name, setName] = useState("");
  const [folderIds, setFolderIds] = useState<string[]>([]);
  const [includeDue, setIncludeDue] = useState(true);
  const [includeWeak, setIncludeWeak] = useState(false);
  const [includeFavorites, setIncludeFavorites] = useState(false);
  return <Modal title="学習セットを作成" onClose={onClose}><InputField label="セット名" value={name} onChange={setName} placeholder="高校受験セット" /><p className="mt-5 text-sm font-black">フォルダ</p><div className="mt-2 space-y-2">{folders.map((folder) => { const checked = folderIds.includes(folder.id); return <button key={folder.id} onClick={() => setFolderIds((current) => checked ? current.filter((id) => id !== folder.id) : [...current, folder.id])} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 ${checked ? "bg-violet-100 ring-2 ring-violet-400" : "bg-slate-100"}`}><span className="font-bold">{folder.icon} {folder.name}</span><span>{checked ? "✓" : ""}</span></button>; })}</div><Check label="今日の復習を含める" checked={includeDue} onChange={setIncludeDue} /><Check label="苦手単語を含める" checked={includeWeak} onChange={setIncludeWeak} /><Check label="お気に入りを含める" checked={includeFavorites} onChange={setIncludeFavorites} /><button onClick={() => { if (!name.trim()) return; onSave({ id: createId("set"), name: name.trim(), icon: "🎯", folderIds, includeDue, includeWeak, includeFavorites }); }} className="mt-7 w-full rounded-2xl bg-slate-950 py-4 font-black text-white">保存</button></Modal>;
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="mt-3 flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3"><span className="text-sm font-bold">{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5" /></label>;
}