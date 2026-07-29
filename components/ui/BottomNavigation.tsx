"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type TimerMode = "focus" | "break";

type SavedTimerState = {
  mode?: TimerMode;
  focusMinutes?: number;
  breakMinutes?: number;
  totalSets?: number;
  currentSet?: number;
  completedSets?: number;
  subject?: string;
  secondsLeft?: number;
  isRunning?: boolean;
  waitingForNext?: boolean;
  targetEndTime?: number | null;
};

type NavigationItem = {
  href: string;
  icon: string;
  label: string;
};

const TIMER_STORAGE_KEY = "study-os-pomodoro-timer";

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    icon: "⌂",
    label: "ホーム",
  },
  {
    href: "/english",
    icon: "A",
    label: "英語",
  },
  {
    href: "/math",
    icon: "∑",
    label: "数学",
  },
  {
    href: "/pomodoro",
    icon: "◷",
    label: "集中",
  },
];

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function formatTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(Math.floor(totalSeconds), 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${padNumber(minutes)}:${padNumber(seconds)}`;
}

function readTimerState(): SavedTimerState | null {
  try {
    const savedValue = localStorage.getItem(TIMER_STORAGE_KEY);

    if (!savedValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (
      typeof parsedValue !== "object" ||
      parsedValue === null
    ) {
      return null;
    }

    return parsedValue as SavedTimerState;
  } catch {
    return null;
  }
}

export default function BottomNavigation() {
  const pathname = usePathname();

  const [timerState, setTimerState] =
    useState<SavedTimerState | null>(null);

  const [currentTime, setCurrentTime] = useState(
    Date.now(),
  );

  useEffect(() => {
    const updateTimer = () => {
      setTimerState(readTimerState());
      setCurrentTime(Date.now());
    };

    updateTimer();

    const intervalId = window.setInterval(
      updateTimer,
      500,
    );

    const handleStorage = (
      event: StorageEvent,
    ) => {
      if (
        event.key === TIMER_STORAGE_KEY ||
        event.key === null
      ) {
        updateTimer();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, []);

  const remainingSeconds = useMemo(() => {
    if (!timerState) {
      return 0;
    }

    if (
      timerState.isRunning &&
      typeof timerState.targetEndTime === "number"
    ) {
      return Math.max(
        Math.ceil(
          (timerState.targetEndTime - currentTime) /
            1000,
        ),
        0,
      );
    }

    return Math.max(timerState.secondsLeft ?? 0, 0);
  }, [currentTime, timerState]);

  const totalModeSeconds = useMemo(() => {
    if (!timerState) {
      return 0;
    }

    const minutes =
      timerState.mode === "break"
        ? timerState.breakMinutes ?? 5
        : timerState.focusMinutes ?? 25;

    return minutes * 60;
  }, [timerState]);

  const timerHasStarted = useMemo(() => {
    if (!timerState) {
      return false;
    }

    return (
      timerState.isRunning === true ||
      timerState.waitingForNext === true ||
      remainingSeconds < totalModeSeconds ||
      (timerState.completedSets ?? 0) > 0
    );
  }, [
    remainingSeconds,
    timerState,
    totalModeSeconds,
  ]);

  const timerStatus = useMemo(() => {
    if (!timerState || !timerHasStarted) {
      return null;
    }

    if (
      timerState.isRunning &&
      remainingSeconds <= 0
    ) {
      return {
        icon: "✓",
        label:
          timerState.mode === "break"
            ? "休憩終了"
            : "集中終了",
        color:
          "border-amber-200 bg-amber-50 text-amber-700",
        dotColor: "bg-amber-500",
      };
    }

    if (timerState.isRunning) {
      if (timerState.mode === "break") {
        return {
          icon: "☕",
          label: "休憩中",
          color:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          dotColor: "bg-emerald-500",
        };
      }

      return {
        icon: "●",
        label: "集中中",
        color:
          "border-sky-200 bg-sky-50 text-sky-700",
        dotColor: "bg-sky-500",
      };
    }

    if (timerState.waitingForNext) {
      return {
        icon: "▶",
        label: "開始待ち",
        color:
          "border-violet-200 bg-violet-50 text-violet-700",
        dotColor: "bg-violet-500",
      };
    }

    return {
      icon: "Ⅱ",
      label: "一時停止",
      color:
        "border-amber-200 bg-amber-50 text-amber-700",
      dotColor: "bg-amber-500",
    };
  }, [
    remainingSeconds,
    timerHasStarted,
    timerState,
  ]);

  const isActivePath = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      {timerStatus && timerState && (
        <Link
          href="/pomodoro"
          className={`mb-2 flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3 transition active:scale-[0.99] ${timerStatus.color}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${timerStatus.dotColor} ${
                timerState.isRunning
                  ? "animate-pulse"
                  : ""
              }`}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black">
                  {timerStatus.icon}{" "}
                  {timerStatus.label}
                </p>

                <span className="text-[10px] font-bold opacity-60">
                  {timerState.mode === "break"
                    ? "BREAK"
                    : "FOCUS"}
                </span>
              </div>

              <p className="mt-0.5 truncate text-[10px] font-bold opacity-70">
                {timerState.mode === "break"
                  ? `休憩・次はセット ${Math.min(
                      (timerState.currentSet ?? 1) +
                        1,
                      timerState.totalSets ?? 4,
                    )}`
                  : `${
                      timerState.subject ?? "勉強"
                    }・セット ${
                      timerState.currentSet ?? 1
                    } / ${
                      timerState.totalSets ?? 4
                    }`}
              </p>
            </div>
          </div>

          <p className="shrink-0 text-xl font-black tabular-nums tracking-tight">
            {formatTimer(remainingSeconds)}
          </p>
        </Link>
      )}

      <div className="grid grid-cols-4 gap-1">
        {navigationItems.map((item) => {
          const active = isActivePath(item.href);

          const pomodoroRunning =
            item.href === "/pomodoro" &&
            timerState?.isRunning === true &&
            timerHasStarted;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center rounded-2xl px-2 py-2.5 transition ${
                active
                  ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {pomodoroRunning && !active && (
                <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-white">
                  <span className="absolute inset-0 animate-ping rounded-full bg-sky-400 opacity-70" />
                </span>
              )}

              <span className="text-lg font-black">
                {item.icon}
              </span>

              <span className="mt-1 text-[10px] font-black">
                {item.href === "/pomodoro" &&
                timerHasStarted
                  ? formatTimer(remainingSeconds)
                  : item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}