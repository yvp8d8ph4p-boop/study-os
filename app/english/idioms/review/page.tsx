"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  addIdiomStudySeconds,
  getDueIdiomMeanings,
  reviewIdiomMeaning,
} from "../storage";

import type {
  Idiom,
  IdiomMeaning,
  ReviewGrade,
} from "../types";

type ReviewItem = {
  idiom: Idiom;
  meaning: IdiomMeaning;
};

type GradeButton = {
  grade: ReviewGrade;
  label: string;
  description: string;
  nextReview: string;
  className: string;
};

const gradeButtons: GradeButton[] = [
  {
    grade: "again",
    label: "もう一度",
    description: "まだ覚えていない",
    nextReview: "約10分後",
    className:
      "bg-rose-500 shadow-rose-200 hover:bg-rose-600",
  },
  {
    grade: "hard",
    label: "難しい",
    description: "少し迷った",
    nextReview: "短めに復習",
    className:
      "bg-amber-500 shadow-amber-200 hover:bg-amber-600",
  },
  {
    grade: "good",
    label: "覚えた",
    description: "普通に答えられた",
    nextReview: "通常の間隔",
    className:
      "bg-violet-600 shadow-violet-200 hover:bg-violet-700",
  },
  {
    grade: "easy",
    label: "余裕",
    description: "すぐ答えられた",
    nextReview: "長めに復習",
    className:
      "bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600",
  },
];

export default function IdiomReviewPage() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  const [goodCount, setGoodCount] = useState(0);
  const [easyCount, setEasyCount] = useState(0);

  useEffect(() => {
    setQueue(getDueIdiomMeanings());

    const startedAt = Date.now();

    return () => {
      const seconds = Math.max(
        1,
        Math.round((Date.now() - startedAt) / 1000),
      );

      addIdiomStudySeconds(seconds);
    };
  }, []);

  const current = queue[currentIndex];

  const progress = useMemo(() => {
    if (queue.length === 0) {
      return 100;
    }

    return Math.round(
      (currentIndex / queue.length) * 100,
    );
  }, [currentIndex, queue.length]);

  const finished =
    queue.length === 0 ||
    currentIndex >= queue.length;

  function handleGrade(grade: ReviewGrade) {
    if (!current) {
      return;
    }

    reviewIdiomMeaning(
      current.idiom.id,
      current.meaning.id,
      grade,
    );

    setReviewedCount((count) => count + 1);

    if (grade === "again") {
      setAgainCount((count) => count + 1);
    }

    if (grade === "hard") {
      setHardCount((count) => count + 1);
    }

    if (grade === "good") {
      setGoodCount((count) => count + 1);
    }

    if (grade === "easy") {
      setEasyCount((count) => count + 1);
    }

    setCurrentIndex((index) => index + 1);
    setShowAnswer(false);
  }

  function speakPhrase() {
    if (!current) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        current.idiom.phrase,
      );

    utterance.lang = "en-US";
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
  }

  if (finished) {
    return (
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#f3efff_0%,#faf8ff_50%,#ffffff_100%)] px-4 py-8 text-slate-900">
        <section className="w-full max-w-md rounded-[34px] border border-slate-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[30px] bg-violet-100 text-5xl">
            {reviewedCount > 0 ? "🏆" : "✨"}
          </div>

          <p className="mt-6 text-xs font-black tracking-[0.18em] text-violet-500">
            REVIEW COMPLETE
          </p>

          <h1 className="mt-2 text-2xl font-black">
            {reviewedCount > 0
              ? "今日の復習完了！"
              : "復習はありません"}
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            {reviewedCount > 0
              ? `${reviewedCount}個の意味を復習しました。次回の復習日は自動で設定されています。`
              : "期限が来ている熟語の意味はありません。"}
          </p>

          {reviewedCount > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <ResultCard
                label="もう一度"
                value={againCount}
                emoji="😭"
              />

              <ResultCard
                label="難しい"
                value={hardCount}
                emoji="😅"
              />

              <ResultCard
                label="覚えた"
                value={goodCount}
                emoji="😊"
              />

              <ResultCard
                label="余裕"
                value={easyCount}
                emoji="😎"
              />
            </div>
          )}

          <div className="mt-7 space-y-3">
            <Link
              href="/english/idioms"
              className="block w-full rounded-2xl bg-violet-600 py-4 font-black text-white shadow-lg shadow-violet-200"
            >
              熟語帳へ戻る
            </Link>

            <Link
              href="/english"
              className="block w-full rounded-2xl bg-slate-100 py-4 font-black text-slate-700"
            >
              英語ホームへ
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3efff_0%,#faf8ff_45%,#ffffff_100%)] px-4 pb-20 pt-6 text-slate-900">
      <div className="mx-auto w-full max-w-xl">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/english/idioms"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black shadow-sm"
          >
            ← 終了
          </Link>

          <div className="text-right">
            <p className="text-xs font-bold text-slate-400">
              REVIEW
            </p>

            <p className="text-sm font-black text-violet-700">
              {currentIndex + 1} / {queue.length}
            </p>
          </div>
        </header>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-violet-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <section className="relative mt-6 overflow-hidden rounded-[36px] bg-slate-950 p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.25)] sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-sky-400/15 blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-black tracking-[0.18em] text-violet-300">
                SPACED REVIEW
              </p>

              <button
                onClick={speakPhrase}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl transition active:scale-95"
              >
                🔊
              </button>
            </div>

            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-slate-500">
                熟語
              </p>

              <h1 className="mt-4 break-words text-4xl font-black leading-tight sm:text-5xl">
                {current.idiom.phrase}
              </h1>

              {current.idiom.family && (
                <span className="mt-4 rounded-full bg-violet-400/15 px-4 py-2 text-xs font-bold text-violet-300">
                  {current.idiom.family} family
                </span>
              )}

              {current.meaning.example && (
                <div className="mt-7 w-full rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-bold text-slate-500">
                    例文
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {current.meaning.example}
                  </p>
                </div>
              )}

              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="mt-8 rounded-full bg-white px-7 py-4 font-black text-slate-950 shadow-xl transition active:scale-95"
                >
                  意味を見る
                </button>
              ) : (
                <div className="mt-7 w-full rounded-[26px] bg-violet-500/15 p-6">
                  <p className="text-xs font-bold text-violet-300">
                    意味
                  </p>

                  <p className="mt-3 text-2xl font-black text-violet-200">
                    {current.meaning.meaning}
                  </p>

                  {current.meaning.note && (
                    <p className="mt-4 text-sm leading-7 text-slate-400">
                      💡 {current.meaning.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {showAnswer && (
          <section className="mt-5 grid grid-cols-2 gap-3">
            {gradeButtons.map((button) => (
              <button
                key={button.grade}
                onClick={() =>
                  handleGrade(button.grade)
                }
                className={`rounded-[24px] p-4 text-left text-white shadow-lg transition active:scale-[0.97] ${button.className}`}
              >
                <p className="text-lg font-black">
                  {button.label}
                </p>

                <p className="mt-1 text-xs font-bold text-white/80">
                  {button.description}
                </p>

                <p className="mt-3 text-[11px] font-bold text-white/70">
                  次回：{button.nextReview}
                </p>
              </button>
            ))}
          </section>
        )}

        <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black tracking-[0.15em] text-violet-500">
            STATUS
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatusCard
              label="復習回数"
              value={`${current.meaning.reviewCount}回`}
            />

            <StatusCard
              label="正解"
              value={`${current.meaning.correctCount}`}
            />

            <StatusCard
              label="ミス"
              value={`${current.meaning.mistakeCount}`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function ResultCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: number;
  emoji: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-2xl">{emoji}</p>

      <p className="mt-2 text-xs font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-[10px] font-bold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  );
}