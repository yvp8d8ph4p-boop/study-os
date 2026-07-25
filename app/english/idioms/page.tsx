"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Idiom = {
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

type Tab = "idioms" | "listening" | "quiz" | "stats";

const IDIOMS_STORAGE_KEY = "study-os-idioms";
const STATS_STORAGE_KEY = "study-os-idiom-stats";

const emptyStats: StudyStats = {
  totalAnswers: 0,
  correctAnswers: 0,
  listeningCount: 0,
};

function shuffleIdioms(idioms: Idiom[]) {
  const copiedIdioms = [...idioms];

  for (let i = copiedIdioms.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [copiedIdioms[i], copiedIdioms[randomIndex]] = [
      copiedIdioms[randomIndex],
      copiedIdioms[i],
    ];
  }

  return copiedIdioms;
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

export default function IdiomsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("idioms");

  const [english, setEnglish] = useState("");
  const [japanese, setJapanese] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [stats, setStats] = useState<StudyStats>(emptyStats);
  const [isLoaded, setIsLoaded] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [showWeakOnly, setShowWeakOnly] = useState(false);

  const [speechRate, setSpeechRate] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [currentListeningIdiom, setCurrentListeningIdiom] =
    useState<Idiom | null>(null);

  const [quizIdioms, setQuizIdioms] = useState<Idiom[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizInput, setQuizInput] = useState("");
  const [quizFeedback, setQuizFeedback] = useState("");
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizWrong, setQuizWrong] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [weakQuizOnly, setWeakQuizOnly] = useState(false);

  const listeningRef = useRef(false);

  useEffect(() => {
    const savedIdioms = localStorage.getItem(IDIOMS_STORAGE_KEY);
    const savedStats = localStorage.getItem(STATS_STORAGE_KEY);

    if (savedIdioms) {
      try {
        const parsedIdioms = JSON.parse(savedIdioms) as Partial<Idiom>[];

        const repairedIdioms: Idiom[] = parsedIdioms
          .filter(
            (idiom) =>
              typeof idiom.id === "number" &&
              typeof idiom.english === "string" &&
              typeof idiom.japanese === "string",
          )
          .map((idiom) => ({
            id: idiom.id as number,
            english: idiom.english as string,
            japanese: idiom.japanese as string,
            correct:
              typeof idiom.correct === "number" ? idiom.correct : 0,
            wrong: typeof idiom.wrong === "number" ? idiom.wrong : 0,
          }));

        setIdioms(repairedIdioms);
      } catch {
        console.error("熟語データを読み込めませんでした。");
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

    localStorage.setItem(IDIOMS_STORAGE_KEY, JSON.stringify(idioms));
  }, [idioms, isLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
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

  const weakIdioms = useMemo(() => {
    return idioms.filter(
      (idiom) => idiom.wrong > 0 && idiom.wrong >= idiom.correct,
    );
  }, [idioms]);

  const displayedIdioms = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return idioms.filter((idiom) => {
      const matchesSearch =
        normalizedSearch === "" ||
        idiom.english.toLowerCase().includes(normalizedSearch) ||
        idiom.japanese.includes(searchText.trim());

      const matchesWeak =
        !showWeakOnly ||
        (idiom.wrong > 0 && idiom.wrong >= idiom.correct);

      return matchesSearch && matchesWeak;
    });
  }, [idioms, searchText, showWeakOnly]);

  const totalIdiomAnswers = idioms.reduce(
    (total, idiom) => total + idiom.correct + idiom.wrong,
    0,
  );

  const idiomCorrectAnswers = idioms.reduce(
    (total, idiom) => total + idiom.correct,
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

  function saveIdiom() {
    const trimmedEnglish = english.trim();
    const trimmedJapanese = japanese.trim();

    if (trimmedEnglish === "" || trimmedJapanese === "") {
      alert("英熟語と日本語の意味を両方入力してね！");
      return;
    }

    if (editingId !== null) {
      setIdioms((currentIdioms) =>
        currentIdioms.map((idiom) =>
          idiom.id === editingId
            ? {
                ...idiom,
                english: trimmedEnglish,
                japanese: trimmedJapanese,
              }
            : idiom,
        ),
      );

      resetForm();
      return;
    }

    const duplicatedIdiom = idioms.some(
      (idiom) =>
        idiom.english.toLowerCase() === trimmedEnglish.toLowerCase(),
    );

    if (duplicatedIdiom) {
      const shouldAdd = window.confirm(
        "同じ英熟語がすでにあります。それでも登録しますか？",
      );

      if (!shouldAdd) {
        return;
      }
    }

    const newIdiom: Idiom = {
      id: Date.now(),
      english: trimmedEnglish,
      japanese: trimmedJapanese,
      correct: 0,
      wrong: 0,
    };

    setIdioms((currentIdioms) => [...currentIdioms, newIdiom]);
    resetForm();
  }

  function startEditing(idiom: Idiom) {
    setEnglish(idiom.english);
    setJapanese(idiom.japanese);
    setEditingId(idiom.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteIdiom(id: number) {
    const targetIdiom = idioms.find((idiom) => idiom.id === id);

    const shouldDelete = window.confirm(
      `「${targetIdiom?.english ?? "この熟語"}」を削除しますか？`,
    );

    if (!shouldDelete) {
      return;
    }

    setIdioms((currentIdioms) =>
      currentIdioms.filter((idiom) => idiom.id !== id),
    );

    if (editingId === id) {
      resetForm();
    }
  }

  function handleEnter(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      saveIdiom();
    }
  }

  function speakText(text: string, language: "en-US" | "ja-JP") {
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
    if (idioms.length === 0) {
      alert("先に熟語を登録してね！");
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

    for (const idiom of idioms) {
      if (!listeningRef.current) {
        break;
      }

      setCurrentListeningIdiom(idiom);
      await speakText(idiom.english, "en-US");

      if (!listeningRef.current) {
        break;
      }

      await wait(500);
      await speakText(idiom.japanese, "ja-JP");

      if (!listeningRef.current) {
        break;
      }

      await wait(900);
    }

    listeningRef.current = false;
    setIsListening(false);
    setCurrentListeningIdiom(null);
  }

  function stopListening() {
    listeningRef.current = false;
    setIsListening(false);
    setCurrentListeningIdiom(null);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function startQuiz() {
    const availableIdioms = weakQuizOnly ? weakIdioms : idioms;

    if (availableIdioms.length === 0) {
      alert(
        weakQuizOnly
          ? "苦手熟語がまだありません。"
          : "先に熟語を登録してね！",
      );
      return;
    }

    setQuizIdioms(shuffleIdioms(availableIdioms));
    setQuizIndex(0);
    setQuizInput("");
    setQuizFeedback("");
    setQuizCorrect(0);
    setQuizWrong(0);
    setQuizFinished(false);
  }

  function submitQuizAnswer() {
    if (
      quizFinished ||
      quizIdioms.length === 0 ||
      quizFeedback !== ""
    ) {
      return;
    }

    if (quizInput.trim() === "") {
      alert("意味を入力してね！");
      return;
    }

    const currentIdiom = quizIdioms[quizIndex];

    const correct = isCorrectAnswer(
      quizInput,
      currentIdiom.japanese,
    );

    if (correct) {
      setQuizFeedback("⭕ 正解！");
      setQuizCorrect((count) => count + 1);
    } else {
      setQuizFeedback(
        `❌ 不正解　正解：${currentIdiom.japanese}`,
      );
      setQuizWrong((count) => count + 1);
    }

    setIdioms((currentIdioms) =>
      currentIdioms.map((idiom) =>
        idiom.id === currentIdiom.id
          ? {
              ...idiom,
              correct: idiom.correct + (correct ? 1 : 0),
              wrong: idiom.wrong + (correct ? 0 : 1),
            }
          : idiom,
      ),
    );

    setStats((currentStats) => ({
      ...currentStats,
      totalAnswers: currentStats.totalAnswers + 1,
      correctAnswers:
        currentStats.correctAnswers + (correct ? 1 : 0),
    }));
  }

  function goToNextQuiz() {
    if (quizIndex + 1 >= quizIdioms.length) {
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
      "登録熟語と学習記録をすべて削除します。本当にいいですか？",
    );

    if (!shouldReset) {
      return;
    }

    stopListening();
    setIdioms([]);
    setStats(emptyStats);
    setQuizIdioms([]);
    setQuizFinished(false);
    setQuizFeedback("");
    resetForm();

    localStorage.removeItem(IDIOMS_STORAGE_KEY);
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

  const buttonStyle: React.CSSProperties = {
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
          "linear-gradient(180deg, #F5F3FF 0%, #F8FAFC 45%)",
        padding: "36px 18px 60px",
        color: "#0F172A",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "clamp(38px, 7vw, 58px)",
          color: "#7C3AED",
          marginBottom: "10px",
        }}
      >
        🔤 熟語学習
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#64748B",
          fontSize: "18px",
          marginBottom: "28px",
        }}
      >
        英熟語の登録・流し聞き・クイズ・復習
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
          { id: "idioms", label: "📖 熟語帳" },
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
              ...buttonStyle,
              background:
                activeTab === tab.id ? "#7C3AED" : "white",
              color: activeTab === tab.id ? "white" : "#334155",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {!isLoaded ? (
        <section style={panelStyle}>
          <p style={{ textAlign: "center", fontSize: "20px" }}>
            読み込み中...
          </p>
        </section>
      ) : (
        <>
          {activeTab === "idioms" && (
            <section style={panelStyle}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "28px",
                  marginBottom: "24px",
                }}
              >
                {editingId === null
                  ? "✏️ 熟語を登録"
                  : "🛠️ 熟語を編集"}
              </h2>

              <div style={{ display: "grid", gap: "14px" }}>
                <input
                  type="text"
                  placeholder="英熟語を入力　例：look for"
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
                  placeholder="日本語の意味　例：〜を探す"
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
                    onClick={saveIdiom}
                    style={{
                      ...buttonStyle,
                      flex: "1 1 220px",
                      color: "white",
                      background: "#7C3AED",
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
                📖 登録済み熟語
              </h2>

              <p
                style={{
                  textAlign: "center",
                  color: "#64748B",
                  marginBottom: "20px",
                }}
              >
                全{idioms.length}個・苦手{weakIdioms.length}個
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
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
                    ...buttonStyle,
                    background: showWeakOnly
                      ? "#F59E0B"
                      : "#E2E8F0",
                    color: showWeakOnly ? "white" : "#334155",
                  }}
                >
                  🔥 苦手だけ
                </button>
              </div>

              {displayedIdioms.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#64748B",
                    fontSize: "18px",
                    padding: "25px 0",
                  }}
                >
                  表示できる熟語がありません
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {displayedIdioms.map((idiom, index) => (
                    <article
                      key={idiom.id}
                      style={{
                        padding: "18px",
                        border: "1px solid #E2E8F0",
                        borderRadius: "15px",
                        background: "#FAF5FF",
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
                            {index + 1}. {idiom.english}
                          </div>

                          <div
                            style={{
                              marginTop: "7px",
                              fontSize: "19px",
                              color: "#475569",
                              overflowWrap: "anywhere",
                            }}
                          >
                            → {idiom.japanese}
                          </div>

                          <div
                            style={{
                              marginTop: "9px",
                              fontSize: "15px",
                              color: "#64748B",
                            }}
                          >
                            ⭕ {idiom.correct}回　❌ {idiom.wrong}回
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
                            onClick={() => startEditing(idiom)}
                            style={{
                              padding: "10px 12px",
                              border: "none",
                              borderRadius: "10px",
                              background: "#EDE9FE",
                              cursor: "pointer",
                              fontSize: "17px",
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteIdiom(idiom.id)}
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
                🔊 熟語の流し聞き
              </h2>

              <p
                style={{
                  textAlign: "center",
                  color: "#64748B",
                  fontSize: "18px",
                  marginBottom: "28px",
                }}
              >
                英熟語のあとに日本語の意味を読み上げます
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
                    setSpeechRate(Number(event.target.value))
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
                  background: "#FAF5FF",
                  textAlign: "center",
                  marginBottom: "24px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {currentListeningIdiom ? (
                  <div>
                    <div
                      style={{
                        fontSize: "38px",
                        fontWeight: "bold",
                        color: "#7C3AED",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {currentListeningIdiom.english}
                    </div>

                    <div
                      style={{
                        fontSize: "25px",
                        marginTop: "15px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {currentListeningIdiom.japanese}
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "21px",
                      color: "#64748B",
                    }}
                  >
                    登録済みの{idioms.length}個を読み上げます
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
                    ...buttonStyle,
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
                    ...buttonStyle,
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
                📝 熟語クイズ
              </h2>

              {quizIdioms.length === 0 || quizFinished ? (
                <div style={{ textAlign: "center" }}>
                  {quizFinished && (
                    <div
                      style={{
                        padding: "24px",
                        borderRadius: "18px",
                        background: "#FAF5FF",
                        marginBottom: "22px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "30px",
                          fontWeight: "bold",
                          color: "#7C3AED",
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
                        setWeakQuizOnly(event.target.checked)
                      }
                    />
                    🔥 苦手熟語だけ出題
                  </label>

                  <div>
                    <button
                      type="button"
                      onClick={startQuiz}
                      style={{
                        ...buttonStyle,
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
                      ? `苦手熟語：${weakIdioms.length}個`
                      : `登録熟語：${idioms.length}個`}
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
                    第{quizIndex + 1}問 / {quizIdioms.length}問
                  </p>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "clamp(32px, 7vw, 52px)",
                      fontWeight: "bold",
                      color: "#7C3AED",
                      margin: "28px 0",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {quizIdioms[quizIndex].english}
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
                        background: quizFeedback.startsWith("⭕")
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
                          ...buttonStyle,
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
                          ...buttonStyle,
                          minWidth: "200px",
                          color: "white",
                          background: "#2563EB",
                        }}
                      >
                        {quizIndex + 1 >= quizIdioms.length
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
                📊 熟語学習記録
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
                    label: "登録熟語",
                    value: `${idioms.length}個`,
                  },
                  {
                    label: "苦手熟語",
                    value: `${weakIdioms.length}個`,
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
                    label: "熟語別回答",
                    value: `${totalIdiomAnswers}回`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "22px 12px",
                      borderRadius: "16px",
                      background: "#FAF5FF",
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
                        color: "#7C3AED",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {totalIdiomAnswers > 0 && (
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
                  熟語別の正解数：{idiomCorrectAnswers}回 /{" "}
                  {totalIdiomAnswers}回
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
                    ...buttonStyle,
                    background: "#FEE2E2",
                    color: "#B91C1C",
                  }}
                >
                  ⚠️ 熟語と記録をすべて削除
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
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/english/vocabulary"
          onClick={stopListening}
          style={{
            color: "#2563EB",
            fontSize: "20px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          📚 単語帳へ
        </Link>

        <Link
          href="/english"
          onClick={stopListening}
          style={{
            color: "#7C3AED",
            fontSize: "20px",
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