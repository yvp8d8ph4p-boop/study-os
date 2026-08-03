import Link from "next/link";

export default function IdiomQuizPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#f3efff_0%,#faf8ff_50%,#ffffff_100%)] px-4">
      <section className="w-full max-w-sm rounded-[32px] border border-slate-200 bg-white p-7 text-center shadow-xl">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[24px] bg-violet-100 text-4xl">
          📝
        </div>

        <h1 className="mt-5 text-2xl font-black">
          クイズ準備中
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          熟語クイズは現在調整中です。先にフォルダ・復習・熟語登録を使えます。
        </p>

        <Link
          href="/english/idioms"
          className="mt-6 block rounded-2xl bg-violet-600 py-4 font-black text-white"
        >
          熟語帳へ戻る
        </Link>
      </section>
    </main>
  );
}