"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Subject = "英語" | "数学" | "国語" | "理科" | "社会";
type Session = { id: string; subject: Subject; minutes: number; at: string };
type Saved = {
  sessions: Session[];
  dailyGoal: number;
  examDate: string;
  diary: Record<string, string>;
  preset: "25/5" | "50/10";
  autoBreak: boolean;
};

const KEY = "study-os-focus-v1";
const SUBJECTS: Subject[] = ["英語", "数学", "国語", "理科", "社会"];
const DEFAULT: Saved = {
  sessions: [],
  dailyGoal: 120,
  examDate: "",
  diary: {},
  preset: "25/5",
  autoBreak: false,
};

function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMinutes(value: number) {
  const h = Math.floor(value / 60);
  const m = value % 60;
  if (!h) return `${m}分`;
  return m ? `${h}時間${m}分` : `${h}時間`;
}

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function beep() {
  try {
    const Ctx = window.AudioContext;
    const ctx = new Ctx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = 740;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {}
}

export default function PomodoroPage() {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<Saved>(DEFAULT);
  const [subject, setSubject] = useState<Subject>("英語");
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const endAt = useRef<number | null>(null);

  const lengths = saved.preset === "50/10" ? { focus: 50, break: 10 } : { focus: 25, break: 5 };
  const totalSeconds = lengths[mode] * 60;
  const [seconds, setSeconds] = useState(25 * 60);
  const today = dateKey();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved({ ...DEFAULT, ...(JSON.parse(raw) as Saved) });
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(saved));
  }, [saved, ready]);

  useEffect(() => {
    setRunning(false);
    endAt.current = null;
    setSeconds(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (!endAt.current) return;
      const remain = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setSeconds(remain);
      if (remain !== 0) return;

      setRunning(false);
      endAt.current = null;
      beep();

      if (mode === "focus") {
        setSaved((old) => ({
          ...old,
          sessions: [...old.sessions, { id: crypto.randomUUID(), subject, minutes: lengths.focus, at: new Date().toISOString() }],
        }));
        setMode("break");
        setSeconds(lengths.break * 60);
        if (saved.autoBreak) {
          endAt.current = Date.now() + lengths.break * 60_000;
          setRunning(true);
        }
      } else {
        setMode("focus");
        setSeconds(lengths.focus * 60);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [running, mode, subject, lengths.focus, lengths.break, saved.autoBreak]);

  const todaySessions = useMemo(
    () => saved.sessions.filter((item) => dateKey(new Date(item.at)) === today),
    [saved.sessions, today],
  );
  const todayMinutes = todaySessions.reduce((sum, item) => sum + item.minutes, 0);
  const totalMinutes = saved.sessions.reduce((sum, item) => sum + item.minutes, 0);
  const subjectTotals = Object.fromEntries(
    SUBJECTS.map((name) => [name, todaySessions.filter((x) => x.subject === name).reduce((sum, x) => sum + x.minutes, 0)]),
  ) as Record<Subject, number>;
  const goalPercent = Math.min(100, Math.round((todayMinutes / Math.max(saved.dailyGoal, 1)) * 100));
  const level = Math.floor(totalMinutes / 300) + 1;
  const levelXp = totalMinutes % 300;
  const examDays = saved.examDate
    ? Math.ceil((new Date(`${saved.examDate}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000)
    : null;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  function toggle() {
    if (running) {
      setRunning(false);
      endAt.current = null;
    } else {
      endAt.current = Date.now() + seconds * 1000;
      setRunning(true);
    }
  }

  function reset() {
    setRunning(false);
    endAt.current = null;
    setSeconds(totalSeconds);
  }

  function changeMode(next: "focus" | "break") {
    setMode(next);
    setRunning(false);
    endAt.current = null;
    setSeconds(lengths[next] * 60);
  }

  function addManual(minutes: number) {
    setSaved((old) => ({
      ...old,
      sessions: [...old.sessions, { id: crypto.randomUUID(), subject, minutes, at: new Date().toISOString() }],
    }));
  }

  if (!ready) return <main className="min-h-screen bg-slate-950" />;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <p className="text-sm font-bold text-sky-400">STUDY OS</p>
          <h1 className="text-3xl font-black">Focus Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">集中時間を自動で学習記録に追加します。</p>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="今日" value={formatMinutes(todayMinutes)} sub={`${todaySessions.length}回集中`} />
          <Stat label="累計" value={formatMinutes(totalMinutes)} sub="この端末に保存" />
          <Stat label="レベル" value={`Lv.${level}`} sub={`次まで${300 - levelXp}XP`} />
          <Stat label="受験まで" value={examDays === null ? "未設定" : examDays >= 0 ? `${examDays}日` : "終了"} sub="下で日付設定" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-sky-400">POMODORO</p>
                <h2 className="text-2xl font-black">{mode === "focus" ? "集中時間" : "休憩時間"}</h2>
              </div>
              <div className="flex rounded-xl bg-black/30 p-1">
                <button onClick={() => changeMode("focus")} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "focus" ? "bg-white text-slate-950" : "text-slate-400"}`}>集中</button>
                <button onClick={() => changeMode("break")} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "break" ? "bg-white text-slate-950" : "text-slate-400"}`}>休憩</button>
              </div>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} disabled={running} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold">
                {SUBJECTS.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select value={saved.preset} onChange={(e) => setSaved((old) => ({ ...old, preset: e.target.value as Saved["preset"] }))} disabled={running} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-bold">
                <option value="25/5">25分 / 5分</option>
                <option value="50/10">50分 / 10分</option>
              </select>
            </div>

            <div className="relative mx-auto mb-7 grid aspect-square max-w-[330px] place-items-center">
              <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(rgb(14 165 233) ${progress}%, rgb(30 41 59) ${progress}% 100%)` }} />
              <div className="absolute inset-3 rounded-full bg-slate-950" />
              <div className="relative text-center">
                <p className="mb-2 font-bold text-slate-400">{subject}</p>
                <p className="font-mono text-6xl font-black sm:text-7xl">{formatClock(seconds)}</p>
                <p className="mt-2 text-sm text-slate-500">{running ? "計測中" : "準備OK"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={toggle} className="col-span-2 rounded-2xl bg-sky-500 py-4 font-black hover:bg-sky-400">{running ? "一時停止" : "スタート"}</button>
              <button onClick={reset} className="rounded-2xl border border-white/10 bg-white/5 py-4 font-bold">リセット</button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">
                休憩を自動開始
                <input type="checkbox" checked={saved.autoBreak} onChange={(e) => setSaved((old) => ({ ...old, autoBreak: e.target.checked }))} className="h-5 w-5 accent-sky-500" />
              </label>
              <button onClick={() => setFullscreen(true)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">集中モード</button>
            </div>
          </div>

          <div className="space-y-6">
            <Card title="今日の目標" eyebrow="DAILY GOAL">
              <div className="mb-3 flex justify-between text-sm font-bold"><span>{formatMinutes(todayMinutes)} / {formatMinutes(saved.dailyGoal)}</span><span>{goalPercent}%</span></div>
              <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-sky-500" style={{ width: `${goalPercent}%` }} /></div>
              <input type="number" min={10} step={10} value={saved.dailyGoal} onChange={(e) => setSaved((old) => ({ ...old, dailyGoal: Math.max(10, Number(e.target.value) || 10) }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 font-bold" />
            </Card>

            <Card title="手動で記録" eyebrow="QUICK RECORD">
              <div className="grid grid-cols-3 gap-2">{[10, 15, 30].map((m) => <button key={m} onClick={() => addManual(m)} className="rounded-xl border border-white/10 bg-white/5 py-3 font-black">+{m}分</button>)}</div>
            </Card>

            <Card title="受験カウントダウン" eyebrow="COUNTDOWN">
              <input type="date" value={saved.examDate} onChange={(e) => setSaved((old) => ({ ...old, examDate: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 font-bold" />
            </Card>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="今日の教科別記録" eyebrow="SUBJECTS">
            <div className="space-y-4">
              {SUBJECTS.map((item) => {
                const value = subjectTotals[item];
                const width = todayMinutes ? Math.max(value ? 4 : 0, (value / todayMinutes) * 100) : 0;
                return <div key={item}><div className="mb-2 flex justify-between text-sm"><b>{item}</b><span className="text-slate-400">{formatMinutes(value)}</span></div><div className="h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-sky-500" style={{ width: `${width}%` }} /></div></div>;
              })}
            </div>
          </Card>

          <Card title="今日の学習日記" eyebrow="DIARY">
            <textarea value={saved.diary[today] ?? ""} onChange={(e) => setSaved((old) => ({ ...old, diary: { ...old.diary, [today]: e.target.value } }))} placeholder="今日できたこと、難しかったことを一言…" className="min-h-44 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm outline-none" />
            <p className="mt-2 text-xs text-slate-500">入力内容は自動保存されます。</p>
          </Card>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <p className="text-sm font-bold text-sky-400">LEVEL</p>
          <div className="mb-3 flex justify-between"><h2 className="text-xl font-black">レベル進捗</h2><b>{levelXp}/300 XP</b></div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-violet-500" style={{ width: `${(levelXp / 300) * 100}%` }} /></div>
          <p className="mt-3 text-sm text-slate-400">学習1分で1XP。</p>
        </section>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950 p-5">
          <button onClick={() => setFullscreen(false)} className="absolute right-5 top-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold">閉じる</button>
          <div className="text-center">
            <p className="mb-3 text-xl font-black text-sky-400">{subject}・{mode === "focus" ? "集中" : "休憩"}</p>
            <p className="font-mono text-7xl font-black sm:text-9xl">{formatClock(seconds)}</p>
            <div className="mx-auto mt-8 flex max-w-md gap-3">
              <button onClick={toggle} className="flex-1 rounded-2xl bg-sky-500 px-6 py-4 font-black">{running ? "一時停止" : "スタート"}</button>
              <button onClick={reset} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold">リセット</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></div>;
}

function Card({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-white/10 bg-white/5 p-5"><p className="text-sm font-bold text-sky-400">{eyebrow}</p><h2 className="mb-4 text-xl font-black">{title}</h2>{children}</section>;
}