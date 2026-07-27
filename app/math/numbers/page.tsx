"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TabType = "formulas" | "calculator" | "notes";
type FormulaCategory =
  | "すべて"
  | "正負の数"
  | "文字式"
  | "式の計算"
  | "展開"
  | "因数分解"
  | "平方根";

type FormulaItem = {
  id: number;
  category: Exclude<FormulaCategory, "すべて">;
  title: string;
  formula: string;
  explanation: string;
  example: string;
  tip: string;
};

const categories: FormulaCategory[] = [
  "すべて",
  "正負の数",
  "文字式",
  "式の計算",
  "展開",
  "因数分解",
  "平方根",
];

const formulaItems: FormulaItem[] = [
  {
    id: 1,
    category: "正負の数",
    title: "同符号の加法",
    formula: "(+a) + (+b) = +(a + b)",
    explanation:
      "符号が同じ数どうしを足すときは、絶対値を足して共通の符号をつけます。",
    example: "(-3) + (-5) = -8",
    tip: "同じ符号なら、数字を足して符号はそのまま。",
  },
  {
    id: 2,
    category: "正負の数",
    title: "異符号の加法",
    formula: "(+a) + (-b)",
    explanation:
      "符号が異なるときは、絶対値の大きい数から小さい数を引きます。",
    example: "7 + (-3) = 4",
    tip: "大きい方の符号を答えにつける。",
  },
  {
    id: 3,
    category: "正負の数",
    title: "乗法・除法の符号",
    formula: "同符号 → ＋　異符号 → －",
    explanation:
      "かけ算と割り算では、2つの数の符号が同じなら正、異なるなら負になります。",
    example: "(-4) × (-3) = 12",
    tip: "マイナスが偶数個なら＋、奇数個なら－。",
  },
  {
    id: 4,
    category: "文字式",
    title: "乗法記号の省略",
    formula: "a × b = ab",
    explanation:
      "文字を使った式では、文字どうしや数と文字の間の乗法記号を省略できます。",
    example: "3 × x × y = 3xy",
    tip: "数字を先に、文字をアルファベット順に書く。",
  },
  {
    id: 5,
    category: "文字式",
    title: "除法の表し方",
    formula: "a ÷ b = a / b",
    explanation:
      "文字式の割り算は、分数を使って表すのが基本です。",
    example: "x ÷ 5 = x / 5",
    tip: "割られる数が分子、割る数が分母。",
  },
  {
    id: 6,
    category: "文字式",
    title: "数量を文字式で表す",
    formula: "単価 × 個数 = 代金",
    explanation:
      "文章に出てくる数量の関係を見つけ、文字を使った式に直します。",
    example: "1個a円の品物を5個買う → 5a円",
    tip: "単位をそろえてから式を作る。",
  },
  {
    id: 7,
    category: "式の計算",
    title: "同類項をまとめる",
    formula: "ax + bx = (a + b)x",
    explanation:
      "文字の部分が同じ項は、係数を足したり引いたりしてまとめられます。",
    example: "3x + 5x = 8x",
    tip: "文字と指数が同じ項だけまとめる。",
  },
  {
    id: 8,
    category: "式の計算",
    title: "分配法則",
    formula: "a(b + c) = ab + ac",
    explanation:
      "かっこの外の数を、かっこの中のすべての項にかけます。",
    example: "3(x + 4) = 3x + 12",
    tip: "後ろの項へのかけ忘れに注意。",
  },
  {
    id: 9,
    category: "式の計算",
    title: "多項式の加法・減法",
    formula: "(A + B) - (C + D) = A + B - C - D",
    explanation:
      "式を引くときは、後ろのかっこの中のすべての符号を変えます。",
    example: "(3x + 2) - (x - 4) = 2x + 6",
    tip: "マイナスのかっこを外すと全項の符号が逆になる。",
  },
  {
    id: 10,
    category: "展開",
    title: "和と和の積",
    formula: "(x + a)(x + b) = x² + (a + b)x + ab",
    explanation:
      "前どうし、外どうし、内どうし、後ろどうしをかけて整理します。",
    example: "(x + 2)(x + 3) = x² + 5x + 6",
    tip: "xの係数は足し算、定数項はかけ算。",
  },
  {
    id: 11,
    category: "展開",
    title: "和の平方",
    formula: "(a + b)² = a² + 2ab + b²",
    explanation:
      "2つの項の和を2乗した式を展開する公式です。",
    example: "(x + 3)² = x² + 6x + 9",
    tip: "真ん中の2abを忘れない。",
  },
  {
    id: 12,
    category: "展開",
    title: "差の平方",
    formula: "(a - b)² = a² - 2ab + b²",
    explanation:
      "2つの項の差を2乗した式を展開する公式です。",
    example: "(x - 4)² = x² - 8x + 16",
    tip: "最後のb²は必ずプラス。",
  },
  {
    id: 13,
    category: "展開",
    title: "和と差の積",
    formula: "(a + b)(a - b) = a² - b²",
    explanation:
      "同じ2つの項の和と差をかけると、平方の差になります。",
    example: "(x + 5)(x - 5) = x² - 25",
    tip: "真ん中の項が消える形。",
  },
  {
    id: 14,
    category: "因数分解",
    title: "共通因数でくくる",
    formula: "ab + ac = a(b + c)",
    explanation:
      "すべての項に共通している数や文字を、かっこの外に出します。",
    example: "6x + 9 = 3(2x + 3)",
    tip: "まず最大の共通因数を探す。",
  },
  {
    id: 15,
    category: "因数分解",
    title: "積と和を使う因数分解",
    formula: "x² + (a + b)x + ab = (x + a)(x + b)",
    explanation:
      "かけて定数項、足してxの係数になる2数を探します。",
    example: "x² + 7x + 12 = (x + 3)(x + 4)",
    tip: "『かけて右、足して真ん中』で探す。",
  },
  {
    id: 16,
    category: "因数分解",
    title: "平方の差",
    formula: "a² - b² = (a + b)(a - b)",
    explanation:
      "2つの平方の差になっている式に使える公式です。",
    example: "x² - 16 = (x + 4)(x - 4)",
    tip: "引き算になっていることを確認する。",
  },
  {
    id: 17,
    category: "平方根",
    title: "平方根の意味",
    formula: "x² = a を満たすxがaの平方根",
    explanation:
      "2乗するとaになる数を、aの平方根といいます。",
    example: "9の平方根は3と-3",
    tip: "『平方根』は正負の2つ。√9そのものは3。",
  },
  {
    id: 18,
    category: "平方根",
    title: "根号の中を簡単にする",
    formula: "√(a²b) = a√b",
    explanation:
      "根号の中に平方数があるときは、その平方根を根号の外に出せます。",
    example: "√12 = √(4×3) = 2√3",
    tip: "4・9・16・25などの平方数を探す。",
  },
  {
    id: 19,
    category: "平方根",
    title: "平方根の乗法",
    formula: "√a × √b = √(ab)",
    explanation:
      "平方根どうしのかけ算は、根号の中をかけてから簡単にします。",
    example: "√2 × √8 = √16 = 4",
    tip: "最後に必ず根号の中を簡単にする。",
  },
  {
    id: 20,
    category: "平方根",
    title: "分母の有理化",
    formula: "a / √b = a√b / b",
    explanation:
      "分母に根号があるときは、分子と分母に同じ平方根をかけます。",
    example: "1 / √3 = √3 / 3",
    tip: "分母から√をなくす作業。",
  },
];

const calculatorButtons = [
  "C",
  "(",
  ")",
  "⌫",
  "7",
  "8",
  "9",
  "÷",
  "4",
  "5",
  "6",
  "×",
  "1",
  "2",
  "3",
  "−",
  "0",
  ".",
  "√",
  "＋",
  "π",
  "²",
  "=",
];

function calculateExpression(expression: string): string {
  try {
    let converted = expression
      .replaceAll("×", "*")
      .replaceAll("÷", "/")
      .replaceAll("−", "-")
      .replaceAll("＋", "+")
      .replaceAll("π", `(${Math.PI})`)
      .replaceAll("√", "Math.sqrt");

    converted = converted.replace(
      /(\d+(?:\.\d+)?|\([^()]*\))²/g,
      "($1**2)",
    );

    if (!/^[0-9+\-*/().\sA-Za-z]*$/.test(converted)) {
      return "エラー";
    }

    if (
      converted.includes("constructor") ||
      converted.includes("prototype") ||
      converted.includes("__")
    ) {
      return "エラー";
    }

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${converted});`)();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      return "エラー";
    }

    return Number.isInteger(result)
      ? String(result)
      : String(Number(result.toFixed(10)));
  } catch {
    return "エラー";
  }
}

export default function NumbersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("formulas");
  const [selectedCategory, setSelectedCategory] =
    useState<FormulaCategory>("すべて");
  const [searchText, setSearchText] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [learnedItems, setLearnedItems] = useState<number[]>([]);
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [note, setNote] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const savedFavorites = localStorage.getItem("study-os-number-favorites");
    const savedLearned = localStorage.getItem("study-os-number-learned");
    const savedNote = localStorage.getItem("study-os-number-note");

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        setFavorites([]);
      }
    }

    if (savedLearned) {
      try {
        setLearnedItems(JSON.parse(savedLearned));
      } catch {
        setLearnedItems([]);
      }
    }

    if (savedNote) {
      setNote(savedNote);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "study-os-number-favorites",
      JSON.stringify(favorites),
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "study-os-number-learned",
      JSON.stringify(learnedItems),
    );
  }, [learnedItems]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem("study-os-number-note", note);

      if (note.trim()) {
        setSaveMessage("保存しました");
        window.setTimeout(() => setSaveMessage(""), 1200);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [note]);

  const filteredFormulas = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return formulaItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "すべて" ||
        item.category === selectedCategory;

      const matchesSearch =
        keyword.length === 0 ||
        item.title.toLowerCase().includes(keyword) ||
        item.formula.toLowerCase().includes(keyword) ||
        item.explanation.toLowerCase().includes(keyword) ||
        item.example.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [searchText, selectedCategory]);

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function toggleLearned(id: number) {
    setLearnedItems((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function handleCalculatorButton(button: string) {
    if (button === "C") {
      setExpression("");
      setResult("");
      return;
    }

    if (button === "⌫") {
      setExpression((current) => current.slice(0, -1));
      setResult("");
      return;
    }

    if (button === "=") {
      if (!expression.trim()) return;
      setResult(calculateExpression(expression));
      return;
    }

    setExpression((current) => current + button);
    setResult("");
  }

  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: "formulas",
      label: "公式",
      icon: "📖",
      description: "重要公式と例題",
    },
    {
      id: "calculator",
      label: "電卓",
      icon: "🧮",
      description: "式を計算",
    },
    {
      id: "notes",
      label: "ノート",
      icon: "📝",
      description: "自動保存",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4fbff] px-4 pb-28 pt-6 text-slate-950">
      <div className="mx-auto w-full max-w-5xl">
        <header className="relative overflow-hidden rounded-[32px] border-2 border-slate-950 bg-white p-6 shadow-[6px_6px_0_#0f172a] sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-200/80" />
          <div className="absolute -bottom-16 left-16 h-36 w-36 rounded-full bg-cyan-100" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
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
                🔢
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.2em] text-sky-600">
                  MATHEMATICS
                </p>

                <h1 className="text-3xl font-black sm:text-4xl">
                  数と式
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-600 sm:text-base">
                  正負の数から平方根まで、重要な公式と計算方法をまとめて確認できます。
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-3 gap-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-[22px] border-2 border-slate-950 p-3 text-left transition sm:p-5 ${
                  isActive
                    ? "translate-y-[-3px] bg-sky-300 shadow-[5px_5px_0_#0f172a]"
                    : "bg-white shadow-[3px_3px_0_#0f172a] hover:-translate-y-1 hover:bg-sky-50"
                }`}
              >
                <span className="block text-2xl sm:text-3xl">
                  {tab.icon}
                </span>

                <span className="mt-2 block text-sm font-black sm:text-lg">
                  {tab.label}
                </span>

                <span className="mt-1 hidden text-xs font-bold text-slate-600 sm:block">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </section>

        {activeTab === "formulas" && (
          <section className="mt-8">
            <div className="rounded-[28px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                    FORMULAS
                  </p>

                  <h2 className="text-2xl font-black">
                    公式・重要事項
                  </h2>
                </div>

                <div className="rounded-full border-2 border-slate-950 bg-sky-100 px-4 py-2 text-xs font-black">
                  {filteredFormulas.length}件表示
                </div>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-black">
                  公式を検索
                </span>

                <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-950 bg-[#f8fcff] px-4">
                  <span className="text-xl">🔎</span>

                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="例：因数分解、平方根、分配法則"
                    className="min-w-0 flex-1 bg-transparent py-3 font-bold outline-none placeholder:text-slate-400"
                  />

                  {searchText && (
                    <button
                      type="button"
                      onClick={() => setSearchText("")}
                      className="font-black text-slate-500"
                      aria-label="検索を消去"
                    >
                      ×
                    </button>
                  )}
                </div>
              </label>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 rounded-full border-2 border-slate-950 px-4 py-2 text-sm font-black transition ${
                      selectedCategory === category
                        ? "bg-slate-950 text-white"
                        : "bg-white hover:bg-sky-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {filteredFormulas.map((item) => {
                const isFavorite = favorites.includes(item.id);
                const isLearned = learnedItems.includes(item.id);

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[26px] border-2 border-slate-950 bg-white shadow-[5px_5px_0_#0f172a]"
                  >
                    <div className="flex items-start justify-between gap-3 border-b-2 border-slate-950 bg-sky-100 p-4">
                      <div>
                        <span className="inline-flex rounded-full border-2 border-slate-950 bg-white px-3 py-1 text-xs font-black">
                          {item.category}
                        </span>

                        <h3 className="mt-3 text-xl font-black">
                          {item.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(item.id)}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 text-xl transition hover:-translate-y-0.5 ${
                          isFavorite ? "bg-yellow-200" : "bg-white"
                        }`}
                        aria-label={
                          isFavorite
                            ? "お気に入りから外す"
                            : "お気に入りに追加"
                        }
                      >
                        {isFavorite ? "★" : "☆"}
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="overflow-x-auto rounded-2xl border-2 border-slate-950 bg-slate-950 px-4 py-4 text-center text-lg font-black text-white">
                        {item.formula}
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-black tracking-[0.14em] text-sky-600">
                          解説
                        </p>

                        <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                          {item.explanation}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl border-2 border-slate-950 bg-[#f4fbff] p-4">
                        <p className="text-xs font-black text-sky-700">
                          例
                        </p>

                        <p className="mt-1 font-black">
                          {item.example}
                        </p>
                      </div>

                      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-yellow-50 p-4">
                        <span className="text-xl">💡</span>

                        <div>
                          <p className="text-xs font-black text-amber-700">
                            覚え方
                          </p>

                          <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                            {item.tip}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleLearned(item.id)}
                        className={`mt-4 w-full rounded-2xl border-2 border-slate-950 px-4 py-3 font-black transition ${
                          isLearned
                            ? "bg-emerald-200 shadow-none"
                            : "bg-white shadow-[3px_3px_0_#0f172a] hover:-translate-y-0.5 hover:bg-emerald-50"
                        }`}
                      >
                        {isLearned
                          ? "✓ 覚えた"
                          : "覚えたらチェック"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredFormulas.length === 0 && (
              <div className="mt-5 rounded-[26px] border-2 border-dashed border-slate-400 bg-white p-10 text-center">
                <p className="text-4xl">🔎</p>
                <h3 className="mt-3 text-xl font-black">
                  公式が見つかりません
                </h3>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  検索する言葉やカテゴリーを変えてみてください。
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === "calculator" && (
          <section className="mt-8">
            <div className="mx-auto max-w-xl rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[7px_7px_0_#0f172a] sm:p-7">
              <div>
                <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                  CALCULATOR
                </p>

                <h2 className="text-2xl font-black">
                  数と式電卓
                </h2>

                <p className="mt-2 text-sm font-bold text-slate-600">
                  四則計算・平方根・2乗・円周率に対応しています。
                </p>
              </div>

              <div className="mt-6 min-h-32 rounded-[24px] border-2 border-slate-950 bg-slate-950 p-5 text-right text-white">
                <p className="min-h-7 break-all text-sm font-bold text-slate-400">
                  {expression || "式を入力してください"}
                </p>

                <p className="mt-3 min-h-12 break-all text-3xl font-black">
                  {result || "0"}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                {calculatorButtons.map((button) => {
                  const isEquals = button === "=";
                  const isClear = button === "C";
                  const isWide = button === "=";

                  return (
                    <button
                      key={button}
                      type="button"
                      onClick={() => handleCalculatorButton(button)}
                      className={`min-h-14 rounded-2xl border-2 border-slate-950 text-lg font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
                        isEquals
                          ? "col-span-2 bg-sky-300"
                          : isClear
                            ? "bg-rose-200"
                            : ["÷", "×", "−", "＋", "√", "²", "π"].includes(
                                  button,
                                )
                              ? "bg-sky-100"
                              : "bg-white"
                      } ${isWide ? "col-span-2" : ""}`}
                    >
                      {button}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border-2 border-slate-950 bg-yellow-50 p-4">
                <p className="font-black">使い方の例</p>
                <div className="mt-2 space-y-1 text-sm font-bold text-slate-700">
                  <p>・平方根：√(12)</p>
                  <p>・2乗：(3＋4)²</p>
                  <p>・円周：2×π×5</p>
                </div>
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
                    数と式ノート
                  </h2>

                  <p className="mt-2 text-sm font-bold text-slate-600">
                    間違えた計算や覚えたい公式を自由に記録できます。
                  </p>
                </div>

                <div className="min-h-6 text-sm font-black text-emerald-600">
                  {saveMessage && `✓ ${saveMessage}`}
                </div>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={`例：
・マイナスのかっこを外すときは符号を全部変える
・(a-b)² の最後は +b²
・√12 = 2√3`}
                className="mt-6 min-h-[430px] w-full resize-y rounded-[24px] border-2 border-slate-950 bg-[#fbfdff] p-5 text-base font-bold leading-8 outline-none transition focus:bg-sky-50"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-500">
                  入力した内容は、この端末に自動保存されます。
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const shouldDelete = window.confirm(
                      "数と式ノートをすべて消しますか？",
                    );

                    if (shouldDelete) {
                      setNote("");
                      localStorage.removeItem("study-os-number-note");
                    }
                  }}
                  className="rounded-xl border-2 border-slate-950 bg-rose-100 px-4 py-2 text-sm font-black transition hover:bg-rose-200"
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
            数と式は、途中式を省略しすぎないことが大事。
          </h2>

          <p className="mt-2 text-sm font-bold leading-6 text-slate-300">
            符号・分配法則・同類項を意識して、一行ずつ整理すると計算ミスをかなり減らせます。
          </p>
        </section>
      </div>
    </main>
  );
}