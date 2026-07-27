"use client";

import { useMemo, useState } from "react";

type SectionId = "summary" | "calculator" | "probability";

type FrequencyRow = {
  value: number;
  count: number;
};

const exampleData = "12, 15, 10, 18, 15, 20, 12, 15";

function parseNumbers(input: string): number[] {
  return input
    .split(/[\s,、]+/)
    .map((value) => value.trim())
    .filter((value) => value !== "")
    .map(Number)
    .filter((value) => Number.isFinite(value));
}

function roundNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Math.round(value * 100) / 100);
}

function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) {
    return null;
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function calculateModes(numbers: number[]): number[] {
  if (numbers.length === 0) {
    return [];
  }

  const counts = new Map<number, number>();

  numbers.forEach((number) => {
    counts.set(number, (counts.get(number) ?? 0) + 1);
  });

  const maximumCount = Math.max(...counts.values());

  if (maximumCount === 1) {
    return [];
  }

  return [...counts.entries()]
    .filter(([, count]) => count === maximumCount)
    .map(([value]) => value)
    .sort((a, b) => a - b);
}

function createFrequencyTable(numbers: number[]): FrequencyRow[] {
  const counts = new Map<number, number>();

  numbers.forEach((number) => {
    counts.set(number, (counts.get(number) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      count,
    }))
    .sort((a, b) => a.value - b.value);
}

export default function MathStatisticsPage() {
  const [activeSection, setActiveSection] =
    useState<SectionId>("summary");

  const [dataInput, setDataInput] = useState(exampleData);

  const numbers = useMemo(() => parseNumbers(dataInput), [dataInput]);

  const statistics = useMemo(() => {
    if (numbers.length === 0) {
      return {
        total: 0,
        count: 0,
        mean: null as number | null,
        median: null as number | null,
        modes: [] as number[],
        minimum: null as number | null,
        maximum: null as number | null,
        range: null as number | null,
        sorted: [] as number[],
        frequency: [] as FrequencyRow[],
      };
    }

    const total = numbers.reduce((sum, number) => sum + number, 0);
    const minimum = Math.min(...numbers);
    const maximum = Math.max(...numbers);

    return {
      total,
      count: numbers.length,
      mean: total / numbers.length,
      median: calculateMedian(numbers),
      modes: calculateModes(numbers),
      minimum,
      maximum,
      range: maximum - minimum,
      sorted: [...numbers].sort((a, b) => a - b),
      frequency: createFrequencyTable(numbers),
    };
  }, [numbers]);

  const maximumFrequency = useMemo(() => {
    if (statistics.frequency.length === 0) {
      return 1;
    }

    return Math.max(
      ...statistics.frequency.map((row) => row.count),
    );
  }, [statistics.frequency]);

  const tabs: {
    id: SectionId;
    label: string;
    description: string;
  }[] = [
    {
      id: "summary",
      label: "要点まとめ",
      description: "資料の整理で使う言葉と公式",
    },
    {
      id: "calculator",
      label: "データ分析",
      description: "入力したデータを自動計算",
    },
    {
      id: "probability",
      label: "確率",
      description: "確率の基本と考え方",
    },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#effaff_0%,#f8fbff_45%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        <header className="overflow-hidden rounded-[32px] border border-sky-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(14,165,233,0.10)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <a
                href="/math"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-sky-300 hover:text-sky-600"
              >
                <span aria-hidden="true">←</span>
                数学ホーム
              </a>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-sky-500 text-3xl shadow-lg shadow-sky-200">
                  📊
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.18em] text-sky-500">
                    DATA &amp; PROBABILITY
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                    確率・資料の活用
                  </h1>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500 sm:text-base">
                    平均値・中央値・最頻値・度数分布・確率をまとめて確認
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-3xl bg-slate-50 p-3 sm:gap-3">
              <StatMiniCard label="データ数" value={statistics.count} />
              <StatMiniCard
                label="平均値"
                value={
                  statistics.mean === null
                    ? "—"
                    : roundNumber(statistics.mean)
                }
              />
              <StatMiniCard
                label="範囲"
                value={
                  statistics.range === null
                    ? "—"
                    : roundNumber(statistics.range)
                }
              />
            </div>
          </div>
        </header>

        <nav className="mt-6 grid gap-3 md:grid-cols-3">
          {tabs.map((tab) => {
            const isActive = activeSection === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`rounded-3xl border p-4 text-left transition ${
                  isActive
                    ? "border-sky-400 bg-sky-500 text-white shadow-lg shadow-sky-200"
                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-sky-300"
                }`}
              >
                <p className="font-black">{tab.label}</p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    isActive ? "text-sky-100" : "text-slate-400"
                  }`}
                >
                  {tab.description}
                </p>
              </button>
            );
          })}
        </nav>

        {activeSection === "summary" && <SummarySection />}

        {activeSection === "calculator" && (
          <CalculatorSection
            dataInput={dataInput}
            setDataInput={setDataInput}
            numbers={numbers}
            statistics={statistics}
            maximumFrequency={maximumFrequency}
          />
        )}

        {activeSection === "probability" && <ProbabilitySection />}
      </div>
    </main>
  );
}

function StatMiniCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-20 rounded-2xl bg-white px-3 py-4 text-center shadow-sm">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function SummarySection() {
  const items = [
    {
      title: "平均値",
      icon: "➗",
      formula: "合計 ÷ データの個数",
      description:
        "すべてのデータを足して、データの個数で割った値。",
      example: "4、6、8 の平均値は (4＋6＋8)÷3＝6",
    },
    {
      title: "中央値",
      icon: "↔️",
      formula: "小さい順に並べた中央の値",
      description:
        "データを小さい順に並べ、真ん中にある値を調べる。",
      example:
        "個数が偶数なら、中央にある2つの値の平均を求める。",
    },
    {
      title: "最頻値",
      icon: "🔥",
      formula: "最も多く現れる値",
      description:
        "データの中で、出てくる回数が最も多い値。",
      example: "2、3、3、5 の最頻値は3",
    },
    {
      title: "範囲",
      icon: "📏",
      formula: "最大値 − 最小値",
      description:
        "データがどのくらい広がっているかを表す値。",
      example: "最大値20、最小値8なら、範囲は12",
    },
    {
      title: "度数",
      icon: "📚",
      formula: "その値や階級に入るデータの個数",
      description:
        "ある値が何回出てきたか、または階級に何個入るか。",
      example: "10点台の人が5人なら、その階級の度数は5",
    },
    {
      title: "相対度数",
      icon: "📈",
      formula: "度数 ÷ 全体の度数",
      description:
        "全体の中で、その階級が占める割合を表す。",
      example: "全体20人中5人なら、相対度数は0.25",
    },
  ];

  return (
    <section className="mt-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black text-sky-500">
              QUICK GUIDE
            </p>
            <h2 className="mt-1 text-2xl font-black">
              資料の整理・重要用語
            </h2>
          </div>

          <span className="hidden rounded-full bg-sky-50 px-4 py-2 text-xs font-bold text-sky-600 sm:block">
            中学数学
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 transition hover:-translate-y-1 hover:border-sky-200 hover:bg-white hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  {item.icon}
                </span>
                <h3 className="text-lg font-black">{item.title}</h3>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-black text-white">
                {item.formula}
              </div>

              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                {item.description}
              </p>

              <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-xs font-bold leading-5 text-slate-500">
                例：{item.example}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[32px] bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-black text-sky-300">
          MEDIAN CHECK
        </p>

        <h2 className="mt-2 text-2xl font-black">
          中央値を求めるときの順番
        </h2>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <StepCard
            number="1"
            title="データを並べる"
            text="必ず小さい順に並べ直す。"
          />
          <StepCard
            number="2"
            title="個数を確認"
            text="奇数個か偶数個かを確認する。"
          />
          <StepCard
            number="3"
            title="中央を求める"
            text="偶数個なら中央2つの平均を出す。"
          />
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl bg-white/10 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-400 font-black text-slate-950">
        {number}
      </div>

      <h3 className="mt-4 font-black">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
        {text}
      </p>
    </div>
  );
}

function CalculatorSection({
  dataInput,
  setDataInput,
  numbers,
  statistics,
  maximumFrequency,
}: {
  dataInput: string;
  setDataInput: (value: string) => void;
  numbers: number[];
  statistics: {
    total: number;
    count: number;
    mean: number | null;
    median: number | null;
    modes: number[];
    minimum: number | null;
    maximum: number | null;
    range: number | null;
    sorted: number[];
    frequency: FrequencyRow[];
  };
  maximumFrequency: number;
}) {
  const resultCards = [
    {
      label: "合計",
      value: statistics.count
        ? roundNumber(statistics.total)
        : "—",
      icon: "＋",
    },
    {
      label: "平均値",
      value:
        statistics.mean === null
          ? "—"
          : roundNumber(statistics.mean),
      icon: "÷",
    },
    {
      label: "中央値",
      value:
        statistics.median === null
          ? "—"
          : roundNumber(statistics.median),
      icon: "↔",
    },
    {
      label: "最頻値",
      value:
        statistics.modes.length === 0
          ? "なし"
          : statistics.modes.map(roundNumber).join("・"),
      icon: "★",
    },
    {
      label: "最小値",
      value:
        statistics.minimum === null
          ? "—"
          : roundNumber(statistics.minimum),
      icon: "↓",
    },
    {
      label: "最大値",
      value:
        statistics.maximum === null
          ? "—"
          : roundNumber(statistics.maximum),
      icon: "↑",
    },
    {
      label: "範囲",
      value:
        statistics.range === null
          ? "—"
          : roundNumber(statistics.range),
      icon: "↔",
    },
    {
      label: "データ数",
      value: statistics.count,
      icon: "#",
    },
  ];

  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-sm font-black text-sky-500">
            DATA INPUT
          </p>

          <h2 className="mt-1 text-2xl font-black">
            データを入力
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            数字を「,」「、」または空白で区切って入力してください。
          </p>

          <textarea
            value={dataInput}
            onChange={(event) => setDataInput(event.target.value)}
            className="mt-5 min-h-36 w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 p-5 text-lg font-bold leading-8 outline-none transition placeholder:text-slate-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="例：10, 12, 15, 15, 18"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDataInput(exampleData)}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-600"
            >
              例題を入力
            </button>

            <button
              type="button"
              onClick={() => setDataInput("")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              全部消す
            </button>
          </div>

          {dataInput.trim() !== "" && numbers.length === 0 && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              数字を入力してください。
            </p>
          )}
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">計算結果</h2>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {resultCards.map((card) => (
              <div
                key={card.label}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm font-black text-sky-500 shadow-sm">
                  {card.icon}
                </span>

                <p className="mt-4 text-xs font-bold text-slate-400">
                  {card.label}
                </p>

                <p className="mt-1 break-words text-xl font-black text-slate-900">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-3xl bg-slate-900 p-5 text-white">
            <p className="text-xs font-bold text-slate-400">
              小さい順
            </p>

            <p className="mt-2 break-words text-base font-black leading-8">
              {statistics.sorted.length === 0
                ? "データを入力してください"
                : statistics.sorted.map(roundNumber).join("、")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">度数分布</h2>

          <p className="mt-2 text-sm font-medium text-slate-500">
            同じ値が何回現れたかを表しています。
          </p>

          <div className="mt-6 space-y-4">
            {statistics.frequency.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 px-5 py-12 text-center text-sm font-bold text-slate-400">
                データを入力するとグラフが表示されます。
              </div>
            ) : (
              statistics.frequency.map((row) => {
                const width =
                  (row.count / maximumFrequency) * 100;

                return (
                  <div key={row.value}>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>{roundNumber(row.value)}</span>
                      <span className="text-slate-400">
                        {row.count}回
                      </span>
                    </div>

                    <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{
                          width: `${Math.max(width, 7)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-black">度数表</h2>
          </div>

          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50 text-xs font-black text-slate-500">
                <tr>
                  <th className="px-6 py-4">値</th>
                  <th className="px-6 py-4">度数</th>
                  <th className="px-6 py-4">相対度数</th>
                </tr>
              </thead>

              <tbody>
                {statistics.frequency.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-sm font-bold text-slate-400"
                    >
                      データなし
                    </td>
                  </tr>
                ) : (
                  statistics.frequency.map((row) => (
                    <tr
                      key={row.value}
                      className="border-t border-slate-100 text-sm font-bold"
                    >
                      <td className="px-6 py-4">
                        {roundNumber(row.value)}
                      </td>
                      <td className="px-6 py-4">
                        {row.count}
                      </td>
                      <td className="px-6 py-4 text-sky-600">
                        {roundNumber(
                          row.count / statistics.count,
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProbabilitySection() {
  const probabilityCards = [
    {
      title: "確率の基本",
      formula: "起こる場合の数 ÷ 全体の場合の数",
      description:
        "どの場合も同じ程度に起こると考えられるときに使う。",
      example:
        "さいころで偶数が出る確率は 3÷6＝1/2",
    },
    {
      title: "確率の範囲",
      formula: "0 ≦ 確率 ≦ 1",
      description:
        "絶対に起こらない確率は0、必ず起こる確率は1。",
      example:
        "普通のさいころで7が出る確率は0",
    },
    {
      title: "起こらない確率",
      formula: "1 − 起こる確率",
      description:
        "あることが起こらない確率は、1から起こる確率を引く。",
      example:
        "雨の確率が0.3なら、雨が降らない確率は0.7",
    },
  ];

  return (
    <section className="mt-6 space-y-5">
      <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-black text-sky-500">
          PROBABILITY
        </p>

        <h2 className="mt-1 text-2xl font-black">
          確率の基本
        </h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {probabilityCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
            >
              <h3 className="text-lg font-black">{card.title}</h3>

              <div className="mt-4 rounded-2xl bg-sky-500 px-4 py-4 text-center font-black text-white">
                {card.formula}
              </div>

              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                {card.description}
              </p>

              <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-xs font-bold leading-5 text-slate-500">
                例：{card.example}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[32px] bg-sky-500 p-6 text-white sm:p-8">
          <p className="text-sm font-black text-sky-100">
            HOW TO SOLVE
          </p>

          <h2 className="mt-2 text-2xl font-black">
            確率を求める手順
          </h2>

          <ol className="mt-6 space-y-4">
            <ProbabilityStep
              number="1"
              text="起こりうるすべての場合を書き出す。"
            />
            <ProbabilityStep
              number="2"
              text="求めたい出来事が何通りあるか数える。"
            />
            <ProbabilityStep
              number="3"
              text="求めたい場合の数を、全体の場合の数で割る。"
            />
          </ol>
        </div>

        <div className="rounded-[32px] border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <p className="text-sm font-black text-amber-600">
            IMPORTANT
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900">
            「同様に確からしい」を確認
          </h2>

          <p className="mt-5 text-sm font-medium leading-7 text-slate-600">
            それぞれの場合が、同じくらい起こりやすいと考えられることを
            「同様に確からしい」といいます。
          </p>

          <div className="mt-5 rounded-3xl bg-white p-5">
            <p className="font-black text-slate-900">
              例：公平なさいころ
            </p>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              1から6までの目は、どれも同じ確率で出るため、
              6通りは同様に確からしいと考えられます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProbabilityStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <li className="flex items-center gap-4 rounded-3xl bg-white/15 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-black text-sky-600">
        {number}
      </span>

      <p className="text-sm font-bold leading-6">{text}</p>
    </li>
  );
}