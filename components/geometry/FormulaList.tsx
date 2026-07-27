"use client";

import { useMemo, useState } from "react";

type FormulaListProps = {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onlyFavorites?: boolean;
};

type Category = "角" | "平面図形" | "円" | "合同・相似" | "三平方" | "空間図形";

type Formula = {
  id: string;
  category: Category;
  title: string;
  icon: string;
  formula: string;
  useWhen: string;
  example: string;
  answer: string;
  points: string[];
  mistake: string;
  memoryTip: string;
  keywords: string[];
};

const formulas: Formula[] = [
  ["straight-angle","角","一直線上の角","📏","a°＋b°＝180°","一直線上に隣り合う角があるとき。","一方が68°のとき、隣の角は？","180°－68°＝112°",["一直線を確認する","合計を180°にする"],"1点のまわりの360°と混同しない。","まっすぐは半回転で180°。",["一直線","180度"]],
  ["around-point","角","1点のまわりの角","🧭","a°＋b°＋c°＋…＝360°","1つの点の周囲に角が集まるとき。","90°、120°、80°、x°がある。","x＝360－90－120－80＝70°",["1周分を全部足す","中心の点を確認する"],"一部だけを足して180°にしない。","ぐるっと1周で360°。",["360度","点"]],
  ["vertical-angles","角","対頂角","✖️","向かい合う角は等しい","2直線がX字に交わるとき。","一方が47°なら向かいの角は？","47°",["向かい合う角を探す","隣の角ではない"],"隣り合う角を対頂角だと思わない。","Xの向かい同士は同じ。",["対頂角","交差"]],
  ["parallel-angles","角","平行線と角","🛤️","同位角＝錯角＝等しい","平行な2直線を別の直線が横切るとき。","同位角の一方が65°。","もう一方も65°",["平行の印を確認","角の位置関係を見る"],"平行でないのに等しいと決めない。","平行線では同じ向きの角がそろう。",["平行線","同位角","錯角"]],
  ["triangle-sum","平面図形","三角形の内角の和","🔺","∠A＋∠B＋∠C＝180°","三角形の内角が2つ分かるとき。","50°と65°なら残りは？","180－50－65＝65°",["内角だけを使う","180°から引く"],"外角を混ぜない。","三角形の中は全部で180°。",["三角形","内角"]],
  ["triangle-exterior","平面図形","三角形の外角","↗️","外角＝隣り合わない2内角の和","辺を延長して外角があるとき。","離れた内角が40°と75°。","40＋75＝115°",["外角の隣ではない2角を見る"],"外角と隣の内角を足さない。","外角は遠くの2角を足す。",["外角"]],
  ["isosceles","平面図形","二等辺三角形","🔻","2つの底角は等しい","2辺が等しい三角形で角度を求めるとき。","頂角40°の底角は？","(180－40)÷2＝70°",["等しい辺の向かいの角が等しい"],"頂角と底角を取り違えない。","同じ辺の反対側の角が同じ。",["二等辺三角形","底角"]],
  ["equilateral","平面図形","正三角形","△","3つの角はすべて60°","3辺がすべて等しい三角形。","1つの内角は？","180÷3＝60°",["3辺も3角も等しい"],"二等辺三角形と混同しない。","180°を3等分。",["正三角形","60度"]],
  ["polygon-sum","平面図形","多角形の内角の和","⬡","(n－2)×180°","n角形の内角の和を求めるとき。","六角形の内角の和。","(6－2)×180＝720°",["nは辺または頂点の数"],"1つの内角と混同しない。","三角形はn－2個。",["多角形","内角"]],
  ["polygon-exterior","平面図形","多角形の外角の和","🔄","外角の和＝360°","各頂点で同じ向きに外角を1つずつ取るとき。","凸多角形の外角の和は？","360°",["辺の数によらない"],"1頂点で複数数えない。","1周向き直すから360°。",["外角","多角形"]],
  ["regular-polygon","平面図形","正多角形の1つの角","🔷","外角＝360°÷n　内角＝180°－外角","正n角形の1角を求めるとき。","正八角形の1内角。","180－360÷8＝135°",["外角から求めると速い"],"内角の和と混同しない。","正多角形は外角から。",["正多角形"]],
  ["triangle-area","平面図形","三角形の面積","📐","底辺×高さ÷2","底辺と垂直な高さが分かるとき。","底辺8cm、高さ5cm。","8×5÷2＝20cm²",["高さは底辺に垂直"],"÷2を忘れない。","平行四辺形の半分。",["三角形","面積"]],
  ["parallelogram-area","平面図形","平行四辺形の面積","▱","底辺×高さ","平行四辺形の底辺と高さが分かるとき。","底辺7cm、高さ4cm。","7×4＝28cm²",["斜辺は高さとは限らない"],"÷2をしない。","切って動かすと長方形。",["平行四辺形","面積"]],
  ["trapezoid-area","平面図形","台形の面積","⏢","(上底＋下底)×高さ÷2","台形の面積を求めるとき。","上底4、下底10、高さ6。","(4＋10)×6÷2＝42cm²",["平行な2辺が上底と下底"],"斜めの辺を高さにしない。","上と下を足して半分。",["台形","面積"]],
  ["rhombus-area","平面図形","ひし形の面積","◇","対角線×対角線÷2","2本の対角線が分かるとき。","8cmと6cm。","8×6÷2＝24cm²",["2本の対角線を使う"],"辺の長さを掛けない。","対角線どうしを掛けて半分。",["ひし形","対角線"]],
  ["circumference","円","円周","⭕","2πr または πd","円の周りの長さを求めるとき。","半径5cm。","2π×5＝10πcm",["d＝2r"],"面積のπr²と混同しない。","直径×π。",["円周","半径","直径"]],
  ["circle-area","円","円の面積","🔵","πr²","円の内部の広さを求めるとき。","半径4cm。","π×4²＝16πcm²",["半径を2乗する"],"直径をそのまま2乗しない。","半径×半径×π。",["円","面積"]],
  ["sector-arc","円","おうぎ形の弧の長さ","🌙","2πr×中心角÷360°","曲線部分の長さを求めるとき。","半径6、中心角120°。","2π×6×120÷360＝4πcm",["円周に角度の割合を掛ける"],"面積公式と混同しない。","円周×何周分か。",["おうぎ形","弧"]],
  ["sector-area","円","おうぎ形の面積","🍕","πr²×中心角÷360°","おうぎ形の内部の面積を求めるとき。","半径6、中心角120°。","π×6²×120÷360＝12πcm²",["円の面積に割合を掛ける"],"弧の長さの式を使わない。","円の面積×何周分か。",["おうぎ形","面積"]],
  ["inscribed-angle","円","円周角の定理","🎯","中心角＝2×円周角","同じ弧に対する中心角と円周角があるとき。","中心角100°。","円周角＝50°",["同じ弧か確認する"],"違う弧の角を比べない。","中心は円周の2倍。",["円周角","中心角"]],
  ["tangent-radius","円","接線と半径","📍","接点を通る半径 ⟂ 接線","円の接線があるとき。","接点で半径と接線がつくる角。","90°",["中心と接点を結ぶ"],"接点以外では使えない。","接線は半径に直角。",["接線","半径"]],
  ["congruence-sss","合同・相似","合同条件：3辺","🧩","3組の辺がそれぞれ等しい","2三角形の3辺が対応して等しいとき。","AB＝DE、BC＝EF、CA＝FD。","△ABC≡△DEF",["対応順をそろえる"],"三角形名の順番を間違えない。","辺・辺・辺でSSS。",["合同","SSS"]],
  ["congruence-sas","合同・相似","合同条件：2辺とその間の角","📐","2組の辺とその間の角がそれぞれ等しい","2辺と、その間の角が分かるとき。","AB＝DE、AC＝DF、∠A＝∠D。","△ABC≡△DEF",["角が2辺の間にある"],"間にない角では不十分。","辺・角・辺でSAS。",["合同","SAS"]],
  ["congruence-asa","合同・相似","合同条件：1辺と両端の角","📏","1組の辺とその両端の角がそれぞれ等しい","1辺と両端の2角が分かるとき。","AB＝DE、∠A＝∠D、∠B＝∠E。","△ABC≡△DEF",["辺の両端の角を見る"],"無関係な2角を選ばない。","角・辺・角でASA。",["合同","ASA"]],
  ["similarity-aa","合同・相似","相似条件：2組の角","🔍","2組の角がそれぞれ等しい","平行線や共通角から2組の角が等しいとき。","∠A＝∠D、∠B＝∠E。","△ABC∽△DEF",["2組で十分"],"合同記号と混同しない。","角が2つそろえば同じ形。",["相似","AA"]],
  ["similarity-ratio","合同・相似","相似な図形の辺の比","📊","対応する辺の比はすべて等しい","相似な図形の未知の辺を求めるとき。","相似比2：3、小さい辺8cm。","8×3÷2＝12cm",["比の順番を統一する"],"小：大を途中で逆にしない。","対応する辺は同じ倍率。",["相似比","辺の比"]],
  ["area-ratio","合同・相似","相似な図形の面積比","🟦","面積比＝相似比の2乗","相似な2図形の面積比を求めるとき。","相似比2：3。","4：9",["相似比を2乗する"],"そのまま2：3にしない。","面積は倍率が2回。",["面積比","2乗"]],
  ["volume-ratio","合同・相似","相似な立体の体積比","🧊","体積比＝相似比の3乗","相似な立体の体積比を求めるとき。","相似比2：3。","8：27",["相似比を3乗する"],"面積比と混同しない。","体積は倍率が3回。",["体積比","3乗"]],
  ["pythagorean","三平方","三平方の定理","📐","a²＋b²＝c²","直角三角形の辺を求めるとき。","直角をはさむ辺が3cmと4cm。","c＝5cm",["cは直角の向かいの斜辺","最後に平方根を取る"],"斜辺を間違えない。","直角なら短い2辺の二乗を足す。",["三平方","斜辺"]],
  ["coordinate-distance","三平方","座標上の2点間の距離","📍","√((x₂－x₁)²＋(y₂－y₁)²)","座標平面上の2点間の距離を求めるとき。","A(1,2)、B(4,6)。","√(3²＋4²)＝5",["横の差と縦の差を使う"],"差を足すだけにしない。","横差²＋縦差²の平方根。",["座標","距離"]],
  ["prism-volume","空間図形","角柱・円柱の体積","🧱","底面積×高さ","柱体の体積を求めるとき。","底面積12cm²、高さ7cm。","12×7＝84cm³",["底面積を先に求める"],"底辺だけを掛けない。","同じ形を高さ分積む。",["角柱","円柱","体積"]],
  ["pyramid-volume","空間図形","角錐・円錐の体積","🔺","底面積×高さ÷3","錐体の体積を求めるとき。","底面積18cm²、高さ10cm。","18×10÷3＝60cm³",["母線ではなく高さ"],"÷3を忘れない。","とがった立体は柱の3分の1。",["角錐","円錐"]],
  ["cylinder-surface","空間図形","円柱の表面積","🥫","2πr²＋2πrh","円柱全体の表面積を求めるとき。","半径3cm、高さ5cm。","48πcm²",["底面2枚＋側面","側面積は円周×高さ"],"底面を1枚分しか足さない。","円2枚＋巻きつく長方形。",["円柱","表面積"]],
  ["cylinder-volume","空間図形","円柱の体積","🛢️","πr²h","円柱の半径と高さが分かるとき。","半径3cm、高さ5cm。","45πcm³",["底面積πr²に高さを掛ける"],"表面積と混同しない。","円の面積を高さ分積む。",["円柱","体積"]],
  ["cone-volume","空間図形","円錐の体積","🍦","πr²h÷3","円錐の半径と高さが分かるとき。","半径3cm、高さ8cm。","24πcm³",["母線ではなく高さ","最後に÷3"],"円柱の式のまま終わらない。","同じ円柱の3分の1。",["円錐","体積"]],
  ["sphere-surface","空間図形","球の表面積","🌐","4πr²","球の表面全体の面積を求めるとき。","半径5cm。","100πcm²",["半径を2乗","係数は4"],"体積のr³と混同しない。","大円4枚分。",["球","表面積"]],
  ["sphere-volume","空間図形","球の体積","🔮","4πr³÷3","球の体積を求めるとき。","半径3cm。","36πcm³",["半径を3乗","最後に÷3"],"表面積の式と混同しない。","4・π・r³、最後に÷3。",["球","体積"]],
].map(([id,category,title,icon,formula,useWhen,example,answer,points,mistake,memoryTip,keywords]) => ({
  id: id as string,
  category: category as Category,
  title: title as string,
  icon: icon as string,
  formula: formula as string,
  useWhen: useWhen as string,
  example: example as string,
  answer: answer as string,
  points: points as string[],
  mistake: mistake as string,
  memoryTip: memoryTip as string,
  keywords: keywords as string[],
}));

const categories: Array<"すべて" | Category> = [
  "すべて","角","平面図形","円","合同・相似","三平方","空間図形",
];

export default function FormulaList({
  favorites,
  onToggleFavorite,
  onlyFavorites = false,
}: FormulaListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("すべて");
  const [openIds, setOpenIds] = useState<string[]>([]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return formulas.filter((item) => {
      if (onlyFavorites && !favorites.includes(item.id)) return false;
      if (category !== "すべて" && item.category !== category) return false;
      if (!q) return true;
      return [
        item.title,item.category,item.formula,item.useWhen,item.example,item.answer,
        item.mistake,item.memoryTip,...item.points,...item.keywords,
      ].join(" ").toLowerCase().includes(q);
    });
  }, [category, favorites, onlyFavorites, query]);

  const availableCount = formulas.filter(
    (item) => !onlyFavorites || favorites.includes(item.id),
  ).length;

  const toggleOpen = (id: string) => {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const reset = () => {
    setQuery("");
    setCategory("すべて");
  };

  if (onlyFavorites && availableCount === 0) {
    return (
      <section className="rounded-[28px] border-2 border-dashed border-slate-400 bg-white p-10 text-center">
        <div className="text-5xl">⭐</div>
        <h2 className="mt-4 text-2xl font-black">お気に入りの公式はまだありません</h2>
        <p className="mt-2 text-sm font-bold text-slate-600">
          公式カードの星を押すと、ここに表示されます。
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#0f172a] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-violet-700">FORMULA LIBRARY</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {onlyFavorites ? "お気に入り公式" : "図形の公式・定理"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-600">
              公式・使う場面・例題・覚え方・よくあるミスをまとめて確認できます。
            </p>
          </div>
          <div className="flex gap-3">
            <Badge label="収録" value={`${availableCount}個`} />
            <Badge label="表示中" value={`${visible.length}個`} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔎</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例：三平方、円周、体積、合同"
              className="w-full rounded-2xl border-2 border-slate-950 bg-violet-50 py-3 pl-12 pr-4 text-sm font-bold outline-none focus:bg-white sm:text-base"
            />
          </label>
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl border-2 border-slate-950 bg-white px-5 py-3 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            条件をリセット
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full border-2 border-slate-950 px-4 py-2 text-sm font-black transition ${
                category === item
                  ? "bg-violet-300 shadow-[3px_3px_0_#0f172a]"
                  : "bg-white hover:bg-violet-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {visible.length === 0 ? (
        <section className="rounded-[28px] border-2 border-dashed border-slate-400 bg-white p-10 text-center">
          <div className="text-5xl">🧮</div>
          <h3 className="mt-4 text-xl font-black">条件に合う公式がありません</h3>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-2xl border-2 border-slate-950 bg-violet-300 px-5 py-3 font-black shadow-[3px_3px_0_#0f172a]"
          >
            すべて表示する
          </button>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {visible.map((item) => {
            const favorite = favorites.includes(item.id);
            const open = openIds.includes(item.id);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-[28px] border-2 border-slate-950 bg-white shadow-[6px_6px_0_#0f172a]"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border-2 border-slate-950 bg-violet-100 text-2xl">
                        {item.icon}
                      </div>
                      <div>
                        <span className="inline-flex rounded-full border-2 border-slate-950 bg-slate-100 px-3 py-1 text-xs font-black">
                          {item.category}
                        </span>
                        <h3 className="mt-2 text-xl font-black sm:text-2xl">{item.title}</h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item.id)}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 text-xl ${
                        favorite ? "bg-yellow-200" : "bg-white"
                      }`}
                      aria-label={favorite ? "お気に入りから外す" : "お気に入りに追加"}
                    >
                      {favorite ? "★" : "☆"}
                    </button>
                  </div>

                  <div className="mt-5 rounded-[22px] border-2 border-slate-950 bg-violet-50 p-5 text-center">
                    <p className="text-xs font-black tracking-[0.16em] text-violet-700">FORMULA</p>
                    <p className="mt-2 break-words text-xl font-black sm:text-2xl">{item.formula}</p>
                  </div>

                  <div className="mt-4 rounded-2xl border-2 border-slate-950 bg-sky-50 p-4">
                    <p className="text-sm font-black">どんなときに使う？</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{item.useWhen}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleOpen(item.id)}
                    className="mt-4 flex w-full items-center justify-between rounded-2xl border-2 border-slate-950 bg-white px-4 py-3 text-left font-black hover:bg-violet-50"
                  >
                    <span>{open ? "詳しい内容を閉じる" : "例題とポイントを見る"}</span>
                    <span className={open ? "rotate-180 transition" : "transition"}>▼</span>
                  </button>

                  {open && (
                    <div className="mt-4 space-y-4">
                      <section className="rounded-[20px] border-2 border-slate-950 bg-amber-50 p-4">
                        <p className="font-black">📝 例題</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{item.example}</p>
                        <div className="mt-3 rounded-xl border-2 border-dashed border-amber-500 bg-white px-4 py-3">
                          <p className="text-xs font-black text-amber-700">ANSWER</p>
                          <p className="mt-1 font-black">{item.answer}</p>
                        </div>
                      </section>

                      <section className="rounded-[20px] border-2 border-slate-950 bg-white p-4">
                        <p className="font-black">✅ ポイント</p>
                        <ul className="mt-3 space-y-2">
                          {item.points.map((point) => (
                            <li key={point} className="flex gap-3 text-sm font-bold leading-6 text-slate-700">
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Detail title="よくあるミス" icon="⚠️" body={item.mistake} className="bg-rose-50" />
                        <Detail title="覚え方" icon="💡" body={item.memoryTip} className="bg-emerald-50" />
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-slate-950 bg-violet-100 px-4 py-3 text-center">
      <p className="text-xs font-black text-slate-600">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function Detail({
  title,
  icon,
  body,
  className,
}: {
  title: string;
  icon: string;
  body: string;
  className: string;
}) {
  return (
    <section className={`rounded-[20px] border-2 border-slate-950 p-4 ${className}`}>
      <p className="font-black"><span className="mr-2">{icon}</span>{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{body}</p>
    </section>
  );
}