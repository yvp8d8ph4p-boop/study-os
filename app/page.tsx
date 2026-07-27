import Link from "next/link";

const subjects = [
  {
    title: "英語",
    description: "単語・熟語・英文法をまとめて学習",
    icon: "🇬🇧",
    href: "/english",
    background: "bg-sky-200",
  },
  {
    title: "数学",
    description: "数と式・方程式・関数・図形・確率",
    icon: "🔢",
    href: "/math",
    background: "bg-cyan-200",
  },
  {
    title: "国語",
    description: "現代文・古文・漢文・漢字・文学",
    icon: "📚",
    href: "/japanese",
    background: "bg-blue-200",
  },
  {
    title: "理科",
    description: "物理・化学・生物・地学",
    icon: "🧪",
    href: "/science",
    background: "bg-teal-200",
  },
  {
    title: "社会",
    description: "地理・歴史・公民",
    icon: "🌏",
    href: "/social",
    background: "bg-indigo-200",
  },
];

const supportMenu = [
  {
    title: "ノート",
    description: "教科をまたいでノートを確認",
    icon: "📝",
    href: "/notes",
  },
  {
    title: "今日の復習",
    description: "覚え直したい内容をまとめて確認",
    icon: "🔁",
    href: "/review",
  },
  {
    title: "お気に入り",
    description: "保存した公式や重要事項を見る",
    icon: "⭐",
    href: "/favorites",
  },
  {
    title: "設定",
    description: "表示や学習設定を変更",
    icon: "⚙️",
    href: "/settings",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4fbff] px-4 pb-28 pt-6 text-slate-950">
      <div className="mx-auto w-full max-w-5xl">
        <header className="relative overflow-hidden rounded-[32px] border-2 border-slate-950 bg-white p-6 shadow-[7px_7px_0_#0f172a] sm:p-8">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sky-200/80" />
          <div className="absolute -bottom-14 left-12 h-36 w-36 rounded-full bg-cyan-100" />

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-300 text-3xl shadow-[4px_4px_0_#0f172a]">
                  📘
                </div>

                <div>
                  <p className="text-sm font-black tracking-[0.24em] text-sky-600">
                    STUDY OS
                  </p>

                  <h1 className="text-3xl font-black sm:text-4xl">
                    学習ホーム
                  </h1>
                </div>
              </div>

              <Link
                href="/settings"
                aria-label="設定を開く"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 bg-white text-xl shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-sky-100"
              >
                ⚙️
              </Link>
            </div>

            <div className="mt-6 rounded-[24px] border-2 border-slate-950 bg-slate-950 p-5 text-white shadow-[5px_5px_0_#7dd3fc]">
              <p className="text-sm font-black text-sky-300">
                GOOD MORNING
              </p>

              <h2 className="mt-1 text-2xl font-black">
                今日も少しずつ進めよう。
              </h2>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-300">
                教科を選んで、ノート・公式・重要事項を整理できます。
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                SUBJECTS
              </p>

              <h2 className="text-2xl font-black">
                教科
              </h2>
            </div>

            <div className="rounded-full border-2 border-slate-950 bg-white px-4 py-2 text-xs font-black shadow-[3px_3px_0_#0f172a]">
              全5教科
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.map((subject) => (
              <Link
                key={subject.href}
                href={subject.href}
                className="group relative overflow-hidden rounded-[26px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a] transition duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_#0f172a] active:translate-y-0 active:shadow-[3px_3px_0_#0f172a]"
              >
                <div className="relative flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 text-3xl transition duration-200 group-hover:rotate-3 ${subject.background}`}
                  >
                    {subject.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black">
                        {subject.title}
                      </h3>

                      <span className="text-xl font-black transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                      {subject.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <p className="text-sm font-black tracking-[0.16em] text-sky-600">
              TOOLS
            </p>

            <h2 className="text-2xl font-black">
              学習ツール
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {supportMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[24px] border-2 border-slate-950 bg-white p-5 shadow-[4px_4px_0_#0f172a] transition duration-200 hover:-translate-y-1 hover:bg-sky-50 hover:shadow-[7px_7px_0_#0f172a]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-100 text-2xl transition group-hover:bg-sky-200">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-black">
                        {item.title}
                      </h3>

                      <span className="font-black transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border-2 border-slate-950 bg-sky-200 p-6 shadow-[6px_6px_0_#0f172a]">
          <p className="text-sm font-black tracking-[0.16em] text-sky-700">
            QUICK START
          </p>

          <h2 className="mt-2 text-xl font-black">
            数学の続きを始める
          </h2>

          <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
            数と式・方程式・関数・図形・データと確率をまとめて学習できます。
          </p>

          <Link
            href="/math"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl border-2 border-slate-950 bg-white px-5 py-3 font-black shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-1 hover:bg-sky-50 hover:shadow-[6px_6px_0_#0f172a]"
          >
            数学を開く
            <span>→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}