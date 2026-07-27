import Link from "next/link";

const mathMenu = [
  {
    title: "数と式",
    description: "正負の数・文字式・展開・因数分解・平方根",
    icon: "🔢",
    href: "/math/numbers",
  },
  {
    title: "方程式",
    description: "一次方程式・連立方程式・二次方程式・文章題",
    icon: "🟰",
    href: "/math/equations",
  },
  {
    title: "関数",
    description: "比例・反比例・一次関数・二次関数・グラフ",
    icon: "📈",
    href: "/math/functions",
  },
  {
    title: "図形",
    description: "平面図形・空間図形・公式・図形ノート",
    icon: "📐",
    href: "/math/geometry",
  },
  {
    title: "データ・確率",
    description: "確率・度数分布表・箱ひげ図・標本調査",
    icon: "📊",
    href: "/math/statistics",
  },
  {
    title: "お気に入り",
    description: "保存した公式や重要事項をまとめて確認",
    icon: "⭐",
    href: "/math/favorites",
  },
  {
    title: "数学ノート",
    description: "授業内容・間違えた問題・覚えたいことを記録",
    icon: "📝",
    href: "/math/notebook",
  },
];

export default function MathPage() {
  return (
    <main className="min-h-screen bg-[#f4fbff] px-4 pb-28 pt-6 text-slate-950">
      <div className="mx-auto w-full max-w-5xl">
        <header className="relative overflow-hidden rounded-[32px] border-2 border-slate-950 bg-white p-6 shadow-[6px_6px_0_#0f172a] sm:p-8">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-200/70" />
          <div className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-cyan-100" />

          <div className="relative">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-sky-100 px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:bg-sky-200"
            >
              ← ホームへ
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-300 text-3xl shadow-[4px_4px_0_#0f172a]">
                📐
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.2em] text-sky-600">
                  STUDY OS
                </p>
                <h1 className="text-3xl font-black sm:text-4xl">数学</h1>
                <p className="mt-2 max-w-xl text-sm font-bold text-slate-600 sm:text-base">
                  中学校の数学を、公式・解き方・グラフ・ノートで整理しよう。
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black text-sky-600">CONTENTS</p>
              <h2 className="text-2xl font-black">学習メニュー</h2>
            </div>

            <div className="rounded-full border-2 border-slate-950 bg-white px-4 py-2 text-xs font-black shadow-[3px_3px_0_#0f172a]">
              全7項目
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {mathMenu.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-[26px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a] transition duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_#0f172a] active:translate-y-0 active:shadow-[3px_3px_0_#0f172a]"
              >
                <div className="absolute right-4 top-3 text-5xl font-black text-sky-100">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-200 text-2xl transition group-hover:rotate-3 group-hover:bg-sky-300">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black">{item.title}</h3>
                      <span className="text-xl font-black transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[6px_6px_0_#7dd3fc]">
          <p className="text-sm font-black tracking-[0.18em] text-sky-300">
            TODAY&apos;S TIP
          </p>
          <h2 className="mt-2 text-xl font-black">
            公式を見るだけで終わらず、例題と一緒に覚えよう。
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-300">
            数学は「知っている」より「使える」が大事。間違えた問題は数学ノートに残しておくと復習しやすい。
          </p>
        </section>
      </div>
    </main>
  );
}