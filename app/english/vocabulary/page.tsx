"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Word = {
  id: number;
  english: string;
  japanese: string;
  correct: number;
  wrong: number;
};

type StudyStats = {
  totalAnswers: number;
  correctAnswers: number;
  listeningCount: number;
};

type Tab = "words" | "listening" | "quiz" | "stats";

const WORDS_STORAGE_KEY = "study-os-words";
const STATS_STORAGE_KEY = "study-os-word-stats";

const emptyStats: StudyStats = {
  totalAnswers: 0,
  correctAnswers: 0,
  listeningCount: 0,
};

function shuffleWords(words: Word[]) {
  const copiedWords = [...words];

  for (let i = copiedWords.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [copiedWords[i], copiedWords[randomIndex]] = [
      copiedWords[randomIndex],
      copiedWords[i],
    ];
  }

  return copiedWords;
}

function normalizeAnswer(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[。．、,.・！!？?]/g, "");
}

function isCorrectAnswer(input: string, answer: string) {
  const normalizedInput = normalizeAnswer(input);

  if (normalizedInput === "") {
    return false;
  }

  const possibleAnswers = answer
    .split(/[、,，/／;；|・]/)
    .map((item) => normalizeAnswer(item))
    .filter((item) => item !== "");

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

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("words");

  const [english, setEnglish] = useState("");
  const [japanese, setJapanese] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [words, setWords] = useState<Word[]>([]);
  const [stats, setStats] = useState<StudyStats>(emptyStats);
  const [isLoaded, setIsLoaded] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [showWeakOnly, setShowWeakOnly] = useState(false);

  const [speechRate, setSpeechRate] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [currentListeningWord, setCurrentListeningWord] =
    useState<Word | null>(null);

  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizInput, setQuizInput] = useState("");
  const [quizFeedback, setQuizFeedback] = useState("");
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizWrong, setQuizWrong] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [weakQuizOnly, setWeakQuizOnly] = useState(false);

  const listeningRef = useRef(false);

  useEffect(() => {
    const savedWords = localStorage.getItem(WORDS_STORAGE_KEY);
    const savedStats = localStorage.getItem(STATS_STORAGE_KEY);

    if (savedWords) {
      try {
        const parsedWords = JSON.parse(savedWords) as Partial<Word>[];

        const repairedWords: Word[] = parsedWords
          .filter(
            (word) =>
              typeof word.id === "number" &&
              typeof word.english === "string" &&
              typeof word.japanese === "string",
          )
          .map((word) => ({
            id: word.id as number,
            english: word.english as string,
            japanese: word.japanese as string,
            correct:
              typeof word.correct === "number" ? word.correct : 0,
            wrong: typeof word.wrong === "number" ? word.wrong : 0,
          }));

        setWords(repairedWords);
      } catch {
        console.error("単語データを読み込めませんでした。");
      }
    }

    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats) as Partial<StudyStats>;

        setStats({
          totalAnswers:
            typeof parsedStats.totalAnswers === "number"
              ? parsedStats.totalAnswers
              : 0,
          correctAnswers:
            typeof parsedStats.correctAnswers === "number"
              ? parsedStats.correctAnswers
              : 0,
          listeningCount:
            typeof parsedStats.listeningCount === "number"
              ? parsedStats.listeningCount
              : 0,
        });
      } catch {
        console.error("学習記録を読み込めませんでした。");
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(
      WORDS_STORAGE_KEY,
      JSON.stringify(words),
    );
  }, [words, isLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

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

  const weakWords = useMemo(() => {
    return words.filter(
      (word) => word.wrong > 0 && word.wrong >= word.correct,
    );
  }, [words]);

  const displayedWords = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return words.filter((word) => {
      const matchesSearch =
        normalizedSearch === "" ||
        word.english.toLowerCase().includes(normalizedSearch) ||
        word.japanese.includes(searchText.trim());

      const matchesWeak =
        !showWeakOnly ||
        (word.wrong > 0 && word.wrong >= word.correct);

      return matchesSearch && matchesWeak;
    });
  }, [words, searchText, showWeakOnly]);

  const totalWordAnswers = words.reduce(
    (total, word) => total + word.correct + word.wrong,
    0,
  );

  const wordCorrectAnswers = words.reduce(
    (total, word) => total + word.correct,
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

  function resetForm() {
    setEnglish("");
    setJapanese("");
    setEditingId(null);
  }

  function saveWord() {
    const trimmedEnglish = english.trim();
    const trimmedJapanese = japanese.trim();

    if (trimmedEnglish === "" || trimmedJapanese === "") {
      alert("英単語と日本語の意味を両方入力してね！");
      return;
    }

    if (editingId !== null) {
      setWords((currentWords) =>
        currentWords.map((word) =>
          word.id === editingId
            ? {
                ...word,
                english: trimmedEnglish,
                japanese: trimmedJapanese,
              }
            : word,
        ),
      );

      resetForm();
      return;
    }

    const duplicatedWord = words.some(
      (word) =>
        word.english.toLowerCase() ===
        trimmedEnglish.toLowerCase(),
    );

    if (duplicatedWord) {
      const shouldAdd = window.confirm(
        "同じ英単語がすでにあります。それでも登録しますか？",
      );

      if (!shouldAdd) {
        return;
      }
    }

    const newWord: Word = {
      id: Date.now(),
      english: trimmedEnglish,
      japanese: trimmedJapanese,
      correct: 0,
      wrong: 0,
    };

    setWords((currentWords) => [...currentWords, newWord]);
    resetForm();
  }

  function startEditing(word: Word) {
    setEnglish(word.english);
    setJapanese(word.japanese);
    setEditingId(word.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteWord(id: number) {
    const targetWord = words.find((word) => word.id === id);

    const shouldDelete = window.confirm(
      `「${targetWord?.english ?? "この単語"}」を削除しますか？`,
    );

    if (!shouldDelete) {
      return;
    }

    setWords((currentWords) =>
      currentWords.filter((word) => word.id !== id),
    );

    if (editingId === id) {
      resetForm();
    }
  }

  function handleEnter(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      saveWord();
    }
  }

  function speakText(
    text: string,
    language: "en-US" | "ja-JP",
  ) {
    return new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = language;
      utterance.rate = speechRate;
      utterance.pitch = 1;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  async function startListening() {
    if (words.length === 0) {
      alert("先に単語を登録してね！");
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("このブラウザは音声読み上げに対応していません。");
      return;
    }

    window.speechSynthesis.cancel();

    listeningRef.current = true;
    setIsListening(true);

    setStats((currentStats) => ({
      ...currentStats,
      listeningCount: currentStats.listeningCount + 1,
    }));

    for (const word of words) {
      if (!listeningRef.current) {
        break;
      }

      setCurrentListeningWord(word);

      await speakText(word.english, "en-US");

      if (!listeningRef.current) {
        break;
      }

      await wait(500);
      await speakText(word.japanese, "ja-JP");

      if (!listeningRef.current) {
        break;
      }

      await wait(900);
    }

    listeningRef.current = false;
    setIsListening(false);
    setCurrentListeningWord(null);
  }

  function stopListening() {
    listeningRef.current = false;
    setIsListening(false);
    setCurrentListeningWord(null);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function startQuiz() {
    const availableWords = weakQuizOnly ? weakWords : words;

    if (availableWords.length === 0) {
      alert(
        weakQuizOnly
          ? "苦手単語がまだありません。"
          : "先に単語を登録してね！",
      );
      return;
    }

    const shuffled = shuffleWords(availableWords);

    setQuizWords(shuffled);
    setQuizIndex(0);
    setQuizInput("");
    setQuizFeedback("");
    setQuizCorrect(0);
    setQuizWrong(0);
    setQuizFinished(false);
  }

  function submitQuizAnswer() {
    if (quizFinished || quizWords.length === 0) {
      return;
    }

    if (quizFeedback !== "") {
      return;
    }

    const currentWord = quizWords[quizIndex];

    if (quizInput.trim() === "") {
      alert("意味を入力してね！");
      return;
    }

    const correct = isCorrectAnswer(
      quizInput,
      currentWord.japanese,
    );

    if (correct) {
      setQuizFeedback("⭕ 正解！");
      setQuizCorrect((count) => count + 1);

      setWords((currentWords) =>
        currentWords.map((word) =>
          word.id === currentWord.id
            ? {
                ...word,
                correct: word.correct + 1,
              }
            : word,
        ),
      );
    } else {
      setQuizFeedback(
        `❌ 不正解　正解：${currentWord.japanese}`,
      );
      setQuizWrong((count) => count + 1);

      setWords((currentWords) =>
        currentWords.map((word) =>
          word.id === currentWord.id
            ? {
                ...word,
                wrong: word.wrong + 1,
              }
            : word,
        ),
      );
    }

    setStats((currentStats) => ({
      ...currentStats,
      totalAnswers: currentStats.totalAnswers + 1,
      correctAnswers:
        currentStats.correctAnswers + (correct ? 1 : 0),
    }));
  }

  function goToNextQuiz() {
    if (quizIndex + 1 >= quizWords.length) {
      setQuizFinished(true);
      setQuizFeedback("");
      return;
    }

    setQuizIndex((currentIndex) => currentIndex + 1);
    setQuizInput("");
    setQuizFeedback("");
  }

  function handleQuizEnter(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Enter") {
      return;
    }

    if (quizFeedback === "") {
      submitQuizAnswer();
    } else {
      goToNextQuiz();
    }
  }

  function resetAllData() {
    const shouldReset = window.confirm(
      "登録単語と学習記録をすべて削除します。本当にいいですか？",
    );

    if (!shouldReset) {
      return;
    }

    stopListening();
    setWords([]);
    setStats(emptyStats);
    setQuizWords([]);
    setQuizFinished(false);
    setQuizFeedback("");
    resetForm();

    localStorage.removeItem(WORDS_STORAGE_KEY);
    localStorage.removeItem(STATS_STORAGE_KEY);
  }

  const panelStyle: React.CSSProperties = {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "28px",
    background: "white",
    borderRadius: "22px",
    boxShadow: "0 8px 28px rgba(15, 23, 42, 0.08)",
  };

  const mainButtonStyle: React.CSSProperties = {
    padding: "14px 20px",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 45%)",
        padding: "36px 18px 60px",
        color: "#0F172A",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "clamp(38px, 7vw, 58px)",
          color: "#2563EB",
          marginBottom: "10px",
        }}
      >
        📚 単語学習
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#64748B",
          fontSize: "18px",
          marginBottom: "28px",
        }}
      >
        登録・流し聞き・クイズ・復習をここで全部管理
      </p>

      <nav
        style={{
          maxWidth: "760px",
          margin: "0 auto 28px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px",
        }}
      >
        {[
          { id: "words", label: "📖 単語帳" },
          { id: "listening", label: "🔊 流し聞き" },
          { id: "quiz", label: "📝 クイズ" },
          { id: "stats", label: "📊 学習記録" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              stopListening();
              setActiveTab(tab.id as Tab);
            }}
            style={{
              ...mainButtonStyle,
              background:
                activeTab === tab.id ? "#2563EB" : "white",
              color:
                activeTab === tab.id ? "white" : "#334155",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {!isLoaded ? (
        <div style={panelStyle}>
          <p
            style={{
              textAlign: "center",
              fontSize: "20px",
            }}
          >
            読み込み中...
          </p>
        </div>
      ) : (
        <>
          {activeTab === "words" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "28px",
                  marginBottom: "24px",
                }}
              >
                {editingId === null
                  ? "✏️ 単語を登録"
                  : "🛠️ 単語を編集"}
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                <input
                  type="text"
                  placeholder="英単語を入力"
                  value={english}
                  onChange={(event) =>
                    setEnglish(event.target.value)
                  }
                  onKeyDown={handleEnter}
                  style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "19px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    boxSizing: "border-box",
                  }}
                />

                <input
                  type="text"
                  placeholder="日本語の意味を入力"
                  value={japanese}
                  onChange={(event) =>
                    setJapanese(event.target.value)
                  }
                  onKeyDown={handleEnter}
                  style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "19px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    boxSizing: "border-box",
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
                    onClick={saveWord}
                    style={{
                      ...mainButtonStyle,
                      flex: "1 1 220px",
                      color: "white",
                      background: "#2563EB",
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
                        ...mainButtonStyle,
                        flex: "1 1 150px",
                        background: "#E2E8F0",
                        color: "#334155",
                      }}
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #E2E8F0",
                  margin: "32px 0",
                }}
              />

              <h2
                style={{
                  textAlign: "center",
                  fontSize: "28px",
                  marginBottom: "8px",
                }}
              >
                📖 登録済み単語
              </h2>

              <p
                style={{
                  textAlign: "center",
                  color: "#64748B",
                  marginBottom: "20px",
                }}
              >
                全{words.length}語・苦手{weakWords.length}語
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 1fr) auto",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="search"
                  placeholder="英語または日本語で検索"
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "13px",
                    fontSize: "17px",
                    borderRadius: "12px",
                    border: "1px solid #CBD5E1",
                    boxSizing: "border-box",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowWeakOnly((current) => !current)
                  }
                  style={{
                    ...mainButtonStyle,
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
              </div>

              {displayedWords.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#64748B",
                    fontSize: "18px",
                    padding: "25px 0",
                  }}
                >
                  表示できる単語がありません
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {displayedWords.map((word, index) => (
                    <article
                      key={word.id}
                      style={{
                        padding: "18px",
                        border: "1px solid #E2E8F0",
                        borderRadius: "15px",
                        background: "#F8FAFC",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "14px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: "1 1 260px" }}>
                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: "bold",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {index + 1}. {word.english}
                          </div>

                          <div
                            style={{
                              marginTop: "7px",
                              fontSize: "19px",
                              color: "#475569",
                              overflowWrap: "anywhere",
                            }}
                          >
                            → {word.japanese}
                          </div>

                          <div
                            style={{
                              marginTop: "9px",
                              fontSize: "15px",
                              color: "#64748B",
                            }}
                          >
                            ⭕ {word.correct}回　❌{" "}
                            {word.wrong}回
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(word)
                            }
                            style={{
                              padding: "10px 12px",
                              border: "none",
                              borderRadius: "10px",
                              background: "#DBEAFE",
                              cursor: "pointer",
                              fontSize: "17px",
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteWord(word.id)
                            }
                            style={{
                              padding: "10px 12px",
                              border: "none",
                              borderRadius: "10px",
                              background: "#FEE2E2",
                              cursor: "pointer",
                              fontSize: "17px",
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

          {activeTab === "listening" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "30px",
                  marginBottom: "12px",
                }}
              >
                🔊 流し聞き
              </h2>

              <p
                style={{
                  textAlign: "center",
                  color: "#64748B",
                  fontSize: "18px",
                  marginBottom: "28px",
                }}
              >
                英単語のあとに日本語の意味を読み上げます
              </p>

              <label
                style={{
                  display: "block",
                  maxWidth: "360px",
                  margin: "0 auto 25px",
                  fontSize: "18px",
                  fontWeight: "bold",
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
                    display: "block",
                    width: "100%",
                    marginTop: "12px",
                  }}
                />
              </label>

              <div
                style={{
                  minHeight: "180px",
                  padding: "30px",
                  borderRadius: "20px",
                  background: "#EFF6FF",
                  textAlign: "center",
                  marginBottom: "24px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {currentListeningWord ? (
                  <div>
                    <div
                      style={{
                        fontSize: "40px",
                        fontWeight: "bold",
                        color: "#2563EB",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {currentListeningWord.english}
                    </div>

                    <div
                      style={{
                        fontSize: "25px",
                        marginTop: "15px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {currentListeningWord.japanese}
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "21px",
                      color: "#64748B",
                    }}
                  >
                    登録済みの{words.length}語を読み上げます
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={startListening}
                  disabled={isListening}
                  style={{
                    ...mainButtonStyle,
                    minWidth: "210px",
                    color: "white",
                    background: isListening
                      ? "#94A3B8"
                      : "#16A34A",
                  }}
                >
                  ▶️ 流し聞きを開始
                </button>

                <button
                  type="button"
                  onClick={stopListening}
                  disabled={!isListening}
                  style={{
                    ...mainButtonStyle,
                    minWidth: "160px",
                    color: "white",
                    background: isListening
                      ? "#DC2626"
                      : "#94A3B8",
                  }}
                >
                  ⏹ 停止
                </button>
              </div>
            </section>
          )}

          {activeTab === "quiz" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "30px",
                  marginBottom: "18px",
                }}
              >
                📝 意味入力クイズ
              </h2>

              {quizWords.length === 0 ||
              quizFinished ? (
                <div style={{ textAlign: "center" }}>
                  {quizFinished && (
                    <div
                      style={{
                        padding: "24px",
                        borderRadius: "18px",
                        background: "#EFF6FF",
                        marginBottom: "22px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "30px",
                          fontWeight: "bold",
                          color: "#2563EB",
                        }}
                      >
                        クイズ終了！
                      </div>

                      <p
                        style={{
                          fontSize: "22px",
                          marginTop: "14px",
                        }}
                      >
                        ⭕ {quizCorrect}問　❌ {quizWrong}問
                      </p>

                      <p
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                        }}
                      >
                        正答率：{quizRate}%
                      </p>
                    </div>
                  )}

                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "20px",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={weakQuizOnly}
                      onChange={(event) =>
                        setWeakQuizOnly(
                          event.target.checked,
                        )
                      }
                    />
                    🔥 苦手単語だけ出題
                  </label>

                  <div>
                    <button
                      type="button"
                      onClick={startQuiz}
                      style={{
                        ...mainButtonStyle,
                        minWidth: "240px",
                        color: "white",
                        background: "#7C3AED",
                      }}
                    >
                      🎮 クイズ開始
                    </button>
                  </div>

                  <p
                    style={{
                      marginTop: "18px",
                      color: "#64748B",
                    }}
                  >
                    {weakQuizOnly
                      ? `苦手単語：${weakWords.length}語`
                      : `登録単語：${words.length}語`}
                  </p>
                </div>
              ) : (
                <div>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748B",
                      fontSize: "17px",
                    }}
                  >
                    第{quizIndex + 1}問 / {quizWords.length}問
                  </p>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "clamp(36px, 8vw, 58px)",
                      fontWeight: "bold",
                      color: "#2563EB",
                      margin: "28px 0",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {quizWords[quizIndex].english}
                  </div>

                  <input
                    type="text"
                    placeholder="日本語の意味を入力"
                    value={quizInput}
                    disabled={quizFeedback !== ""}
                    onChange={(event) =>
                      setQuizInput(event.target.value)
                    }
                    onKeyDown={handleQuizEnter}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "16px",
                      fontSize: "21px",
                      textAlign: "center",
                      borderRadius: "13px",
                      border: "2px solid #CBD5E1",
                      boxSizing: "border-box",
                    }}
                  />

                  {quizFeedback !== "" && (
                    <div
                      style={{
                        marginTop: "18px",
                        padding: "18px",
                        textAlign: "center",
                        fontSize: "21px",
                        fontWeight: "bold",
                        borderRadius: "14px",
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
                      marginTop: "20px",
                      textAlign: "center",
                    }}
                  >
                    {quizFeedback === "" ? (
                      <button
                        type="button"
                        onClick={submitQuizAnswer}
                        style={{
                          ...mainButtonStyle,
                          minWidth: "200px",
                          color: "white",
                          background: "#7C3AED",
                        }}
                      >
                        答える
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={goToNextQuiz}
                        style={{
                          ...mainButtonStyle,
                          minWidth: "200px",
                          color: "white",
                          background: "#2563EB",
                        }}
                      >
                        {quizIndex + 1 >= quizWords.length
                          ? "結果を見る"
                          : "次の問題へ"}
                      </button>
                    )}
                  </div>

                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "20px",
                      color: "#64748B",
                      fontSize: "18px",
                    }}
                  >
                    ⭕ {quizCorrect}　❌ {quizWrong}
                  </p>
                </div>
              )}
            </section>
          )}

          {activeTab === "stats" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "30px",
                  marginBottom: "28px",
                }}
              >
                📊 学習記録
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "14px",
                }}
              >
                {[
                  {
                    label: "登録単語",
                    value: `${words.length}語`,
                  },
                  {
                    label: "苦手単語",
                    value: `${weakWords.length}語`,
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
                    label: "単語別回答",
                    value: `${totalWordAnswers}回`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "22px 12px",
                      borderRadius: "16px",
                      background: "#EFF6FF",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748B",
                        fontSize: "16px",
                      }}
                    >
                      {item.label}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: "#2563EB",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {totalWordAnswers > 0 && (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "20px",
                    borderRadius: "16px",
                    background: "#F8FAFC",
                    textAlign: "center",
                    fontSize: "18px",
                  }}
                >
                  単語別の正解数：{wordCorrectAnswers}回 /{" "}
                  {totalWordAnswers}回
                </div>
              )}

              <div
                style={{
                  marginTop: "32px",
                  textAlign: "center",
                }}
              >
                <button
                  type="button"
                  onClick={resetAllData}
                  style={{
                    ...mainButtonStyle,
                    background: "#FEE2E2",
                    color: "#B91C1C",
                  }}
                >
                  ⚠️ 単語と記録をすべて削除
                </button>
              </div>
            </section>
          )}
        </>
      )}

      <div
        style={{
          textAlign: "center",
          marginTop: "34px",
        }}
      >
        <Link
          href="/english"
          onClick={stopListening}
          style={{
            color: "#2563EB",
            fontSize: "21px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← 英語ページへ戻る
        </Link>
      </div>
    </main>
  );
}