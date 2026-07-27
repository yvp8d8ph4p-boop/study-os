"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TabType = "methods" | "flow" | "wordProblems" | "calculator" | "notes";
type EquationType = "linear" | "proportion" | "simultaneous";

type MethodItem = {
  id: number;
  title: string;
  icon: string;
  summary: string;
  example: string;
  steps: string[];
  tip: string;
  mistake: string;
};

type WordProblemItem = {
  id: number;
  category: string;
  icon: string;
  title: string;
  clue: string;
  example: string;
  equation: string;
  answer: string;
};

const methods: MethodItem[] = [
  {
    id: 1,
    title: "一次方程式",
    icon: "1️⃣",
    summary:
      "文字が1種類で、文字の次数が1の方程式です。移項してxを求めます。",
    example: "3x + 5 = 17",
    steps: [
      "定数項の5を右辺へ移項する",
      "3x = 12",
      "両辺を3で割る",
      "x = 4",
      "元の式に代入して確認する",
    ],
    tip: "移項するときは、符号が逆になる。",
    mistake: "右辺へ移したのに、符号を変え忘れるミスが多い。",
  },
  {
    id: 2,
    title: "かっこ・分数を含む方程式",
    icon: "🧩",
    summary:
      "先にかっこや分母をなくして、普通の一次方程式の形に直します。",
    example: "2(x + 3) = 14",
    steps: [
      "分配法則でかっこを外す",
      "2x + 6 = 14",
      "6を右辺へ移項する",
      "2x = 8",
      "x = 4",
    ],
    tip: "分数があるときは、両辺に分母の最小公倍数をかける。",
    mistake: "かっこの中の一部にしか数をかけないミスに注意。",
  },
  {
    id: 3,
    title: "比例式",
    icon: "⚖️",
    summary:
      "a:b=c:dの形では、外側どうしと内側どうしの積が等しくなります。",
    example: "3 : x = 6 : 10",
    steps: [
      "外側どうしと内側どうしをかける",
      "3 × 10 = 6x",
      "30 = 6x",
      "両辺を6で割る",
      "x = 5",
    ],
    tip: "a:b=c:dなら、ad=bc。",
    mistake: "対応する位置を間違えて、別の数どうしをかけないようにする。",
  },
  {
    id: 4,
    title: "連立方程式・加減法",
    icon: "➕",
    summary:
      "どちらかの文字の係数をそろえて、式どうしを足したり引いたりします。",
    example: "x + y = 7、x - y = 1",
    steps: [
      "2つの式をたす",
      "2x = 8",
      "x = 4",
      "x + y = 7に代入する",
      "y = 3",
    ],
    tip: "消したい文字の係数を先にそろえる。",
    mistake: "式全体を引くとき、すべての項の符号を変える。",
  },
  {
    id: 5,
    title: "連立方程式・代入法",
    icon: "🔁",
    summary:
      "一方の式をx=〜やy=〜の形にして、もう一方へ代入します。",
    example: "y = x + 1、2x + y = 10",
    steps: [
      "y=x+1を2つ目の式へ代入する",
      "2x + (x + 1) = 10",
      "3x = 9",
      "x = 3",
      "y = 4",
    ],
    tip: "すでにx=〜、y=〜になっている式があるときに便利。",
    mistake: "代入した式にかっこを付け忘れない。",
  },
  {
    id: 6,
    title: "二次方程式・因数分解",
    icon: "✖️",
    summary:
      "右辺を0にして因数分解し、積が0になる条件を使います。",
    example: "x² - 5x + 6 = 0",
    steps: [
      "左辺を因数分解する",
      "(x - 2)(x - 3) = 0",
      "x - 2 = 0 または x - 3 = 0",
      "x = 2 または x = 3",
    ],
    tip: "かけて定数項、足してxの係数になる2数を探す。",
    mistake: "解が2つあるのに、片方しか書かないミスに注意。",
  },
  {
    id: 7,
    title: "二次方程式・平方根",
    icon: "√",
    summary:
      "x²=aの形に変形し、正負両方の平方根を答えます。",
    example: "x² = 25",
    steps: [
      "x² = 25を確認する",
      "25の平方根を考える",
      "x = ±5",
    ],
    tip: "x²=aなら、x=±√a。",
    mistake: "±を付け忘れない。ただし√25自体は5。",
  },
  {
    id: 8,
    title: "二次方程式・解の公式",
    icon: "📐",
    summary:
      "因数分解できない二次方程式でも解ける公式です。",
    example: "x² + 3x - 1 = 0",
    steps: [
      "a=1、b=3、c=-1を確認する",
      "解の公式へ代入する",
      "x = (-3 ± √13) ÷ 2",
    ],
    tip: "ax²+bx+c=0の形に整理してから使う。",
    mistake: "bやcの符号を含めて代入する。",
  },
];

const wordProblems: WordProblemItem[] = [
  {
    id: 1,
    category: "代金",
    icon: "💰",
    title: "品物の個数と代金",
    clue: "単価×個数=代金を使う。",
    example:
      "120円のノートと80円のペンを合わせて10個買い、代金が960円でした。ノートは何冊ですか。",
    equation: "120x + 80(10 - x) = 960",
    answer: "ノートは4冊",
  },
  {
    id: 2,
    category: "速さ",
    icon: "🚲",
    title: "速さ・時間・道のり",
    clue: "道のり=速さ×時間。単位をそろえる。",
    example:
      "家から駅まで毎分80mで歩くと、15分かかりました。道のりは何mですか。",
    equation: "80 × 15 = x",
    answer: "1200m",
  },
  {
    id: 3,
    category: "追いつく",
    icon: "🏃",
    title: "速さの差を使う",
    clue: "追いつく問題では、進んだ道のりが等しくなる。",
    example:
      "兄が毎分60mで出発し、5分後に弟が毎分90mで追いかけました。弟は何分後に追いつきますか。",
    equation: "60(x + 5) = 90x",
    answer: "弟が出発して10分後",
  },
  {
    id: 4,
    category: "水そう",
    icon: "💧",
    title: "水を入れる・抜く",
    clue: "1分あたりの増減量×時間で考える。",
    example:
      "毎分5Lずつ水を入れると、12分で満水になりました。水そうの容量は何Lですか。",
    equation: "5 × 12 = x",
    answer: "60L",
  },
  {
    id: 5,
    category: "人数",
    icon: "👥",
    title: "男女・大人と子ども",
    clue: "合計人数と、それぞれの関係を式にする。",
    example:
      "あるクラスの生徒は35人で、男子は女子より3人多い。女子は何人ですか。",
    equation: "x + (x + 3) = 35",
    answer: "女子16人、男子19人",
  },
  {
    id: 6,
    category: "面積",
    icon: "📐",
    title: "長方形の縦と横",
    clue: "面積=縦×横を使う。",
    example:
      "横が縦より3cm長い長方形の面積が40cm²です。縦の長さを求めなさい。",
    equation: "x(x + 3) = 40",
    answer: "縦5cm、横8cm",
  },
  {
    id: 7,
    category: "割合",
    icon: "📊",
    title: "割合・増減",
    clue: "比べる量=もとにする量×割合。",
    example:
      "定価の20％引きで買ったところ2400円でした。定価はいくらですか。",
    equation: "0.8x = 2400",
    answer: "3000円",
  },
  {
    id: 8,
    category: "利益",
    icon: "📈",
    title: "原価・定価・利益",
    clue: "利益=売値-原価。",
    example:
      "原価800円の商品に25％の利益を加えて定価をつけました。定価はいくらですか。",
    equation: "800 × 1.25 = x",
    answer: "1000円",
  },
];

const flowItems = [
  {
    title: "一次方程式",
    icon: "1️⃣",
    steps: ["かっこを外す", "分母をなくす", "移項する", "同類項をまとめる", "係数で割る", "検算する"],
  },
  {
    title: "連立方程式",
    icon: "🟰",
    steps: ["加減法か代入法を選ぶ", "文字を1つ消す", "残った文字を求める", "元の式へ代入する", "もう一方を求める", "2つとも検算する"],
  },
  {
    title: "二次方程式",
    icon: "²",
    steps: ["右辺を0にする", "式を整理する", "因数分解できるか見る", "平方根または解の公式を使う", "解をすべて書く", "検算する"],
  },
];

function parseNumber(value: string): number | null {
  const number = Number(value.trim());
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value: number): string {
  if (Math.abs(value) < 1e-10) return "0";
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(8)));
}

export default function EquationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("methods");
  const [searchText, setSearchText] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [learned, setLearned] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [equationType, setEquationType] =
    useState<EquationType>("linear");

  const [linearA, setLinearA] = useState("3");
  const [linearB, setLinearB] = useState("5");
  const [linearC, setLinearC] = useState("17");

  const [propA, setPropA] = useState("3");
  const [propB, setPropB] = useState("");
  const [propC, setPropC] = useState("6");
  const [propD, setPropD] = useState("10");

  const [simA, setSimA] = useState("1");
  const [simB, setSimB] = useState("1");
  const [simC, setSimC] = useState("7");
  const [simD, setSimD] = useState("1");
  const [simE, setSimE] = useState("-1");
  const [simF, setSimF] = useState("1");

  const [calculatorResult, setCalculatorResult] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem(
      "study-os-equation-favorites",
    );
    const savedLearned = localStorage.getItem("study-os-equation-learned");
    const savedNote = localStorage.getItem("study-os-equation-note");

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        setFavorites([]);
      }
    }

    if (savedLearned) {
      try {
        setLearned(JSON.parse(savedLearned));
      } catch {
        setLearned([]);
      }
    }

    if (savedNote) {
      setNote(savedNote);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "study-os-equation-favorites",
      JSON.stringify(favorites),
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "study-os-equation-learned",
      JSON.stringify(learned),
    );
  }, [learned]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem("study-os-equation-note", note);

      if (note.trim()) {
        setSaveMessage("保存しました");
        window.setTimeout(() => setSaveMessage(""), 1200);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [note]);

  const filteredMethods = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return methods;

    return methods.filter((item) =>
      [
        item.title,
        item.summary,
        item.example,
        item.tip,
        item.mistake,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [searchText]);

  const filteredWordProblems = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return wordProblems;

    return wordProblems.filter((item) =>
      [
        item.category,
        item.title,
        item.clue,
        item.example,
        item.equation,
        item.answer,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [searchText]);

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function toggleLearned(id: number) {
    setLearned((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function solveLinear() {
    const a = parseNumber(linearA);
    const b = parseNumber(linearB);
    const c = parseNumber(linearC);

    if (a === null || b === null || c === null) {
      setCalculatorResult(["数字を正しく入力してください。"]);
      return;
    }

    if (a === 0) {
      if (b === c) {
        setCalculatorResult([
          `${formatNumber(b)} = ${formatNumber(c)}`,
          "すべての数が解になります。",
        ]);
      } else {
        setCalculatorResult([
          `${formatNumber(b)} = ${formatNumber(c)}`,
          "この方程式に解はありません。",
        ]);
      }
      return;
    }

    const moved = c - b;
    const x = moved / a;

    setCalculatorResult([
      `${formatNumber(a)}x + ${formatNumber(b)} = ${formatNumber(c)}`,
      `${formatNumber(a)}x = ${formatNumber(c)} - ${formatNumber(b)}`,
      `${formatNumber(a)}x = ${formatNumber(moved)}`,
      `x = ${formatNumber(moved)} ÷ ${formatNumber(a)}`,
      `答え：x = ${formatNumber(x)}`,
    ]);
  }

  function solveProportion() {
    const a = parseNumber(propA);
    const c = parseNumber(propC);
    const d = parseNumber(propD);

    if (a === null || c === null || d === null) {
      setCalculatorResult(["数字を正しく入力してください。"]);
      return;
    }

    if (c === 0) {
      setCalculatorResult(["cには0以外の数を入力してください。"]);
      return;
    }

    const x = (a * d) / c;

    setCalculatorResult([
      `${formatNumber(a)} : x = ${formatNumber(c)} : ${formatNumber(d)}`,
      `${formatNumber(a)} × ${formatNumber(d)} = ${formatNumber(c)}x`,
      `${formatNumber(a * d)} = ${formatNumber(c)}x`,
      `答え：x = ${formatNumber(x)}`,
    ]);

    setPropB(formatNumber(x));
  }

  function solveSimultaneous() {
    const a = parseNumber(simA);
    const b = parseNumber(simB);
    const c = parseNumber(simC);
    const d = parseNumber(simD);
    const e = parseNumber(simE);
    const f = parseNumber(simF);

    if (
      a === null ||
      b === null ||
      c === null ||
      d === null ||
      e === null ||
      f === null
    ) {
      setCalculatorResult(["数字を正しく入力してください。"]);
      return;
    }

    const determinant = a * e - b * d;

    if (Math.abs(determinant) < 1e-10) {
      setCalculatorResult([
        "2つの式から、解を1つに決められません。",
        "同じ直線または平行な直線になっている可能性があります。",
      ]);
      return;
    }

    const x = (c * e - b * f) / determinant;
    const y = (a * f - c * d) / determinant;

    setCalculatorResult([
      `① ${formatNumber(a)}x + ${formatNumber(b)}y = ${formatNumber(c)}`,
      `② ${formatNumber(d)}x + ${formatNumber(e)}y = ${formatNumber(f)}`,
      `行列式：${formatNumber(a)}×${formatNumber(e)} - ${formatNumber(b)}×${formatNumber(d)} = ${formatNumber(determinant)}`,
      `答え：x = ${formatNumber(x)}`,
      `答え：y = ${formatNumber(y)}`,
    ]);
  }

  function runCalculator() {
    if (equationType === "linear") {
      solveLinear();
    } else if (equationType === "proportion") {
      solveProportion();
    } else {
      solveSimultaneous();
    }
  }

  const tabs: {
    id: TabType;
    label: string;
    icon: string;
  }[] = [
    { id: "methods", label: "解き方", icon: "📖" },
    { id: "flow", label: "解く流れ", icon: "📋" },
    { id: "wordProblems", label: "文章題", icon: "📚" },
    { id: "calculator", label: "電卓", icon: "🧮" },
    { id: "notes", label: "ノート", icon: "📝" },
  ];

  return (
    <main className="min-h-screen bg-[#f4fbff] px-4 pb-28 pt-6 text-slate-950">
      <div className="mx-auto w-full max-w-5xl">
        <header className="relative overflow-hidden rounded-[32px] border-2 border-slate-950 bg-white p-6 shadow-[6px_6px_0_#0f172a] sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-200/80" />
          <div className="absolute -bottom-16 left-16 h-36 w-36 rounded-full bg-cyan-100" />

          <div className="relative">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/math"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-sky-100 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-sky-200"
              >
                ← 数学へ
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black transition hover:bg-slate-100"
              >
                🏠 ホーム
              </Link>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-300 text-3xl shadow-[4px_4px_0_#0f172a]">
                🟰
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.2em] text-sky-600">
                  MATHEMATICS
                </p>

                <h1 className="text-3xl font-black sm:text-4xl">
                  方程式
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-600 sm:text-base">
                  一次方程式・比例式・連立方程式・二次方程式を、手順から整理できます。
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchText("");
                }}
                className={`rounded-[20px] border-2 border-slate-950 p-3 transition sm:p-4 ${
                  isActive
                    ? "-translate-y-1 bg-sky-300 shadow-[5px_5px_0_#0f172a]"
                    : "bg-white shadow-[3px_3px_0_#0f172a] hover:-translate-y-1 hover:bg-sky-50"
                }`}
              >
                <span className="block text-2xl">{tab.icon}</span>
                <span className="mt-2 block text-xs font-black sm:text-sm">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </section>

        {(activeTab === "methods" ||
          activeTab === "wordProblems") && (
          <section className="mt-6">
            <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-950 bg-white px-4 shadow-[4px_4px_0_#0f172a]">
              <span className="text-xl">🔎</span>

              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={
                  activeTab === "methods"
                    ? "例：連立方程式、因数分解"
                    : "例：速さ、割合、代金"
                }
                className="min-w-0 flex-1 bg-transparent py-4 font-bold outline-none"
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="font-black text-slate-500"
                >
                  ×
                </button>
              )}
            </div>
          </section>
        )}

        {activeTab === "methods" && (
          <section className="mt-6 grid gap-5 sm:grid-cols-2">
            {filteredMethods.map((item) => {
              const isFavorite = favorites.includes(item.id);
              const isLearned = learned.includes(item.id);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[26px] border-2 border-slate-950 bg-white shadow-[5px_5px_0_#0f172a]"
                >
                  <div className="flex items-start justify-between gap-3 border-b-2 border-slate-950 bg-sky-100 p-5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.icon}</span>

                      <h2 className="text-xl font-black">
                        {item.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id)}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 text-xl ${
                        isFavorite ? "bg-yellow-200" : "bg-white"
                      }`}
                    >
                      {isFavorite ? "★" : "☆"}
                    </button>
                  </div>

                  <div className="p-5">
                    <p className="text-sm font-bold leading-6 text-slate-700">
                      {item.summary}
                    </p>

                    <div className="mt-4 rounded-2xl border-2 border-slate-950 bg-slate-950 p-4 text-center font-black text-white">
                      {item.example}
                    </div>

                    <div className="mt-5">
                      <p className="text-sm font-black text-sky-700">
                        解き方
                      </p>

                      <div className="mt-3 space-y-3">
                        {item.steps.map((step, index) => (
                          <div
                            key={step}
                            className="flex items-start gap-3"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-950 bg-sky-200 text-xs font-black">
                              {index + 1}
                            </span>

                            <p className="pt-0.5 text-sm font-bold leading-6">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-yellow-50 p-4">
                      <p className="text-xs font-black text-amber-700">
                        💡 コツ
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {item.tip}
                      </p>
                    </div>

                    <div className="mt-3 rounded-2xl bg-rose-50 p-4">
                      <p className="text-xs font-black text-rose-700">
                        ⚠️ よくあるミス
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {item.mistake}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleLearned(item.id)}
                      className={`mt-4 w-full rounded-2xl border-2 border-slate-950 px-4 py-3 font-black transition ${
                        isLearned
                          ? "bg-emerald-200"
                          : "bg-white shadow-[3px_3px_0_#0f172a] hover:-translate-y-0.5 hover:bg-emerald-50"
                      }`}
                    >
                      {isLearned ? "✓ 確認済み" : "確認したらチェック"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {activeTab === "flow" && (
          <section className="mt-8 grid gap-6">
            {flowItems.map((flow) => (
              <article
                key={flow.title}
                className="rounded-[28px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a] sm:p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{flow.icon}</span>
                  <h2 className="text-2xl font-black">{flow.title}</h2>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {flow.steps.map((step, index) => (
                    <div key={step}>
                      <div className="rounded-2xl border-2 border-slate-950 bg-sky-100 p-4 text-center shadow-[3px_3px_0_#0f172a]">
                        <p className="text-xs font-black text-sky-700">
                          STEP {index + 1}
                        </p>
                        <p className="mt-2 font-black">{step}</p>
                      </div>

                      {index < flow.steps.length - 1 && (
                        <p className="py-2 text-center text-2xl font-black sm:hidden">
                          ↓
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {activeTab === "wordProblems" && (
          <section className="mt-6 grid gap-5 sm:grid-cols-2">
            {filteredWordProblems.map((item) => (
              <article
                key={item.id}
                className="rounded-[26px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-200 text-2xl">
                    {item.icon}
                  </div>

                  <div>
                    <p className="text-xs font-black text-sky-700">
                      {item.category}
                    </p>
                    <h2 className="text-xl font-black">{item.title}</h2>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-yellow-50 p-4">
                  <p className="text-xs font-black text-amber-700">
                    見分け方
                  </p>
                  <p className="mt-1 text-sm font-bold">{item.clue}</p>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-black text-sky-700">例題</p>
                  <p className="mt-1 text-sm font-bold leading-6">
                    {item.example}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border-2 border-slate-950 bg-slate-950 p-4 text-center font-black text-white">
                  {item.equation}
                </div>

                <div className="mt-4 rounded-2xl border-2 border-slate-950 bg-emerald-100 p-4">
                  <p className="text-xs font-black text-emerald-700">
                    答え
                  </p>
                  <p className="mt-1 font-black">{item.answer}</p>
                </div>
              </article>
            ))}
          </section>
        )}

        {activeTab === "calculator" && (
          <section className="mt-8">
            <div className="mx-auto max-w-2xl rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[7px_7px_0_#0f172a] sm:p-7">
              <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                EQUATION CALCULATOR
              </p>

              <h2 className="text-2xl font-black">方程式電卓</h2>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["linear", "一次方程式"],
                  ["proportion", "比例式"],
                  ["simultaneous", "連立方程式"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setEquationType(id as EquationType);
                      setCalculatorResult([]);
                    }}
                    className={`rounded-2xl border-2 border-slate-950 p-3 text-sm font-black ${
                      equationType === id
                        ? "bg-sky-300 shadow-[4px_4px_0_#0f172a]"
                        : "bg-white hover:bg-sky-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {equationType === "linear" && (
                <div className="mt-6">
                  <p className="font-black">ax + b = c</p>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      ["a", linearA, setLinearA],
                      ["b", linearB, setLinearB],
                      ["c", linearC, setLinearC],
                    ].map(([label, value, setter]) => (
                      <label key={label as string}>
                        <span className="mb-2 block text-sm font-black">
                          {label as string}
                        </span>
                        <input
                          value={value as string}
                          onChange={(event) =>
                            (
                              setter as React.Dispatch<
                                React.SetStateAction<string>
                              >
                            )(event.target.value)
                          }
                          inputMode="decimal"
                          className="w-full rounded-2xl border-2 border-slate-950 bg-sky-50 p-3 text-center font-black outline-none"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {equationType === "proportion" && (
                <div className="mt-6">
                  <p className="font-black">a : x = c : d</p>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <input
                      value={propA}
                      onChange={(event) => setPropA(event.target.value)}
                      placeholder="a"
                      className="rounded-2xl border-2 border-slate-950 bg-sky-50 p-3 text-center font-black"
                    />
                    <div className="rounded-2xl border-2 border-slate-950 bg-slate-950 p-3 text-center font-black text-white">
                      x
                    </div>
                    <input
                      value={propC}
                      onChange={(event) => setPropC(event.target.value)}
                      placeholder="c"
                      className="rounded-2xl border-2 border-slate-950 bg-sky-50 p-3 text-center font-black"
                    />
                    <div className="text-center font-black">:</div>
                    <div className="text-center font-black">=</div>
                    <input
                      value={propD}
                      onChange={(event) => setPropD(event.target.value)}
                      placeholder="d"
                      className="rounded-2xl border-2 border-slate-950 bg-sky-50 p-3 text-center font-black"
                    />
                  </div>
                </div>
              )}

              {equationType === "simultaneous" && (
                <div className="mt-6 space-y-4">
                  <p className="font-black">
                    ax + by = c
                    <br />
                    dx + ey = f
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["a", simA, setSimA],
                      ["b", simB, setSimB],
                      ["c", simC, setSimC],
                      ["d", simD, setSimD],
                      ["e", simE, setSimE],
                      ["f", simF, setSimF],
                    ].map(([label, value, setter]) => (
                      <label key={label as string}>
                        <span className="mb-1 block text-xs font-black">
                          {label as string}
                        </span>
                        <input
                          value={value as string}
                          onChange={(event) =>
                            (
                              setter as React.Dispatch<
                                React.SetStateAction<string>
                              >
                            )(event.target.value)
                          }
                          inputMode="decimal"
                          className="w-full rounded-2xl border-2 border-slate-950 bg-sky-50 p-3 text-center font-black"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={runCalculator}
                className="mt-6 w-full rounded-2xl border-2 border-slate-950 bg-sky-300 px-5 py-4 text-lg font-black shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-1"
              >
                解く
              </button>

              <div className="mt-6 min-h-32 rounded-[24px] border-2 border-slate-950 bg-slate-950 p-5 text-white">
                {calculatorResult.length === 0 ? (
                  <p className="font-bold text-slate-400">
                    数字を入力して「解く」を押してください。
                  </p>
                ) : (
                  <div className="space-y-2">
                    {calculatorResult.map((line, index) => (
                      <p
                        key={`${line}-${index}`}
                        className={
                          index === calculatorResult.length - 1
                            ? "text-xl font-black text-sky-300"
                            : "font-bold"
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "notes" && (
          <section className="mt-8">
            <div className="rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#0f172a] sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                    NOTEBOOK
                  </p>

                  <h2 className="text-2xl font-black">
                    方程式ノート
                  </h2>

                  <p className="mt-2 text-sm font-bold text-slate-600">
                    文章題の式の立て方や、間違えた原因を記録できます。
                  </p>
                </div>

                <p className="text-sm font-black text-emerald-600">
                  {saveMessage && `✓ ${saveMessage}`}
                </p>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={`例：
・移項すると符号が変わる
・速さの問題は単位をそろえる
・二次方程式では解を2つとも書く`}
                className="mt-6 min-h-[430px] w-full resize-y rounded-[24px] border-2 border-slate-950 bg-[#fbfdff] p-5 font-bold leading-8 outline-none focus:bg-sky-50"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-500">
                  入力内容はこの端末に自動保存されます。
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const shouldDelete = window.confirm(
                      "方程式ノートをすべて消しますか？",
                    );

                    if (shouldDelete) {
                      setNote("");
                      localStorage.removeItem(
                        "study-os-equation-note",
                      );
                    }
                  }}
                  className="rounded-xl border-2 border-slate-950 bg-rose-100 px-4 py-2 text-sm font-black hover:bg-rose-200"
                >
                  ノートを消去
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-[28px] border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[6px_6px_0_#7dd3fc]">
          <p className="text-sm font-black tracking-[0.18em] text-sky-300">
            STUDY POINT
          </p>

          <h2 className="mt-2 text-xl font-black">
            方程式は、答えよりも式を立てるまでが勝負。
          </h2>

          <p className="mt-2 text-sm font-bold leading-6 text-slate-300">
            何をxとするか、数量の関係は何か、単位がそろっているかを先に確認すると文章題がかなり解きやすくなります。
          </p>
        </section>
      </div>
    </main>
  );
}