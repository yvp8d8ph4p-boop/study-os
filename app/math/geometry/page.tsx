"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import FormulaList from "@/components/geometry/FormulaList";
import GeometryCanvas from "@/components/geometry/GeometryCanvas";
import GeometryGuide from "@/components/geometry/GeometryGuide";

type GeometryTab =
  | "plane"
  | "solid"
  | "formulas"
  | "canvas"
  | "favorites"
  | "notes";

type SaveState = "idle" | "saving" | "saved";

type TabItem = {
  id: GeometryTab;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
};

const STORAGE_KEYS = {
  favorites: "study-os-geometry-favorites",
  learned: "study-os-geometry-learned",
  note: "study-os-geometry-main-note",
  selectedTab: "study-os-geometry-selected-tab",
};

const tabs: TabItem[] = [
  {
    id: "plane",
    label: "平面図形",
    shortLabel: "平面",
    icon: "📘",
    description: "三角形・四角形・円・合同・相似など",
  },
  {
    id: "solid",
    label: "空間図形",
    shortLabel: "空間",
    icon: "🧊",
    description: "柱体・錐体・球・展開図・投影図など",
  },
  {
    id: "formulas",
    label: "公式・定理",
    shortLabel: "公式",
    icon: "📋",
    description: "面積・体積・図形の重要定理を整理",
  },
  {
    id: "canvas",
    label: "図形ノート",
    shortLabel: "図形",
    icon: "✏️",
    description: "図形や補助線を描いて保存",
  },
  {
    id: "favorites",
    label: "お気に入り",
    shortLabel: "保存",
    icon: "⭐",
    description: "保存した解説や公式をまとめて確認",
  },
  {
    id: "notes",
    label: "通常ノート",
    shortLabel: "ノート",
    icon: "📝",
    description: "考え方や間違えた原因を自由に記録",
  },
];

function readStoredArray(key: string): string[] {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (item): item is string => typeof item === "string",
    );
  } catch {
    return [];
  }
}

function isGeometryTab(value: string | null): value is GeometryTab {
  return tabs.some((tab) => tab.id === value);
}

export default function GeometryPage() {
  const [activeTab, setActiveTab] = useState<GeometryTab>("plane");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [learned, setLearned] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  const noteSaveTimerRef = useRef<number | null>(null);
  const savedMessageTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const storedFavorites = readStoredArray(STORAGE_KEYS.favorites);
    const storedLearned = readStoredArray(STORAGE_KEYS.learned);
    const storedNote = localStorage.getItem(STORAGE_KEYS.note) ?? "";
    const storedTab = localStorage.getItem(STORAGE_KEYS.selectedTab);

    setFavorites(storedFavorites);
    setLearned(storedLearned);
    setNote(storedNote);

    if (isGeometryTab(storedTab)) {
      setActiveTab(storedTab);
    }

    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEYS.favorites,
      JSON.stringify(favorites),
    );
  }, [favorites, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.learned, JSON.stringify(learned));
  }, [learned, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.selectedTab, activeTab);
  }, [activeTab, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    setSaveState("saving");

    if (noteSaveTimerRef.current !== null) {
      window.clearTimeout(noteSaveTimerRef.current);
    }

    if (savedMessageTimerRef.current !== null) {
      window.clearTimeout(savedMessageTimerRef.current);
    }

    noteSaveTimerRef.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.note, note);
      setSaveState("saved");

      savedMessageTimerRef.current = window.setTimeout(() => {
        setSaveState("idle");
      }, 1600);
    }, 500);

    return () => {
      if (noteSaveTimerRef.current !== null) {
        window.clearTimeout(noteSaveTimerRef.current);
      }
    };
  }, [note, hasLoadedStorage]);

  useEffect(() => {
    return () => {
      if (noteSaveTimerRef.current !== null) {
        window.clearTimeout(noteSaveTimerRef.current);
      }

      if (savedMessageTimerRef.current !== null) {
        window.clearTimeout(savedMessageTimerRef.current);
      }
    };
  }, []);

  const activeTabInformation = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab],
  );

  const noteCharacterCount = useMemo(() => note.length, [note]);

  const noteLineCount = useMemo(() => {
    if (!note) {
      return 0;
    }

    return note.split("\n").length;
  }, [note]);

  function changeTab(tab: GeometryTab) {
    setActiveTab(tab);

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  function toggleFavorite(id: string) {
    setFavorites((currentFavorites) => {
      if (currentFavorites.includes(id)) {
        return currentFavorites.filter((itemId) => itemId !== id);
      }

      return [...currentFavorites, id];
    });
  }

  function toggleLearned(id: string) {
    setLearned((currentLearned) => {
      if (currentLearned.includes(id)) {
        return currentLearned.filter((itemId) => itemId !== id);
      }

      return [...currentLearned, id];
    });
  }

  function clearNote() {
    if (!note.trim()) {
      return;
    }

    const shouldClear = window.confirm(
      "通常ノートの内容をすべて消しますか？",
    );

    if (!shouldClear) {
      return;
    }

    setNote("");
    localStorage.removeItem(STORAGE_KEYS.note);
    setSaveState("saved");

    if (savedMessageTimerRef.current !== null) {
      window.clearTimeout(savedMessageTimerRef.current);
    }

    savedMessageTimerRef.current = window.setTimeout(() => {
      setSaveState("idle");
    }, 1600);
  }

  function clearStudyRecords() {
    if (favorites.length === 0 && learned.length === 0) {
      return;
    }

    const shouldClear = window.confirm(
      "お気に入りと学習チェックをすべてリセットしますか？",
    );

    if (!shouldClear) {
      return;
    }

    setFavorites([]);
    setLearned([]);

    localStorage.removeItem(STORAGE_KEYS.favorites);
    localStorage.removeItem(STORAGE_KEYS.learned);
  }

  return (
    <main className="min-h-screen bg-[#f3faff] px-4 pb-32 pt-5 text-slate-950 sm:px-6 sm:pt-7">
      <div className="mx-auto w-full max-w-7xl">
        <header className="relative overflow-hidden rounded-[32px] border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#0f172a] sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-sky-200/80" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-cyan-100/90" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-36 w-36 rotate-12 rounded-[36px] bg-blue-100/80" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/math"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-sky-100 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-sky-200"
                >
                  <span aria-hidden="true">←</span>
                  数学へ
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black transition hover:bg-slate-100"
                >
                  <span aria-hidden="true">🏠</span>
                  ホーム
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="rounded-full border-2 border-slate-950 bg-yellow-100 px-4 py-2 text-xs font-black sm:text-sm">
                  ⭐ {favorites.length}
                </div>

                <div className="rounded-full border-2 border-slate-950 bg-emerald-100 px-4 py-2 text-xs font-black sm:text-sm">
                  ✓ {learned.length}
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-start gap-4 sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border-2 border-slate-950 bg-sky-300 text-3xl shadow-[4px_4px_0_#0f172a] sm:h-20 sm:w-20 sm:text-4xl">
                📐
              </div>

              <div>
                <p className="text-xs font-black tracking-[0.2em] text-sky-700 sm:text-sm">
                  MATHEMATICS
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-5xl">
                  図形
                </h1>

                <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-600 sm:text-base sm:leading-7">
                  平面図形・空間図形・公式・作図をひとつに整理。
                  図を動かしたり、補助線を描いたりしながら理解できます。
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <StatusCard
                icon="📚"
                label="収録内容"
                value="中学図形"
                subText="基本から定理まで"
              />

              <StatusCard
                icon="⭐"
                label="お気に入り"
                value={`${favorites.length}件`}
                subText="あとで見返す項目"
              />

              <StatusCard
                icon="✅"
                label="学習チェック"
                value={`${learned.length}件`}
                subText="確認済みの項目"
              />
            </div>
          </div>
        </header>

        <nav
          aria-label="図形ページのメニュー"
          className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-6"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeTab(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={`group rounded-[22px] border-2 border-slate-950 p-3 text-center transition sm:p-4 ${
                  isActive
                    ? "-translate-y-1 bg-sky-300 shadow-[5px_5px_0_#0f172a]"
                    : "bg-white shadow-[3px_3px_0_#0f172a] hover:-translate-y-1 hover:bg-sky-50"
                }`}
              >
                <span className="block text-2xl transition group-hover:scale-110 sm:text-3xl">
                  {tab.icon}
                </span>

                <span className="mt-2 block text-xs font-black sm:hidden">
                  {tab.shortLabel}
                </span>

                <span className="mt-2 hidden text-sm font-black sm:block">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        <section className="mt-7 rounded-[24px] border-2 border-slate-950 bg-white p-4 shadow-[4px_4px_0_#0f172a] sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-100 text-xl">
              {activeTabInformation.icon}
            </div>

            <div>
              <p className="text-xs font-black tracking-[0.16em] text-sky-700">
                CURRENT SECTION
              </p>

              <h2 className="text-xl font-black">
                {activeTabInformation.label}
              </h2>

              <p className="mt-1 text-sm font-bold text-slate-600">
                {activeTabInformation.description}
              </p>
            </div>
          </div>
        </section>

        {activeTab === "plane" && (
          <section className="mt-7">
            <GeometryGuide
              section="plane"
              favorites={favorites}
              learned={learned}
              onToggleFavorite={toggleFavorite}
              onToggleLearned={toggleLearned}
            />
          </section>
        )}

        {activeTab === "solid" && (
          <section className="mt-7">
            <GeometryGuide
              section="solid"
              favorites={favorites}
              learned={learned}
              onToggleFavorite={toggleFavorite}
              onToggleLearned={toggleLearned}
            />
          </section>
        )}

        {activeTab === "formulas" && (
          <section className="mt-7">
            <FormulaList
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </section>
        )}

        {activeTab === "canvas" && (
          <section className="mt-7">
            <GeometryCanvas />
          </section>
        )}

        {activeTab === "favorites" && (
          <section className="mt-7 space-y-7">
            {favorites.length === 0 ? (
              <EmptyFavorites onGoToPlane={() => changeTab("plane")} />
            ) : (
              <>
                <GeometryGuide
                  section="all"
                  favorites={favorites}
                  learned={learned}
                  onToggleFavorite={toggleFavorite}
                  onToggleLearned={toggleLearned}
                  onlyFavorites
                />

                <FormulaList
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onlyFavorites
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearStudyRecords}
                    className="rounded-2xl border-2 border-slate-950 bg-rose-100 px-4 py-3 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-rose-200"
                  >
                    お気に入り・チェックをリセット
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === "notes" && (
          <section className="mt-7">
            <div className="rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#0f172a] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-sky-700 sm:text-sm">
                    GEOMETRY NOTEBOOK
                  </p>

                  <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                    図形ノート
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-600">
                    証明の流れ、補助線を引く理由、間違えた問題の注意点などを自由に残せます。
                  </p>
                </div>

                <SaveIndicator state={saveState} />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_250px]">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={`例：

【円周角】
・同じ弧に対する円周角は等しい
・中心角は円周角の2倍

【証明問題】
仮定と結論を最初に整理する。
合同条件を書く前に、等しい辺や角をすべて探す。

【今回のミス】
直角三角形なのに三平方の定理を使うことに気づかなかった。`}
                  className="min-h-[520px] w-full resize-y rounded-[24px] border-2 border-slate-950 bg-[#fbfdff] p-5 text-sm font-bold leading-8 outline-none transition placeholder:text-slate-400 focus:bg-sky-50 sm:text-base"
                />

                <aside className="space-y-4">
                  <div className="rounded-[22px] border-2 border-slate-950 bg-sky-50 p-4">
                    <p className="text-xs font-black tracking-[0.14em] text-sky-700">
                      NOTE INFO
                    </p>

                    <div className="mt-4 space-y-3">
                      <NoteInformationRow
                        label="文字数"
                        value={`${noteCharacterCount}文字`}
                      />

                      <NoteInformationRow
                        label="行数"
                        value={`${noteLineCount}行`}
                      />

                      <NoteInformationRow
                        label="保存"
                        value="自動保存"
                      />
                    </div>
                  </div>

                  <div className="rounded-[22px] border-2 border-slate-950 bg-yellow-50 p-4">
                    <p className="font-black text-amber-800">
                      💡 書いておくと便利
                    </p>

                    <div className="mt-3 space-y-2 text-sm font-bold leading-6 text-slate-700">
                      <p>・使った定理</p>
                      <p>・補助線を引く理由</p>
                      <p>・合同や相似の対応順</p>
                      <p>・間違えた原因</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearNote}
                    disabled={!note.trim()}
                    className="w-full rounded-2xl border-2 border-slate-950 bg-rose-100 px-4 py-3 font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-rose-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                  >
                    ノートをすべて消去
                  </button>
                </aside>
              </div>

              <p className="mt-4 text-xs font-bold text-slate-500">
                入力した内容は、このブラウザの端末内に自動保存されます。
              </p>
            </div>
          </section>
        )}

        <section className="mt-8 overflow-hidden rounded-[28px] border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[6px_6px_0_#7dd3fc]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-sky-300 text-2xl text-slate-950">
              💡
            </div>

            <div>
              <p className="text-xs font-black tracking-[0.18em] text-sky-300">
                STUDY POINT
              </p>

              <h2 className="mt-2 text-xl font-black sm:text-2xl">
                図形問題は、分かっている情報を図へ書き込む。
              </h2>

              <p className="mt-2 max-w-4xl text-sm font-bold leading-7 text-slate-300">
                等しい辺、等しい角、平行、垂直、比などを図に書き込むと、
                使える定理や合同条件が見つけやすくなります。
                頭の中だけで処理せず、図を情報で埋めていくのがコツです。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type StatusCardProps = {
  icon: string;
  label: string;
  value: string;
  subText: string;
};

function StatusCard({
  icon,
  label,
  value,
  subText,
}: StatusCardProps) {
  return (
    <div className="rounded-[22px] border-2 border-slate-950 bg-[#f8fcff] p-4 shadow-[3px_3px_0_#0f172a]">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>

        <div>
          <p className="text-xs font-black text-slate-500">{label}</p>
          <p className="text-lg font-black">{value}</p>
        </div>
      </div>

      <p className="mt-2 text-xs font-bold text-slate-500">{subText}</p>
    </div>
  );
}

type SaveIndicatorProps = {
  state: SaveState;
};

function SaveIndicator({ state }: SaveIndicatorProps) {
  if (state === "saving") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-yellow-100 px-4 py-2 text-sm font-black">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
        保存中
      </div>
    );
  }

  if (state === "saved") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-emerald-100 px-4 py-2 text-sm font-black">
        <span aria-hidden="true">✓</span>
        保存しました
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-sky-50 px-4 py-2 text-sm font-black">
      <span aria-hidden="true">💾</span>
      自動保存
    </div>
  );
}

type NoteInformationRowProps = {
  label: string;
  value: string;
};

function NoteInformationRow({
  label,
  value,
}: NoteInformationRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-300 pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-sm font-black">{value}</span>
    </div>
  );
}

type EmptyFavoritesProps = {
  onGoToPlane: () => void;
};

function EmptyFavorites({ onGoToPlane }: EmptyFavoritesProps) {
  return (
    <div className="rounded-[30px] border-2 border-dashed border-slate-400 bg-white p-8 text-center shadow-[5px_5px_0_#cbd5e1] sm:p-12">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border-2 border-slate-950 bg-yellow-100 text-4xl">
        ⭐
      </div>

      <h2 className="mt-5 text-2xl font-black">
        お気に入りはまだありません
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-6 text-slate-600">
        平面図形・空間図形・公式のカードにある星を押すと、
        後でここからまとめて見返せます。
      </p>

      <button
        type="button"
        onClick={onGoToPlane}
        className="mt-6 rounded-2xl border-2 border-slate-950 bg-sky-300 px-6 py-3 font-black shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-1"
      >
        平面図形を見に行く
      </button>
    </div>
  );
}