"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  deleteIdiom,
  getIdiomFolders,
  getIdiomsByFolder,
  updateIdiom,
} from "../../storage";

import type {
  Idiom,
  IdiomFolder,
} from "../../types";

type SortType =
  | "new"
  | "az"
  | "weak"
  | "due";

export default function IdiomFolderPage() {
  const params = useParams<{
    folderId: string;
  }>();

  const folderId = params.folderId;

  const [folder, setFolder] =
    useState<IdiomFolder | null>(null);

  const [idioms, setIdioms] =
    useState<Idiom[]>([]);

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState<SortType>("new");

  function refresh() {
    const folders = getIdiomFolders();

    if (folderId === "all") {
      setFolder({
        id: "all",
        name: "すべての熟語",
        description:
          "登録した熟語をまとめて表示",
        icon: "📖",
        color: "#7C3AED",

        pinned: false,
        archived: false,
        sortOrder: 0,

        createdAt: 0,
        updatedAt: 0,
      });
    } else {
      const foundFolder =
        folders.find(
          (item) =>
            item.id === folderId,
        ) ?? null;

      setFolder(foundFolder);
    }

    setIdioms(
      getIdiomsByFolder(folderId),
    );
  }

  useEffect(() => {
    refresh();

    window.addEventListener(
      "study-os-idioms-updated",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "study-os-idioms-updated",
        refresh,
      );
    };
  }, [folderId]);

  const visibleIdioms = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const filtered =
      idioms.filter((idiom) => {
        if (!normalizedSearch) {
          return true;
        }

        const phraseMatched =
          idiom.phrase
            .toLowerCase()
            .includes(
              normalizedSearch,
            );

        const meaningMatched =
          idiom.meanings.some(
            (meaning) =>
              meaning.meaning
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              meaning.example
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              meaning.note
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ),
          );

        const tagMatched =
          idiom.tags.some((tag) =>
            tag
              .toLowerCase()
              .includes(
                normalizedSearch,
              ),
          );

        const familyMatched =
          idiom.family
            .toLowerCase()
            .includes(
              normalizedSearch,
            );

        const breakdownMatched =
          idiom.breakdown
            .toLowerCase()
            .includes(
              normalizedSearch,
            );

        return (
          phraseMatched ||
          meaningMatched ||
          tagMatched ||
          familyMatched ||
          breakdownMatched
        );
      });

    return [...filtered].sort(
      (a, b) => {
        if (sort === "az") {
          return a.phrase.localeCompare(
            b.phrase,
          );
        }

        if (sort === "weak") {
          const aWeakness =
            a.meanings.reduce(
              (
                total,
                meaning,
              ) =>
                total +
                meaning.mistakeCount -
                meaning.correctCount,
              0,
            );

          const bWeakness =
            b.meanings.reduce(
              (
                total,
                meaning,
              ) =>
                total +
                meaning.mistakeCount -
                meaning.correctCount,
              0,
            );

          return (
            bWeakness - aWeakness
          );
        }

        if (sort === "due") {
          const aDue =
            a.meanings.length > 0
              ? Math.min(
                  ...a.meanings.map(
                    (meaning) =>
                      meaning.dueAt,
                  ),
                )
              : Number.MAX_SAFE_INTEGER;

          const bDue =
            b.meanings.length > 0
              ? Math.min(
                  ...b.meanings.map(
                    (meaning) =>
                      meaning.dueAt,
                  ),
                )
              : Number.MAX_SAFE_INTEGER;

          return aDue - bDue;
        }

        return (
          b.createdAt - a.createdAt
        );
      },
    );
  }, [idioms, search, sort]);

  if (!folder) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-5xl">
            📁
          </p>

          <h1 className="mt-4 text-xl font-black">
            フォルダが見つかりません
          </h1>

          <Link
            href="/english/idioms"
            className="mt-6 inline-block rounded-2xl bg-violet-600 px-5 py-3 font-black text-white"
          >
            熟語帳へ戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3efff_0%,#faf8ff_42%,#ffffff_100%)] px-4 pb-36 pt-6 text-slate-900">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/english/idioms"
          className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm"
        >
          ← 熟語帳
        </Link>

        <section className="mt-4 rounded-[32px] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center gap-4">
            <div
              className="grid h-16 w-16 place-items-center rounded-2xl text-3xl"
              style={{
                backgroundColor:
                  `${folder.color}25`,
              }}
            >
              {folder.icon}
            </div>

            <div>
              <p className="text-xs font-black tracking-[0.15em] text-violet-300">
                FOLDER
              </p>

              <h1 className="mt-1 text-2xl font-black">
                {folder.name}
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                {idioms.length}個
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-300">
            {folder.description ||
              "このフォルダの熟語を学習します。"}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Link
              href={`/english/idioms/quiz?folders=${folderId}`}
              className="rounded-2xl bg-violet-600 px-3 py-4 text-center text-sm font-black"
            >
              📝 クイズ
            </Link>

            <Link
              href={`/english/idioms/listen?folders=${folderId}`}
              className="rounded-2xl bg-sky-500 px-3 py-4 text-center text-sm font-black"
            >
              🎧 流し聞き
            </Link>

            <Link
              href="/english/idioms/review"
              className="rounded-2xl bg-emerald-500 px-3 py-4 text-center text-sm font-black"
            >
              🔁 復習
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="熟語・意味・例文・タグを検索"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-400"
            />

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target
                    .value as SortType,
                )
              }
              className="rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black"
            >
              <option value="new">
                新しい順
              </option>

              <option value="az">
                A-Z
              </option>

              <option value="weak">
                苦手順
              </option>

              <option value="due">
                復習順
              </option>
            </select>
          </div>
        </section>

        <section className="mt-4 space-y-4">
          {visibleIdioms.map(
            (idiom) => (
              <article
                key={idiom.id}
                className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-black">
                      {idiom.phrase}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {idiom.family && (
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                          {idiom.family} family
                        </span>
                      )}

                      {idiom.tags.map(
                        (tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"
                          >
                            #{tag}
                          </span>
                        ),
                      )}
                    </div>

                    {idiom.breakdown && (
                      <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        🧩{" "}
                        {idiom.breakdown}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      updateIdiom(
                        idiom.id,
                        {
                          favorite:
                            !idiom.favorite,
                        },
                      )
                    }
                    className="text-2xl"
                  >
                    {idiom.favorite
                      ? "⭐"
                      : "☆"}
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {idiom.meanings.map(
                    (
                      meaning,
                      meaningIndex,
                    ) => {
                      const accuracy =
                        meaning.reviewCount >
                        0
                          ? Math.round(
                              (meaning.correctCount /
                                meaning.reviewCount) *
                                100,
                            )
                          : 0;

                      return (
                        <section
                          key={meaning.id}
                          className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-600 text-xs font-black text-white">
                              {meaningIndex +
                                1}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="font-black text-violet-800">
                                {
                                  meaning.meaning
                                }
                              </p>

                              {meaning.example && (
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  {
                                    meaning.example
                                  }
                                </p>
                              )}

                              {meaning.note && (
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  💡{" "}
                                  {
                                    meaning.note
                                  }
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
                                <span>
                                  復習{" "}
                                  {
                                    meaning.reviewCount
                                  }
                                  回
                                </span>

                                <span>
                                  正解{" "}
                                  {
                                    meaning.correctCount
                                  }
                                </span>

                                <span>
                                  ミス{" "}
                                  {
                                    meaning.mistakeCount
                                  }
                                </span>

                                <span>
                                  正答率{" "}
                                  {
                                    accuracy
                                  }
                                  %
                                </span>
                              </div>

                              <p className="mt-2 text-[11px] text-slate-400">
                                次回復習：
                                {new Date(
                                  meaning.dueAt,
                                ).toLocaleString(
                                  "ja-JP",
                                )}
                              </p>
                            </div>
                          </div>
                        </section>
                      );
                    },
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold text-slate-400">
                    意味{" "}
                    {idiom.meanings.length}
                    個
                  </p>

                  <button
                    onClick={() => {
                      const accepted =
                        window.confirm(
                          `「${idiom.phrase}」を削除しますか？`,
                        );

                      if (accepted) {
                        deleteIdiom(
                          idiom.id,
                        );
                      }
                    }}
                    className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600"
                  >
                    削除
                  </button>
                </div>
              </article>
            ),
          )}

          {visibleIdioms.length ===
            0 && (
            <div className="rounded-[26px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-4xl">
                📭
              </p>

              <h2 className="mt-3 font-black">
                熟語がありません
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                熟語を追加するか、検索条件を変えてみてください。
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}