"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StudyRecord = {
  subject?: string;
  minutes?: number;
  date?: string;
};

type SubjectItem = {
  name: string;
  subtitle: string;
  icon: string;
  href?: string;
  status?: "available" | "coming-soon";
  accent: string;
  softAccent: string;
};

const subjects: SubjectItem[] = [
  {
    name: "英語",
    subtitle: "単語・熟語・英文法",
    icon: "A",
    href: "/english",
    status: "available",
    accent: "bg-sky-500",
    softAccent: "bg-sky-50 text-sky-600",
  },
  {
    name: "数学",
    subtitle: "数と式・関数・図形",
    icon: "∑",
    href: "/math",
    status: "available",
    accent: "bg-indigo-500",
    softAccent: "bg-indigo-50 text-indigo-600",
  },
  {
    name: "国語",
    subtitle: "現代文・古文・漢文",
    icon: "文",
    href: "/japanese",
    status: "available",
    accent: "bg-rose-500",
    softAccent: "bg-rose-50 text-rose-600",
  },
  {
    name: "理科",
    subtitle: "生物・化学・物理・地学",
    icon: "理",
    status: "coming-soon",
    accent: "bg-emerald-500",
    softAccent: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "社会",
    subtitle: "地理・歴史・公民",
    icon: "社",
    status: "coming-soon",
    accent: "bg-amber-500",
    softAccent: "bg-amber-50 text-amber-600",
  },
];

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

function formatStudyTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}分`;
  }

  if (minutes === 0) {
    return `${hours}時間`;
  }

  return `${hours}時間${minutes}分`;
}

function getTodayText(): string {
  const now = new Date();

  return `${now.getMonth() + 1}月${now.getDate()}日（${
    weekdays[now.getDay()]
  }）`;
}

function isToday(dateText?: string): boolean {
  if (!dateText) {
    return false;
  }

  const recordDate = new Date(dateText);
  const today = new Date();

  return (
    recordDate.getFullYear() === today.getFullYear() &&
    recordDate.getMonth() === today.getMonth() &&
    recordDate.getDate() === today.getDate()
  );
}

function isWithinThisWeek(dateText?: string): boolean {
  if (!dateText) {
    return false;
  }

  const recordDate = new Date(dateText);
  const today = new Date();

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - today.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return recordDate >= start && recordDate < end;
}

function loadStudyRecords(): StudyRecord[] {
  const possibleKeys = [
    "studyRecords",
    "pomodoroRecords",
    "study-records",
    "studyHistory",
  ];

  for (const key of possibleKeys) {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      continue;
    }

    try {
      const parsedValue: unknown = JSON.parse(storedValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue as StudyRecord[];
      }
    } catch {
      continue;
    }
  }

  return [];
}

export default function HomePage() {
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setStudyRecords(loadStudyRecords());
    setIsLoaded(true);
  }, []);

  const todayMinutes = useMemo(() => {
    return studyRecords
      .filter((record) => isToday(record.date))
      .reduce((total, record) => total + (record.minutes ?? 0), 0);
  }, [studyRecords]);

  const weekMinutes = useMemo(() => {
    return studyRecords
      .filter((record) => isWithinThisWeek(record.date))
      .reduce((total, record) => total + (record.minutes ?? 0), 0);
  }, [studyRecords]);

  const todaySessions = useMemo(() => {
    return studyRecords.filter((record) => isToday(record.date)).length;
  }, [studyRecords]);

  const recentSubjects = useMemo(() => {
    const subjectNames = studyRecords
      .filter((record) => isToday(record.date))
      .map((record) => record.subject)
      .filter((subject): subject is string => Boolean(subject));

    return [...new Set(subjectNames)];
  }, [studyRecords]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eaf8ff_0%,#f7fbff_42%,#ffffff_100%)] pb-28 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-lg font-black text-white shadow-lg shadow-sky-200">
                S
              </div>

              <div>
                <p className="text-xl font-black tracking-tight">
                  Study OS
                </p>
                <p className="text-xs font-bold text-slate-400">
                  学習を、もっとスマートに。
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-full border border-white bg-white/80 px-4 py-2 text-xs font-bold text-slate-500 shadow-sm backdrop-blur">
            {getTodayText()}
          </div>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[34px] bg-slate-950 px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-16 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-sky-300">
                TODAY&apos;S STUDY
              </p>

              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                今日も少しずつ、
                <br />
                前に進もう。
              </h1>

              <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-300">
                勉強時間を記録して、教科ごとの学習を続けよう。
                完璧より、昨日より一歩進むことが大事。
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/pomodoro"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-400 px-5 py-3 text-sm font-black text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-sky-300"
                >
                  <span>▶</span>
                  勉強を始める
                </Link>

                <a
                  href="#subjects"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition duration-300 hover:bg-white/15"
                >
                  教科を選ぶ
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <HeroStat
                label="今日"
                value={
                  isLoaded ? formatStudyTime(todayMinutes) : "読込中"
                }
              />

              <HeroStat
                label="今週"
                value={
                  isLoaded ? formatStudyTime(weekMinutes) : "読込中"
                }
              />

              <HeroStat
                label="回数"
                value={isLoaded ? `${todaySessions}回` : "読込中"}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.15em] text-sky-500">
                  DAILY PROGRESS
                </p>
                <h2 className="mt-1 text-xl font-black">
                  今日の学習状況
                </h2>
              </div>

              <span className="rounded-full bg-sky-50 px-3 py-2 text-xs font-black text-sky-600">
                {todaySessions > 0 ? "学習中" : "未開始"}
              </span>
            </div>

            <div className="mt-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-400">
                    今日の勉強時間
                  </p>
                  <p className="mt-1 text-3xl font-black">
                    {isLoaded
                      ? formatStudyTime(todayMinutes)
                      : "読込中"}
                  </p>
                </div>

                <p className="text-sm font-bold text-slate-400">
                  目標 120分
                </p>
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      (todayMinutes / 120) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs font-bold text-slate-400">
                {todayMinutes >= 120
                  ? "今日の目標達成！よくやった。"
                  : `目標まであと${Math.max(
                      120 - todayMinutes,
                      0,
                    )}分`}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {recentSubjects.length > 0 ? (
                recentSubjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"
                  >
                    {subject}
                  </span>
                ))
              ) : (
                <span className="text-sm font-medium text-slate-400">
                  今日はまだ学習記録がありません。
                </span>
              )}
            </div>
          </div>

          <Link
            href="/pomodoro"
            className="group relative overflow-hidden rounded-[30px] bg-sky-500 p-6 text-white shadow-lg shadow-sky-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15" />

            <div className="relative z-10 flex h-full min-h-48 flex-col justify-between">
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl">
                  ⏱
                </span>

                <p className="mt-5 text-xs font-black tracking-[0.15em] text-sky-100">
                  FOCUS MODE
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  ポモドーロ
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-sky-50">
                  集中時間を測って、勉強記録を残す。
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-black">
                  タイマーを開く
                </span>

                <span className="text-xl transition duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        </section>

        <section id="subjects" className="mt-9">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.15em] text-sky-500">
                SUBJECTS
              </p>

              <h2 className="mt-1 text-2xl font-black">
                教科を選ぶ
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-500">
                勉強したい教科をタップ。
              </p>
            </div>

            <span className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 sm:block">
              3教科利用可能
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {subjects.map((subject) => (
              <SubjectCard key={subject.name} subject={subject} />
            ))}
          </div>
        </section>

        <section className="mt-9">
          <div>
            <p className="text-xs font-black tracking-[0.15em] text-sky-500">
              QUICK ACCESS
            </p>
            <h2 className="mt-1 text-2xl font-black">
              すぐに開く
            </h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink
              href="/english/vocabulary"
              icon="Aa"
              title="英単語"
              subtitle="単語を覚える"
            />

            <QuickLink
              href="/english/grammar"
              icon="文"
              title="英文法"
              subtitle="文法を確認する"
            />

            <QuickLink
              href="/math/geometry"
              icon="△"
              title="図形"
              subtitle="公式と図を確認"
            />

            <QuickLink
              href="/japanese/classical"
              icon="古"
              title="古文"
              subtitle="古文を学ぶ"
            />
          </div>
        </section>

        <section className="mt-9 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.15em] text-sky-500">
                STUDY TIP
              </p>

              <h2 className="mt-2 text-xl font-black">
                迷ったら、25分だけ始める。
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                やる気が出るまで待つより、短い時間で始める方が動きやすい。
                まずはポモドーロを1回だけ。
              </p>
            </div>

            <Link
              href="/pomodoro"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              25分始める
            </Link>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-[26px] border border-white/70 bg-white/90 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1">
          <BottomNavItem
            href="/"
            icon="⌂"
            label="ホーム"
            active
          />

          <BottomNavItem
            href="/english"
            icon="A"
            label="英語"
          />

          <BottomNavItem
            href="/math"
            icon="∑"
            label="数学"
          />

          <BottomNavItem
            href="/pomodoro"
            icon="◷"
            label="集中"
          />
        </div>
      </nav>
    </main>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-24 rounded-2xl border border-white/10 bg-white/10 px-3 py-4 text-center backdrop-blur">
      <p className="text-[11px] font-bold text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white sm:text-base">
        {value}
      </p>
    </div>
  );
}

function SubjectCard({
  subject,
}: {
  subject: SubjectItem;
}) {
  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black ${subject.softAccent}`}
        >
          {subject.icon}
        </span>

        {subject.status === "coming-soon" ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-400">
            準備中
          </span>
        ) : (
          <span className="text-lg text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-slate-500">
            →
          </span>
        )}
      </div>

      <h3 className="mt-5 text-xl font-black">{subject.name}</h3>

      <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
        {subject.subtitle}
      </p>

      <div
        className={`mt-5 h-1.5 w-10 rounded-full ${subject.accent}`}
      />
    </>
  );

  if (!subject.href || subject.status === "coming-soon") {
    return (
      <div className="rounded-[26px] border border-slate-200 bg-white p-4 opacity-65 shadow-sm sm:p-5">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={subject.href}
      className="group rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl sm:p-5"
    >
      {cardContent}
    </Link>
  );
}

function QuickLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sm font-black text-sky-600">
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-black">{title}</p>
        <p className="mt-1 truncate text-xs font-medium text-slate-400">
          {subtitle}
        </p>
      </div>

      <span className="text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-sky-500">
        →
      </span>
    </Link>
  );
}

function BottomNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2.5 transition ${
        active
          ? "bg-sky-500 text-white shadow-md shadow-sky-200"
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      <span className="text-lg font-black">{icon}</span>
      <span className="mt-1 text-[10px] font-black">{label}</span>
    </Link>
  );
}