"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type TimerMode = "focus" | "break";

type SubjectName = "英語" | "数学" | "国語" | "理科" | "社会" | "その他";

type StudyRecord = {
  id: string;
  subject: string;
  minutes: number;
  date: string;
  startedAt?: string;
  completedAt?: string;
  setNumber?: number;
  totalSets?: number;
  completed?: boolean;
};

type TimerPreset = {
  label: string;
  focusMinutes: number;
  breakMinutes: number;
};

const STORAGE_KEY = "studyRecords";
const DAILY_GOAL_MINUTES = 240;

const subjects: SubjectName[] = [
  "英語",
  "数学",
  "国語",
  "理科",
  "社会",
  "その他",
];

const timerPresets: TimerPreset[] = [
  {
    label: "25 / 5",
    focusMinutes: 25,
    breakMinutes: 5,
  },
  {
    label: "50 / 10",
    focusMinutes: 50,
    breakMinutes: 10,
  },
];

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function formatTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${padNumber(minutes)}:${padNumber(seconds)}`;
}

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

function formatCompactStudyTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${minutes}m`;
}

function getDateKey(date: Date): string {
  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join("-");
}

function parseRecordDate(dateText?: string): Date | null {
  if (!dateText) {
    return null;
  }

  const dateOnlyMatch = dateText.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );
  }

  const parsed = new Date(dateText);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function getTodayText(): string {
  const now = new Date();

  return `${now.getMonth() + 1}月${now.getDate()}日（${
    weekdays[now.getDay()]
  }）`;
}

function getLongDateText(dateKey: string): string {
  const date = parseRecordDate(dateKey);

  if (!date) {
    return dateKey;
  }

  return `${date.getFullYear()}年${
    date.getMonth() + 1
  }月${date.getDate()}日（${weekdays[date.getDay()]}）`;
}

function loadStudyRecords(): StudyRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const possibleKeys = [
    STORAGE_KEY,
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
        return (parsedValue as unknown[])
          .map((record) => {
            if (
              typeof record !== "object" ||
              record === null
            ) {
              return null;
            }

            const rawRecord = record as Partial<StudyRecord>;

            return {
              id: rawRecord.id ?? createId(),
              subject: rawRecord.subject ?? "その他",
              minutes:
                typeof rawRecord.minutes === "number"
                  ? rawRecord.minutes
                  : 0,
              date:
                rawRecord.date ??
                rawRecord.completedAt ??
                new Date().toISOString(),
              startedAt: rawRecord.startedAt,
              completedAt: rawRecord.completedAt,
              setNumber: rawRecord.setNumber,
              totalSets: rawRecord.totalSets,
              completed: rawRecord.completed ?? true,
            } satisfies StudyRecord;
          })
          .filter(Boolean) as StudyRecord[];
      }
    } catch {
      continue;
    }
  }

  return [];
}

function saveStudyRecords(records: StudyRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function isSameDate(dateText: string | undefined, target: Date): boolean {
  const recordDate = parseRecordDate(dateText);

  if (!recordDate) {
    return false;
  }

  return (
    recordDate.getFullYear() === target.getFullYear() &&
    recordDate.getMonth() === target.getMonth() &&
    recordDate.getDate() === target.getDate()
  );
}

function playCompletionSound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      660,
      context.currentTime,
    );
    oscillator.frequency.setValueAtTime(
      880,
      context.currentTime + 0.14,
    );

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.18,
      context.currentTime + 0.02,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.42,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.45);

    oscillator.addEventListener("ended", () => {
      void context.close();
    });
  } catch {
    // 音を再生できない環境では何もしない
  }
}

function getCalendarColor(minutes: number): string {
  if (minutes === 0) {
    return "border-slate-200 bg-slate-50 text-slate-400";
  }

  if (minutes < 120) {
    return "border-sky-100 bg-sky-50 text-sky-700";
  }

  if (minutes < 240) {
    return "border-sky-200 bg-sky-100 text-sky-800";
  }

  if (minutes < 360) {
    return "border-sky-300 bg-sky-300 text-sky-950";
  }

  if (minutes < 480) {
    return "border-sky-500 bg-sky-500 text-white";
  }

  return "border-slate-950 bg-slate-950 text-white";
}

export default function PomodoroPage() {
  const [studyRecords, setStudyRecords] = useState<
    StudyRecord[]
  >([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [mode, setMode] = useState<TimerMode>("focus");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [customFocusMinutes, setCustomFocusMinutes] =
    useState(25);
  const [customBreakMinutes, setCustomBreakMinutes] =
    useState(5);
  const [selectedPreset, setSelectedPreset] = useState<
    "25 / 5" | "50 / 10" | "custom"
  >("25 / 5");

  const [totalSets, setTotalSets] = useState(4);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);
  const [subject, setSubject] =
    useState<SubjectName>("数学");

  const [secondsLeft, setSecondsLeft] = useState(
    25 * 60,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [waitingForNext, setWaitingForNext] =
    useState(false);

  const [sessionStartedAt, setSessionStartedAt] =
    useState<string | null>(null);
  const [completionMessage, setCompletionMessage] =
    useState<string | null>(null);

  const [calendarMonth, setCalendarMonth] = useState(
    () => {
      const today = new Date();

      return new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
    },
  );

  const [selectedDateKey, setSelectedDateKey] =
    useState(getDateKey(new Date()));

  const targetEndTimeRef = useRef<number | null>(null);
  const finishingRef = useRef(false);

  useEffect(() => {
    setStudyRecords(loadStudyRecords());
    setIsLoaded(true);
  }, []);

  const updateRecords = useCallback(
    (
      updater:
        | StudyRecord[]
        | ((current: StudyRecord[]) => StudyRecord[]),
    ) => {
      setStudyRecords((current) => {
        const nextRecords =
          typeof updater === "function"
            ? updater(current)
            : updater;

        saveStudyRecords(nextRecords);

        return nextRecords;
      });
    },
    [],
  );

  const todayMinutes = useMemo(() => {
    const today = new Date();

    return studyRecords
      .filter((record) => isSameDate(record.date, today))
      .reduce(
        (total, record) => total + record.minutes,
        0,
      );
  }, [studyRecords]);

  const todaySessions = useMemo(() => {
    const today = new Date();

    return studyRecords.filter((record) =>
      isSameDate(record.date, today),
    ).length;
  }, [studyRecords]);

  const dailyProgress = Math.min(
    (todayMinutes / DAILY_GOAL_MINUTES) * 100,
    100,
  );

  const totalModeSeconds =
    (mode === "focus" ? focusMinutes : breakMinutes) *
    60;

  const timerProgress =
    totalModeSeconds > 0
      ? Math.min(
          Math.max(
            ((totalModeSeconds - secondsLeft) /
              totalModeSeconds) *
              100,
            0,
          ),
          100,
        )
      : 0;

  const saveCompletedFocusSet = useCallback(() => {
    const completedAt = new Date();
    const newRecord: StudyRecord = {
      id: createId(),
      subject,
      minutes: focusMinutes,
      date: getDateKey(completedAt),
      startedAt:
        sessionStartedAt ??
        new Date(
          completedAt.getTime() - focusMinutes * 60_000,
        ).toISOString(),
      completedAt: completedAt.toISOString(),
      setNumber: currentSet,
      totalSets,
      completed: true,
    };

    updateRecords((current) => [
      ...current,
      newRecord,
    ]);
  }, [
    currentSet,
    focusMinutes,
    sessionStartedAt,
    subject,
    totalSets,
    updateRecords,
  ]);

  const moveToMode = useCallback(
    (
      nextMode: TimerMode,
      nextSet: number = currentSet,
      shouldRun: boolean,
    ) => {
      const nextSeconds =
        (nextMode === "focus"
          ? focusMinutes
          : breakMinutes) * 60;

      setMode(nextMode);
      setCurrentSet(nextSet);
      setSecondsLeft(nextSeconds);
      setIsRunning(shouldRun);
      setWaitingForNext(!shouldRun);
      setSessionStartedAt(
        nextMode === "focus" && shouldRun
          ? new Date().toISOString()
          : null,
      );

      targetEndTimeRef.current = shouldRun
        ? Date.now() + nextSeconds * 1000
        : null;
    },
    [breakMinutes, currentSet, focusMinutes],
  );

  const finishCurrentMode = useCallback(() => {
    if (finishingRef.current) {
      return;
    }

    finishingRef.current = true;
    setIsRunning(false);
    targetEndTimeRef.current = null;

    if (soundEnabled) {
      playCompletionSound();
    }

    if (mode === "focus") {
      saveCompletedFocusSet();

      const nextCompletedSets = completedSets + 1;

      setCompletedSets(nextCompletedSets);

      if (nextCompletedSets >= totalSets) {
        setSecondsLeft(0);
        setCompletionMessage(
          `${totalSets}セット完了！今日は${formatStudyTime(
            todayMinutes + focusMinutes,
          )}勉強した。`,
        );
        setWaitingForNext(false);
        setSessionStartedAt(null);
      } else {
        setCompletionMessage(
          `セット${currentSet}完了！休憩に入ろう。`,
        );

        moveToMode(
          "break",
          currentSet,
          autoSwitch,
        );
      }
    } else {
      const nextSet = Math.min(currentSet + 1, totalSets);

      setCompletionMessage(
        `休憩終了。セット${nextSet}を始めよう。`,
      );

      moveToMode(
        "focus",
        nextSet,
        autoSwitch,
      );
    }

    window.setTimeout(() => {
      finishingRef.current = false;
    }, 150);
  }, [
    autoSwitch,
    completedSets,
    currentSet,
    focusMinutes,
    mode,
    moveToMode,
    saveCompletedFocusSet,
    soundEnabled,
    todayMinutes,
    totalSets,
  ]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const updateTimer = () => {
      if (targetEndTimeRef.current === null) {
        return;
      }

      const remainingMilliseconds =
        targetEndTimeRef.current - Date.now();

      if (remainingMilliseconds <= 0) {
        setSecondsLeft(0);
        finishCurrentMode();
        return;
      }

      setSecondsLeft(
        Math.ceil(remainingMilliseconds / 1000),
      );
    };

    updateTimer();

    const intervalId = window.setInterval(
      updateTimer,
      250,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [finishCurrentMode, isRunning]);

  useEffect(() => {
    document.title = `${formatTimer(secondsLeft)} ${
      mode === "focus" ? "集中" : "休憩"
    } | Study OS`;
  }, [mode, secondsLeft]);

  const startTimer = () => {
    if (secondsLeft <= 0) {
      const resetSeconds =
        (mode === "focus"
          ? focusMinutes
          : breakMinutes) * 60;

      setSecondsLeft(resetSeconds);
      targetEndTimeRef.current =
        Date.now() + resetSeconds * 1000;
    } else {
      targetEndTimeRef.current =
        Date.now() + secondsLeft * 1000;
    }

    if (mode === "focus" && !sessionStartedAt) {
      setSessionStartedAt(new Date().toISOString());
    }

    setCompletionMessage(null);
    setWaitingForNext(false);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    if (targetEndTimeRef.current !== null) {
      const remainingMilliseconds =
        targetEndTimeRef.current - Date.now();

      setSecondsLeft(
        Math.max(
          Math.ceil(remainingMilliseconds / 1000),
          0,
        ),
      );
    }

    targetEndTimeRef.current = null;
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode("focus");
    setCurrentSet(1);
    setCompletedSets(0);
    setSecondsLeft(focusMinutes * 60);
    setSessionStartedAt(null);
    setCompletionMessage(null);
    setWaitingForNext(false);
    targetEndTimeRef.current = null;
  };

  const skipCurrentMode = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;

    if (mode === "break") {
      const nextSet = Math.min(currentSet + 1, totalSets);

      moveToMode("focus", nextSet, false);
      setCompletionMessage(null);
      return;
    }

    moveToMode("break", currentSet, false);
    setCompletionMessage(null);
  };

  const applyPreset = (preset: TimerPreset) => {
    if (isRunning) {
      return;
    }

    setSelectedPreset(
      preset.label as "25 / 5" | "50 / 10",
    );
    setFocusMinutes(preset.focusMinutes);
    setBreakMinutes(preset.breakMinutes);
    setMode("focus");
    setSecondsLeft(preset.focusMinutes * 60);
    setCurrentSet(1);
    setCompletedSets(0);
    setCompletionMessage(null);
    setWaitingForNext(false);
    setSessionStartedAt(null);
  };

  const applyCustomTime = () => {
    if (isRunning) {
      return;
    }

    const safeFocus = Math.min(
      Math.max(customFocusMinutes, 1),
      180,
    );
    const safeBreak = Math.min(
      Math.max(customBreakMinutes, 1),
      60,
    );

    setSelectedPreset("custom");
    setFocusMinutes(safeFocus);
    setBreakMinutes(safeBreak);
    setMode("focus");
    setSecondsLeft(safeFocus * 60);
    setCurrentSet(1);
    setCompletedSets(0);
    setCompletionMessage(null);
    setWaitingForNext(false);
    setSessionStartedAt(null);
  };

  const changeTotalSets = (amount: number) => {
    if (isRunning) {
      return;
    }

    setTotalSets((current) => {
      const next = Math.min(
        Math.max(current + amount, 1),
        12,
      );

      if (currentSet > next) {
        setCurrentSet(next);
      }

      setCompletedSets((currentCompleted) =>
        Math.min(currentCompleted, next),
      );

      return next;
    });
  };

  const recordsByDate = useMemo(() => {
    const grouped = new Map<string, StudyRecord[]>();

    for (const record of studyRecords) {
      const parsedDate = parseRecordDate(record.date);

      if (!parsedDate) {
        continue;
      }

      const dateKey = getDateKey(parsedDate);
      const current = grouped.get(dateKey) ?? [];

      current.push(record);
      grouped.set(dateKey, current);
    }

    return grouped;
  }, [studyRecords]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(
      year,
      month,
      1,
    ).getDay();
    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    const days: Array<{
      key: string;
      day: number | null;
      minutes: number;
    }> = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      days.push({
        key: `empty-start-${index}`,
        day: null,
        minutes: 0,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const dateKey = getDateKey(date);
      const minutes = (
        recordsByDate.get(dateKey) ?? []
      ).reduce(
        (total, record) => total + record.minutes,
        0,
      );

      days.push({
        key: dateKey,
        day,
        minutes,
      });
    }

    while (days.length % 7 !== 0) {
      days.push({
        key: `empty-end-${days.length}`,
        day: null,
        minutes: 0,
      });
    }

    return days;
  }, [calendarMonth, recordsByDate]);

  const monthRecords = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    return studyRecords.filter((record) => {
      const date = parseRecordDate(record.date);

      return (
        date !== null &&
        date.getFullYear() === year &&
        date.getMonth() === month
      );
    });
  }, [calendarMonth, studyRecords]);

  const monthMinutes = useMemo(() => {
    return monthRecords.reduce(
      (total, record) => total + record.minutes,
      0,
    );
  }, [monthRecords]);

  const monthStudyDays = useMemo(() => {
    return new Set(
      monthRecords
        .map((record) => parseRecordDate(record.date))
        .filter((date): date is Date => date !== null)
        .map((date) => getDateKey(date)),
    ).size;
  }, [monthRecords]);

  const monthDailyMaximum = useMemo(() => {
    const totals = new Map<string, number>();

    for (const record of monthRecords) {
      const date = parseRecordDate(record.date);

      if (!date) {
        continue;
      }

      const key = getDateKey(date);

      totals.set(
        key,
        (totals.get(key) ?? 0) + record.minutes,
      );
    }

    return Math.max(0, ...totals.values());
  }, [monthRecords]);

  const selectedDateRecords =
    recordsByDate.get(selectedDateKey) ?? [];

  const selectedDateMinutes = selectedDateRecords.reduce(
    (total, record) => total + record.minutes,
    0,
  );

  const selectedDateSubjects = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const record of selectedDateRecords) {
      grouped.set(
        record.subject,
        (grouped.get(record.subject) ?? 0) +
          record.minutes,
      );
    }

    return Array.from(grouped.entries())
      .map(([name, minutes]) => ({
        name,
        minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [selectedDateRecords]);

  const weekData = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - offset);

      const minutes = studyRecords
        .filter((record) =>
          isSameDate(record.date, date),
        )
        .reduce(
          (total, record) => total + record.minutes,
          0,
        );

      days.push({
        key: getDateKey(date),
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        weekday: weekdays[date.getDay()],
        minutes,
      });
    }

    return days;
  }, [studyRecords]);

  const weekMaximum = Math.max(
    DAILY_GOAL_MINUTES,
    ...weekData.map((day) => day.minutes),
  );

  const recentRecords = useMemo(() => {
    return [...studyRecords]
      .sort((a, b) => {
        const first =
          new Date(
            a.completedAt ?? a.date,
          ).getTime() || 0;
        const second =
          new Date(
            b.completedAt ?? b.date,
          ).getTime() || 0;

        return second - first;
      })
      .slice(0, 6);
  }, [studyRecords]);

  const estimatedMinutes =
    focusMinutes * totalSets +
    breakMinutes * Math.max(totalSets - 1, 0);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eaf8ff_0%,#f7fbff_42%,#ffffff_100%)] pb-28 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-lg font-black text-white shadow-lg shadow-sky-200">
              S
            </div>

            <div>
              <p className="text-xl font-black tracking-tight">
                Study OS
              </p>
              <p className="text-xs font-bold text-slate-400">
                集中モード
              </p>
            </div>
          </Link>

          <div className="rounded-full border border-white bg-white/80 px-4 py-2 text-xs font-bold text-slate-500 shadow-sm backdrop-blur">
            {getTodayText()}
          </div>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[34px] bg-slate-950 px-5 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-16 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black tracking-[0.18em] text-sky-300">
                  FOCUS MODE
                </p>

                <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                  {mode === "focus"
                    ? "集中する時間"
                    : "ちょっと休憩"}
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  {mode === "focus"
                    ? `${subject}・セット ${currentSet} / ${totalSets}`
                    : `休憩・次はセット ${
                        Math.min(currentSet + 1, totalSets)
                      }`}
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-xs font-black ${
                  mode === "focus"
                    ? "bg-sky-400 text-slate-950"
                    : "bg-emerald-300 text-emerald-950"
                }`}
              >
                {mode === "focus" ? "集中" : "休憩"}
              </span>
            </div>

            <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div className="flex justify-center">
                <div
                  className="relative flex h-64 w-64 items-center justify-center rounded-full p-[10px] sm:h-72 sm:w-72"
                  style={{
                    background: `conic-gradient(#38bdf8 ${timerProgress}%, rgba(255,255,255,0.12) ${timerProgress}%)`,
                  }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950 shadow-inner">
                    <p className="text-xs font-black tracking-[0.18em] text-slate-400">
                      {mode === "focus"
                        ? `SET ${currentSet} / ${totalSets}`
                        : "BREAK TIME"}
                    </p>

                    <p className="mt-3 text-6xl font-black tracking-tight sm:text-7xl">
                      {formatTimer(secondsLeft)}
                    </p>

                    <p className="mt-3 text-sm font-bold text-slate-400">
                      {isRunning
                        ? "計測中"
                        : waitingForNext
                          ? "次の開始を待っています"
                          : "準備完了"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <HeroStat
                    label="完了"
                    value={`${completedSets}セット`}
                  />
                  <HeroStat
                    label="今日"
                    value={
                      isLoaded
                        ? formatStudyTime(todayMinutes)
                        : "読込中"
                    }
                  />
                  <HeroStat
                    label="目標"
                    value="4時間"
                  />
                </div>

                <div className="mt-5">
                  {!isRunning ? (
                    <button
                      type="button"
                      onClick={startTimer}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-400 px-6 py-4 text-sm font-black text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-sky-300"
                    >
                      <span>▶</span>
                      {waitingForNext
                        ? "次を始める"
                        : secondsLeft < totalModeSeconds
                          ? "再開する"
                          : "スタート"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseTimer}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                      <span>Ⅱ</span>
                      一時停止
                    </button>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={resetTimer}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
                    >
                      リセット
                    </button>

                    <button
                      type="button"
                      onClick={skipCurrentMode}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
                    >
                      スキップ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {completionMessage && (
              <div className="mt-6 rounded-3xl border border-sky-300/20 bg-sky-400/10 px-5 py-4">
                <p className="font-black text-sky-200">
                  🎉 {completionMessage}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[0.15em] text-sky-500">
                  TIMER SETTINGS
                </p>
                <h2 className="mt-1 text-xl font-black">
                  集中プラン
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                約{formatStudyTime(estimatedMinutes)}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-black text-slate-700">
                時間
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {timerPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyPreset(preset)}
                    className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
                      selectedPreset === preset.label
                        ? "bg-sky-500 text-white shadow-md shadow-sky-100"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {preset.label}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() =>
                    setSelectedPreset("custom")
                  }
                  className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
                    selectedPreset === "custom"
                      ? "bg-sky-500 text-white shadow-md shadow-sky-100"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  自由
                </button>
              </div>

              {selectedPreset === "custom" && (
                <div className="mt-4 rounded-3xl bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-black text-slate-500">
                      集中時間
                      <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-3">
                        <input
                          type="number"
                          min={1}
                          max={180}
                          value={customFocusMinutes}
                          disabled={isRunning}
                          onChange={(event) =>
                            setCustomFocusMinutes(
                              Number(event.target.value),
                            )
                          }
                          className="min-w-0 flex-1 bg-transparent py-3 text-lg font-black outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">
                          分
                        </span>
                      </div>
                    </label>

                    <label className="text-xs font-black text-slate-500">
                      休憩時間
                      <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-3">
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={customBreakMinutes}
                          disabled={isRunning}
                          onChange={(event) =>
                            setCustomBreakMinutes(
                              Number(event.target.value),
                            )
                          }
                          className="min-w-0 flex-1 bg-transparent py-3 text-lg font-black outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">
                          分
                        </span>
                      </div>
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={applyCustomTime}
                    className="mt-3 w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    この時間を使う
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="text-sm font-black text-slate-700">
                セット数
              </p>

              <div className="mt-3 flex items-center justify-between rounded-3xl bg-slate-50 p-3">
                <button
                  type="button"
                  disabled={isRunning || totalSets <= 1}
                  onClick={() => changeTotalSets(-1)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
                >
                  −
                </button>

                <div className="text-center">
                  <p className="text-3xl font-black">
                    {totalSets}
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    セット
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isRunning || totalSets >= 12}
                  onClick={() => changeTotalSets(1)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
                >
                  ＋
                </button>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-black text-slate-700">
                教科
              </label>

              <select
                value={subject}
                disabled={isRunning}
                onChange={(event) =>
                  setSubject(
                    event.target.value as SubjectName,
                  )
                }
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-black outline-none transition focus:border-sky-400 disabled:opacity-50"
              >
                {subjects.map((subjectName) => (
                  <option
                    key={subjectName}
                    value={subjectName}
                  >
                    {subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid gap-3">
              <SettingToggle
                label="自動で次へ進む"
                subtitle="集中と休憩を自動で切り替える"
                checked={autoSwitch}
                onChange={setAutoSwitch}
              />

              <SettingToggle
                label="終了音"
                subtitle="タイマー終了時に音を鳴らす"
                checked={soundEnabled}
                onChange={setSoundEnabled}
              />
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[0.15em] text-sky-500">
                  DAILY PROGRESS
                </p>
                <h2 className="mt-1 text-xl font-black">
                  今日の学習
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-2 text-xs font-black ${
                  todayMinutes >= DAILY_GOAL_MINUTES
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-sky-50 text-sky-600"
                }`}
              >
                {todayMinutes >= DAILY_GOAL_MINUTES
                  ? "目標達成"
                  : "4時間目標"}
              </span>
            </div>

            <div className="mt-7">
              <p className="text-sm font-bold text-slate-400">
                今日の勉強時間
              </p>
              <p className="mt-1 text-4xl font-black">
                {isLoaded
                  ? formatStudyTime(todayMinutes)
                  : "読込中"}
              </p>

              <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-700"
                  style={{
                    width: `${dailyProgress}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs font-bold text-slate-400">
                <span>{todaySessions}セット完了</span>
                <span>
                  {todayMinutes >= DAILY_GOAL_MINUTES
                    ? `${formatStudyTime(
                        todayMinutes -
                          DAILY_GOAL_MINUTES,
                      )}超え`
                    : `あと${formatStudyTime(
                        DAILY_GOAL_MINUTES -
                          todayMinutes,
                      )}`}
                </span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <MiniStat
                label="今回の予定"
                value={`${totalSets}セット`}
              />
              <MiniStat
                label="集中時間"
                value={`${focusMinutes}分`}
              />
              <MiniStat
                label="休憩時間"
                value={`${breakMinutes}分`}
              />
              <MiniStat
                label="予定合計"
                value={formatStudyTime(estimatedMinutes)}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.15em] text-sky-500">
                STUDY CALENDAR
              </p>
              <h2 className="mt-1 text-2xl font-black">
                実績カレンダー
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                日ごとの勉強時間を表示。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() - 1,
                        1,
                      ),
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white font-black text-slate-600 transition hover:bg-slate-50"
              >
                ←
              </button>

              <p className="min-w-28 text-center text-sm font-black">
                {calendarMonth.getFullYear()}年
                {calendarMonth.getMonth() + 1}月
              </p>

              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() + 1,
                        1,
                      ),
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white font-black text-slate-600 transition hover:bg-slate-50"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
            <div>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {weekdays.map((weekday) => (
                  <div
                    key={weekday}
                    className="py-2 text-center text-[11px] font-black text-slate-400"
                  >
                    {weekday}
                  </div>
                ))}

                {calendarDays.map((calendarDay) => {
                  if (calendarDay.day === null) {
                    return (
                      <div
                        key={calendarDay.key}
                        className="aspect-square"
                      />
                    );
                  }

                  const isSelected =
                    selectedDateKey === calendarDay.key;
                  const isToday =
                    calendarDay.key ===
                    getDateKey(new Date());

                  return (
                    <button
                      key={calendarDay.key}
                      type="button"
                      onClick={() =>
                        setSelectedDateKey(
                          calendarDay.key,
                        )
                      }
                      className={`relative flex aspect-square min-h-12 flex-col items-center justify-center rounded-2xl border p-1 transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-16 ${
                        getCalendarColor(
                          calendarDay.minutes,
                        )
                      } ${
                        isSelected
                          ? "ring-2 ring-slate-950 ring-offset-2"
                          : ""
                      }`}
                    >
                      <span className="text-[11px] font-black sm:text-xs">
                        {calendarDay.day}
                      </span>

                      <span className="mt-1 text-[9px] font-black sm:text-[10px]">
                        {calendarDay.minutes > 0
                          ? formatCompactStudyTime(
                              calendarDay.minutes,
                            )
                          : "0m"}
                      </span>

                      {isToday && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400">
                <span>0分</span>
                {[60, 180, 300, 420, 480].map(
                  (minutes) => (
                    <span
                      key={minutes}
                      className={`h-5 w-5 rounded-md border ${getCalendarColor(
                        minutes,
                      )}`}
                    />
                  ),
                )}
                <span>8時間以上</span>
              </div>
            </div>

            <div className="rounded-[26px] bg-slate-950 p-5 text-white">
              <p className="text-xs font-black tracking-[0.14em] text-sky-300">
                DAY REPORT
              </p>

              <h3 className="mt-2 text-lg font-black">
                {getLongDateText(selectedDateKey)}
              </h3>

              <p className="mt-5 text-3xl font-black">
                {formatStudyTime(selectedDateMinutes)}
              </p>

              <p className="mt-1 text-xs font-bold text-slate-400">
                {selectedDateRecords.length}セット
              </p>

              <div className="mt-5 space-y-3">
                {selectedDateSubjects.length > 0 ? (
                  selectedDateSubjects.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                    >
                      <span className="text-sm font-black">
                        {item.name}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {formatStudyTime(item.minutes)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-medium text-slate-400">
                    この日の記録はありません。
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniStat
              label="今月"
              value={formatStudyTime(monthMinutes)}
            />
            <MiniStat
              label="学習日"
              value={`${monthStudyDays}日`}
            />
            <MiniStat
              label="最高"
              value={formatStudyTime(monthDailyMaximum)}
            />
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div>
              <p className="text-xs font-black tracking-[0.15em] text-sky-500">
                WEEKLY REPORT
              </p>
              <h2 className="mt-1 text-2xl font-black">
                直近7日間
              </h2>
            </div>

            <div className="mt-8 flex h-64 items-end gap-2 sm:gap-4">
              {weekData.map((day) => {
                const height =
                  day.minutes === 0
                    ? 3
                    : Math.max(
                        (day.minutes / weekMaximum) *
                          100,
                        8,
                      );

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => {
                      setSelectedDateKey(day.key);

                      const date =
                        parseRecordDate(day.key);

                      if (date) {
                        setCalendarMonth(
                          new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            1,
                          ),
                        );
                      }
                    }}
                    className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-2 text-[10px] font-black text-slate-500 sm:text-xs">
                      {formatCompactStudyTime(day.minutes)}
                    </span>

                    <div className="flex h-44 w-full items-end overflow-hidden rounded-t-2xl bg-slate-50">
                      <div
                        className="w-full rounded-t-2xl bg-sky-500 transition-all duration-700 group-hover:bg-sky-400"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-[10px] font-black text-slate-600 sm:text-xs">
                      {day.label}
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold text-slate-400">
                      {day.weekday}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
              <span>1日の目標ライン</span>
              <span>4時間</span>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div>
              <p className="text-xs font-black tracking-[0.15em] text-sky-500">
                RECENT STUDY
              </p>
              <h2 className="mt-1 text-2xl font-black">
                最近の学習
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {recentRecords.length > 0 ? (
                recentRecords.map((record) => {
                  const date = parseRecordDate(
                    record.completedAt ??
                      record.date,
                  );

                  return (
                    <div
                      key={record.id}
                      className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700">
                        {record.subject.slice(0, 1)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="font-black">
                          {record.subject}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {date
                            ? `${date.getMonth() + 1}/${date.getDate()} ${padNumber(
                                date.getHours(),
                              )}:${padNumber(
                                date.getMinutes(),
                              )}`
                            : record.date}
                        </p>
                      </div>

                      <span className="text-sm font-black text-slate-600">
                        {record.minutes}分
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl bg-slate-50 px-5 py-8 text-center">
                  <p className="text-sm font-bold text-slate-400">
                    まだ学習記録がありません。
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    まずは1セット完了させよう。
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-[26px] border border-white/70 bg-white/90 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1">
          <BottomNavItem
            href="/"
            icon="⌂"
            label="ホーム"
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
            active
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
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-2 py-4 text-center backdrop-blur sm:px-3">
      <p className="text-[10px] font-bold text-slate-400 sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black text-white sm:text-sm">
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-3xl bg-slate-50 px-3 py-4 text-center sm:px-4">
      <p className="text-[10px] font-black text-slate-400 sm:text-xs">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-slate-800 sm:text-base">
        {value}
      </p>
    </div>
  );
}

function SettingToggle({
  label,
  subtitle,
  checked,
  onChange,
}: {
  label: string;
  subtitle: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-4 text-left transition hover:bg-slate-100"
    >
      <div>
        <p className="text-sm font-black text-slate-700">
          {label}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-400">
          {subtitle}
        </p>
      </div>

      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-sky-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
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
      <span className="mt-1 text-[10px] font-black">
        {label}
      </span>
    </Link>
  );
}