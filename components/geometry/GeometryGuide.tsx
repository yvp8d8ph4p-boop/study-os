"use client";

import { useMemo, useState } from "react";

type GeometrySection = "plane" | "solid" | "all";

type GeometryGuideProps = {
  section: GeometrySection;
  favorites: string[];
  learned: string[];
  onToggleFavorite: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onlyFavorites?: boolean;
};

type DiagramType =
  | "angle"
  | "parallel"
  | "triangle"
  | "congruence"
  | "similarity"
  | "pythagoras"
  | "circle"
  | "inscribed"
  | "polygon"
  | "symmetry"
  | "construction"
  | "prism"
  | "pyramid"
  | "sphere"
  | "net"
  | "projection"
  | "section"
  | "surface"
  | "volume"
  | "spatial-lines";

type GeometryTopic = {
  id: string;
  section: Exclude<GeometrySection, "all">;
  category: string;
  title: string;
  icon: string;
  summary: string;
  points: string[];
  mistake: string;
  tip: string;
  formula?: string;
  diagram: DiagramType;
  keywords: string[];
};

const topics: GeometryTopic[] = [
  {
    id: "plane-angle-basics",
    section: "plane",
    category: "角",
    title: "角の基本",
    icon: "📐",
    summary: "対頂角・一直線上の角・1点のまわりの角を整理します。",
    points: [
      "対頂角は等しい。",
      "一直線上に並ぶ角の和は180°。",
      "1点のまわりの角の和は360°。",
      "直角は90°として図に印を付ける。",
    ],
    mistake: "見た目だけで同じ角度だと決めず、等しい理由を確認する。",
    tip: "求めたい角の近くにある180°と360°を先に探す。",
    formula: "一直線：180°　1点のまわり：360°",
    diagram: "angle",
    keywords: ["角", "対頂角", "一直線", "360度"],
  },
  {
    id: "plane-parallel-lines",
    section: "plane",
    category: "角",
    title: "平行線と角",
    icon: "🛤️",
    summary: "同位角・錯角を使って、平行線を含む図形の角度を求めます。",
    points: [
      "2直線が平行なら同位角は等しい。",
      "2直線が平行なら錯角は等しい。",
      "同側内角の和は180°。",
      "同位角や錯角が等しいことから平行を証明できる。",
    ],
    mistake: "対応していない角を同位角・錯角として扱わない。",
    tip: "平行線を矢印で、等しい角を同じ印で図に書き込む。",
    formula: "同位角＝等しい　錯角＝等しい",
    diagram: "parallel",
    keywords: ["平行線", "同位角", "錯角", "同側内角"],
  },
  {
    id: "plane-triangle-basics",
    section: "plane",
    category: "三角形",
    title: "三角形の角",
    icon: "🔺",
    summary: "三角形の内角・外角と、二等辺三角形などの性質を確認します。",
    points: [
      "三角形の内角の和は180°。",
      "外角は、隣り合わない2つの内角の和に等しい。",
      "二等辺三角形の底角は等しい。",
      "正三角形の3つの角はすべて60°。",
    ],
    mistake: "外角と隣の内角を足さず、『離れた2つ』を見る。",
    tip: "等しい辺に印を付けてから底角を探す。",
    formula: "∠A＋∠B＋∠C＝180°",
    diagram: "triangle",
    keywords: ["三角形", "内角", "外角", "二等辺三角形", "正三角形"],
  },
  {
    id: "plane-congruence",
    section: "plane",
    category: "証明",
    title: "三角形の合同",
    icon: "🧩",
    summary: "2つの三角形が同じ形・同じ大きさであることを証明します。",
    points: [
      "3組の辺がそれぞれ等しい。",
      "2組の辺とその間の角がそれぞれ等しい。",
      "1組の辺とその両端の角がそれぞれ等しい。",
      "対応する頂点の順番をそろえて書く。",
    ],
    mistake: "『2辺と1角』だけでは不十分。角が2辺の間か確認する。",
    tip: "仮定、共通な辺、対頂角、平行線の角を順番に探す。",
    formula: "SSS・SAS・ASA",
    diagram: "congruence",
    keywords: ["合同", "証明", "合同条件", "対応"],
  },
  {
    id: "plane-similarity",
    section: "plane",
    category: "証明",
    title: "三角形の相似",
    icon: "🔍",
    summary: "形が同じ三角形を見つけ、辺の比や角度を求めます。",
    points: [
      "3組の辺の比がすべて等しい。",
      "2組の辺の比とその間の角がそれぞれ等しい。",
      "2組の角がそれぞれ等しい。",
      "対応する辺の比はすべて等しい。",
    ],
    mistake: "対応していない辺どうしで比を作らない。",
    tip: "相似記号の左右で、対応する頂点を同じ順番に書く。",
    formula: "対応する辺の比＝相似比",
    diagram: "similarity",
    keywords: ["相似", "相似条件", "相似比", "辺の比"],
  },
  {
    id: "plane-pythagoras",
    section: "plane",
    category: "三平方",
    title: "三平方の定理",
    icon: "📏",
    summary: "直角三角形の3辺の関係から、未知の辺の長さを求めます。",
    points: [
      "直角をはさむ2辺をa、b、斜辺をcとする。",
      "a²＋b²＝c²。",
      "最も長い辺が斜辺。",
      "平方根を使って長さを求める場合がある。",
    ],
    mistake: "斜辺は直角の向かい側。ここを間違えない。",
    tip: "3、4、5や5、12、13などの代表的な組を覚える。",
    formula: "a²＋b²＝c²",
    diagram: "pythagoras",
    keywords: ["三平方", "直角三角形", "斜辺", "平方根"],
  },
  {
    id: "plane-circle-basics",
    section: "plane",
    category: "円",
    title: "円の基本",
    icon: "⭕",
    summary: "半径・直径・弦・弧・中心角などの用語を整理します。",
    points: [
      "直径は半径の2倍。",
      "同じ円の半径はすべて等しい。",
      "中心から弦に垂線を引くと、その弦を二等分する。",
      "接線は接点を通る半径と垂直。",
    ],
    mistake: "弦と直径を混同しない。直径は必ず中心を通る。",
    tip: "中心と接点が見えたら、半径を補助線として引く。",
    formula: "直径＝2×半径",
    diagram: "circle",
    keywords: ["円", "半径", "直径", "弦", "接線"],
  },
  {
    id: "plane-inscribed-angle",
    section: "plane",
    category: "円",
    title: "円周角の定理",
    icon: "🌙",
    summary: "同じ弧に対する円周角と中心角の関係を使います。",
    points: [
      "同じ弧に対する円周角は等しい。",
      "中心角は同じ弧に対する円周角の2倍。",
      "直径に対する円周角は90°。",
      "円周角が等しいことから4点が同一円周上にあると判断できる。",
    ],
    mistake: "同じ弧を見ていない円周角は等しいとは限らない。",
    tip: "角の両辺が円周上のどの2点を結んでいるかを見る。",
    formula: "中心角＝2×円周角",
    diagram: "inscribed",
    keywords: ["円周角", "中心角", "弧", "直径"],
  },
  {
    id: "plane-polygons",
    section: "plane",
    category: "多角形",
    title: "多角形の角",
    icon: "⬡",
    summary: "内角の和・外角の和・正多角形の角度を求めます。",
    points: [
      "n角形の内角の和は（n－2）×180°。",
      "多角形の外角の和は常に360°。",
      "正n角形の1つの外角は360°÷n。",
      "正n角形の1つの内角は180°－外角。",
    ],
    mistake: "内角の和と1つの内角を混同しない。",
    tip: "正多角形では、まず外角を求めると計算が簡単。",
    formula: "内角の和＝（n－2）×180°",
    diagram: "polygon",
    keywords: ["多角形", "内角", "外角", "正多角形"],
  },
  {
    id: "plane-symmetry",
    section: "plane",
    category: "移動",
    title: "図形の移動と対称",
    icon: "🪞",
    summary: "平行移動・回転移動・線対称・点対称を整理します。",
    points: [
      "平行移動では、すべての点が同じ向きに同じ距離だけ動く。",
      "回転移動では、回転の中心から対応点までの距離が等しい。",
      "線対称では、対称の軸が対応点を結ぶ線分の垂直二等分線になる。",
      "点対称は180°の回転移動。",
    ],
    mistake: "線対称と点対称を混同しない。",
    tip: "対応点を結び、中心や対称の軸との関係を図に書く。",
    diagram: "symmetry",
    keywords: ["対称", "平行移動", "回転移動", "線対称", "点対称"],
  },
  {
    id: "plane-construction",
    section: "plane",
    category: "作図",
    title: "基本の作図",
    icon: "🧭",
    summary: "垂直二等分線・角の二等分線・垂線を作図します。",
    points: [
      "垂直二等分線上の点は、線分の両端から等距離。",
      "角の二等分線上の点は、角の2辺から等距離。",
      "円の中心は、2本の弦の垂直二等分線の交点。",
      "作図ではコンパスの跡を消さずに残す。",
    ],
    mistake: "目測で位置を決めず、必ず円弧の交点を使う。",
    tip: "『等しい距離の点を作る』と考える。",
    diagram: "construction",
    keywords: ["作図", "コンパス", "垂直二等分線", "角の二等分線"],
  },
  {
    id: "solid-prism-cylinder",
    section: "solid",
    category: "立体",
    title: "柱体・円柱",
    icon: "🧱",
    summary: "角柱・円柱の底面、側面、高さ、体積を整理します。",
    points: [
      "上下の底面は合同で平行。",
      "角柱の側面は長方形または平行四辺形。",
      "円柱の側面を開くと長方形。",
      "体積は底面積×高さ。",
    ],
    mistake: "底面どうしの垂直距離が高さ。斜めの辺ではない。",
    tip: "底面を先に決め、底面積を求めてから高さを掛ける。",
    formula: "体積＝底面積×高さ",
    diagram: "prism",
    keywords: ["角柱", "円柱", "底面積", "高さ", "体積"],
  },
  {
    id: "solid-pyramid-cone",
    section: "solid",
    category: "立体",
    title: "錐体・円錐",
    icon: "🔺",
    summary: "角錐・円錐の体積と、母線や高さの違いを確認します。",
    points: [
      "体積は底面積×高さ÷3。",
      "円錐の高さは頂点から底面へ垂直に下ろした長さ。",
      "母線は頂点から底面の円周までの斜めの長さ。",
      "同じ底面積・高さの柱体の3分の1の体積。",
    ],
    mistake: "母線を高さとして体積計算に使わない。",
    tip: "『柱の体積を求めて3で割る』と覚える。",
    formula: "体積＝底面積×高さ÷3",
    diagram: "pyramid",
    keywords: ["角錐", "円錐", "母線", "高さ", "体積"],
  },
  {
    id: "solid-sphere",
    section: "solid",
    category: "立体",
    title: "球",
    icon: "🌐",
    summary: "球の表面積と体積を、半径を使って求めます。",
    points: [
      "球の表面積は4πr²。",
      "球の体積は4πr³÷3。",
      "中心を通る平面で切った切り口は、半径rの円。",
      "直径が与えられたら、先に半径へ直す。",
    ],
    mistake: "表面積のr²と体積のr³を取り違えない。",
    tip: "面積は2乗、体積は3乗になることを単位でも確認する。",
    formula: "表面積＝4πr²　体積＝4πr³÷3",
    diagram: "sphere",
    keywords: ["球", "表面積", "体積", "半径"],
  },
  {
    id: "solid-net",
    section: "solid",
    category: "展開図",
    title: "展開図",
    icon: "🗺️",
    summary: "立体を切り開いた図から、面のつながりや表面積を考えます。",
    points: [
      "対応する辺の長さは等しい。",
      "組み立てたときに重なる頂点を確認する。",
      "円柱の側面は、横が底面の円周と等しい長方形。",
      "円錐の側面はおうぎ形。",
    ],
    mistake: "組み立て後に向かい合う面を間違えない。",
    tip: "1つの面を固定し、周りの面を順に起こす。",
    diagram: "net",
    keywords: ["展開図", "表面積", "円柱", "円錐", "おうぎ形"],
  },
  {
    id: "solid-projection",
    section: "solid",
    category: "見取図",
    title: "投影図",
    icon: "👁️",
    summary: "立体を正面・真上などから見た形を平面図として表します。",
    points: [
      "正面から見た図を立面図という。",
      "真上から見た図を平面図という。",
      "見えない辺を破線で表す場合がある。",
      "2つの図を組み合わせて立体を判断する。",
    ],
    mistake: "正面図だけで奥行きを決めつけない。",
    tip: "立面図で高さ、平面図で横と奥行きを確認する。",
    diagram: "projection",
    keywords: ["投影図", "立面図", "平面図", "見取図"],
  },
  {
    id: "solid-sections",
    section: "solid",
    category: "切断",
    title: "立体の切断",
    icon: "✂️",
    summary: "立体を平面で切ったときにできる切り口を考えます。",
    points: [
      "切断面が通る辺上の点を順に結ぶ。",
      "同じ面にある切断点どうしは線分で結ばれる。",
      "球の切り口は常に円。",
      "切る位置や角度によって切り口の形が変わる。",
    ],
    mistake: "同じ面にない点を、いきなり線分で結ばない。",
    tip: "1つの面ずつ切断線を追い、隣の面へつなげる。",
    diagram: "section",
    keywords: ["切断", "切り口", "立体", "平面"],
  },
  {
    id: "solid-surface-area",
    section: "solid",
    category: "表面積",
    title: "表面積",
    icon: "🎁",
    summary: "立体のすべての面の面積を展開図にして求めます。",
    points: [
      "表面積は、すべての面の面積の合計。",
      "柱体は底面2枚と側面の合計。",
      "円柱の側面積は円周×高さ。",
      "円錐の側面積はおうぎ形の面積。",
    ],
    mistake: "底面を1枚しか足さないミスに注意する。",
    tip: "展開図を描き、計算した面にチェックを付ける。",
    formula: "表面積＝底面積の合計＋側面積",
    diagram: "surface",
    keywords: ["表面積", "側面積", "底面積", "展開図"],
  },
  {
    id: "solid-volume",
    section: "solid",
    category: "体積",
    title: "体積の考え方",
    icon: "🧊",
    summary: "柱体・錐体・球の体積公式を使い分けます。",
    points: [
      "柱体は底面積×高さ。",
      "錐体は底面積×高さ÷3。",
      "球は4πr³÷3。",
      "複雑な立体は、基本立体に分けるか引き算する。",
    ],
    mistake: "長さの単位がそろっていないまま計算しない。",
    tip: "答えの単位がcm³やm³か最後に確認する。",
    formula: "柱：Bh　錐：Bh÷3　球：4πr³÷3",
    diagram: "volume",
    keywords: ["体積", "角柱", "円柱", "角錐", "円錐", "球"],
  },
  {
    id: "solid-spatial-lines",
    section: "solid",
    category: "位置関係",
    title: "空間内の直線と平面",
    icon: "📦",
    summary: "直線どうし、直線と平面、平面どうしの位置関係を整理します。",
    points: [
      "交わらず平行でもない2直線をねじれの位置という。",
      "平行な2直線は同じ平面上にある。",
      "直線と平面が垂直になる場合がある。",
      "2平面の交わりは直線になる。",
    ],
    mistake: "同じ平面上にない直線を平行と判断しない。",
    tip: "立方体の辺を使って、平行・垂直・ねじれを探す。",
    diagram: "spatial-lines",
    keywords: ["ねじれの位置", "直線", "平面", "垂直", "平行"],
  },
];

const categoryOrder = [
  "角",
  "三角形",
  "証明",
  "三平方",
  "円",
  "多角形",
  "移動",
  "作図",
  "立体",
  "展開図",
  "見取図",
  "切断",
  "表面積",
  "体積",
  "位置関係",
];

export default function GeometryGuide({
  section,
  favorites,
  learned,
  onToggleFavorite,
  onToggleLearned,
  onlyFavorites = false,
}: GeometryGuideProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [openCards, setOpenCards] = useState<string[]>([]);

  const availableTopics = useMemo(() => {
    return topics.filter((topic) => {
      if (section !== "all" && topic.section !== section) return false;
      if (onlyFavorites && !favorites.includes(topic.id)) return false;
      return true;
    });
  }, [favorites, onlyFavorites, section]);

  const categories = useMemo(() => {
    const existing = categoryOrder.filter((category) =>
      availableTopics.some((topic) => topic.category === category),
    );
    return ["すべて", ...existing];
  }, [availableTopics]);

  const visibleTopics = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return availableTopics.filter((topic) => {
      const matchesCategory =
        selectedCategory === "すべて" || topic.category === selectedCategory;
      const text = [
        topic.title,
        topic.category,
        topic.summary,
        topic.formula ?? "",
        ...topic.points,
        ...topic.keywords,
      ]
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!query || text.includes(query));
    });
  }, [availableTopics, searchText, selectedCategory]);

  const learnedCount = availableTopics.filter((topic) =>
    learned.includes(topic.id),
  ).length;

  function toggleCard(id: string) {
    setOpenCards((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function resetFilters() {
    setSearchText("");
    setSelectedCategory("すべて");
  }

  if (onlyFavorites && availableTopics.length === 0) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#0f172a] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-sky-700">
              GEOMETRY GUIDE
            </p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {onlyFavorites
                ? "お気に入りの図形解説"
                : section === "plane"
                  ? "平面図形"
                  : section === "solid"
                    ? "空間図形"
                    : "図形解説"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-600">
              図・重要ポイント・よくあるミスをセットで確認できます。
            </p>
          </div>

          <div className="flex gap-3">
            <CounterBadge label="表示" value={`${visibleTopics.length}件`} className="bg-sky-100" />
            <CounterBadge label="学習済み" value={`${learnedCount}件`} className="bg-emerald-100" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">図形解説を検索</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔎</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="例：円周角、合同、体積、展開図"
              className="w-full rounded-2xl border-2 border-slate-950 bg-sky-50 py-3 pl-12 pr-4 text-sm font-bold outline-none transition focus:bg-white sm:text-base"
            />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-2xl border-2 border-slate-950 bg-white px-5 py-3 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            条件をリセット
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const selected = category === selectedCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full border-2 border-slate-950 px-4 py-2 text-sm font-black transition ${
                  selected
                    ? "bg-sky-300 shadow-[3px_3px_0_#0f172a]"
                    : "bg-white hover:bg-sky-50"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {visibleTopics.length === 0 ? (
        <EmptyResult onReset={resetFilters} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {visibleTopics.map((topic) => {
            const isFavorite = favorites.includes(topic.id);
            const isLearned = learned.includes(topic.id);
            const isOpen = openCards.includes(topic.id);

            return (
              <article
                key={topic.id}
                className={`overflow-hidden rounded-[28px] border-2 border-slate-950 bg-white transition ${
                  isLearned
                    ? "shadow-[6px_6px_0_#86efac]"
                    : "shadow-[6px_6px_0_#0f172a]"
                }`}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border-2 border-slate-950 bg-sky-100 text-2xl">
                        {topic.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full border-2 border-slate-950 bg-slate-100 px-3 py-1 text-xs font-black">
                          {topic.category}
                        </span>
                        <h3 className="mt-2 text-xl font-black sm:text-2xl">{topic.title}</h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(topic.id)}
                      aria-label={isFavorite ? "お気に入りから外す" : "お気に入りに追加"}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 text-xl transition hover:-translate-y-0.5 ${
                        isFavorite ? "bg-yellow-200" : "bg-white"
                      }`}
                    >
                      {isFavorite ? "★" : "☆"}
                    </button>
                  </div>

                  <p className="mt-4 text-sm font-bold leading-7 text-slate-600">{topic.summary}</p>

                  <div className="mt-5 rounded-[22px] border-2 border-slate-950 bg-[#f8fcff] p-3">
                    <GeometryDiagram type={topic.diagram} />
                  </div>

                  {topic.formula && (
                    <div className="mt-4 rounded-2xl border-2 border-slate-950 bg-yellow-50 px-4 py-3">
                      <p className="text-xs font-black tracking-[0.14em] text-amber-700">KEY FORMULA</p>
                      <p className="mt-1 font-black">{topic.formula}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleCard(topic.id)}
                    className="mt-4 flex w-full items-center justify-between rounded-2xl border-2 border-slate-950 bg-sky-50 px-4 py-3 text-left font-black transition hover:bg-sky-100"
                  >
                    <span>{isOpen ? "詳しい解説を閉じる" : "詳しい解説を見る"}</span>
                    <span className={`text-lg transition ${isOpen ? "rotate-180" : ""}`}>▼</span>
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-[20px] border-2 border-slate-950 bg-white p-4">
                        <p className="font-black">重要ポイント</p>
                        <ul className="mt-3 space-y-2">
                          {topic.points.map((point) => (
                            <li key={point} className="flex gap-3 text-sm font-bold leading-6 text-slate-700">
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoBox title="よくあるミス" icon="⚠️" body={topic.mistake} className="bg-rose-50" />
                        <InfoBox title="解くコツ" icon="💡" body={topic.tip} className="bg-emerald-50" />
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t-2 border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => onToggleLearned(topic.id)}
                      className={`rounded-2xl border-2 border-slate-950 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 ${
                        isLearned ? "bg-emerald-300" : "bg-white hover:bg-emerald-50"
                      }`}
                    >
                      {isLearned ? "✓ 学習済み" : "学習済みにする"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CounterBadge({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={`rounded-2xl border-2 border-slate-950 px-4 py-3 text-center ${className}`}>
      <p className="text-xs font-black text-slate-600">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function InfoBox({ title, icon, body, className }: { title: string; icon: string; body: string; className: string }) {
  return (
    <div className={`rounded-[20px] border-2 border-slate-950 p-4 ${className}`}>
      <p className="font-black"><span className="mr-2">{icon}</span>{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{body}</p>
    </div>
  );
}

function EmptyResult({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[28px] border-2 border-dashed border-slate-400 bg-white p-10 text-center">
      <div className="text-5xl">🔎</div>
      <h3 className="mt-4 text-xl font-black">条件に合う項目がありません</h3>
      <p className="mt-2 text-sm font-bold text-slate-600">検索する言葉やカテゴリーを変えてみてください。</p>
      <button type="button" onClick={onReset} className="mt-5 rounded-2xl border-2 border-slate-950 bg-sky-300 px-5 py-3 font-black shadow-[3px_3px_0_#0f172a]">
        すべて表示する
      </button>
    </div>
  );
}

function GeometryDiagram({ type }: { type: DiagramType }) {
  const common = "h-[190px] w-full overflow-visible text-slate-950 sm:h-[210px]";
  const stroke = "currentColor";

  if (type === "angle") return <svg viewBox="0 0 360 200" className={common}><line x1="50" y1="150" x2="310" y2="150" stroke={stroke} strokeWidth="4"/><line x1="180" y1="150" x2="250" y2="45" stroke={stroke} strokeWidth="4"/><path d="M225 150 A45 45 0 0 0 205 112" fill="none" stroke="#0ea5e9" strokeWidth="6"/><text x="224" y="126" fontSize="18" fontWeight="800">x°</text></svg>;
  if (type === "parallel") return <svg viewBox="0 0 360 200" className={common}><line x1="40" y1="55" x2="320" y2="55" stroke={stroke} strokeWidth="4"/><line x1="40" y1="145" x2="320" y2="145" stroke={stroke} strokeWidth="4"/><line x1="120" y1="10" x2="240" y2="190" stroke="#0ea5e9" strokeWidth="4"/><path d="M153 55 A32 32 0 0 1 170 82" fill="none" stroke="#f59e0b" strokeWidth="7"/><path d="M190 145 A32 32 0 0 1 207 172" fill="none" stroke="#f59e0b" strokeWidth="7"/></svg>;
  if (type === "triangle") return <svg viewBox="0 0 360 200" className={common}><polygon points="180,25 55,165 310,165" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><text x="108" y="145" fontSize="17" fontWeight="800">内角の和＝180°</text></svg>;
  if (type === "congruence") return <svg viewBox="0 0 360 200" className={common}><polygon points="30,160 105,45 150,160" fill="#dbeafe" stroke={stroke} strokeWidth="4"/><polygon points="210,160 285,45 330,160" fill="#dbeafe" stroke={stroke} strokeWidth="4"/><text x="163" y="110" fontSize="28" fontWeight="900">≡</text></svg>;
  if (type === "similarity") return <svg viewBox="0 0 360 200" className={common}><polygon points="35,165 110,45 150,165" fill="#cffafe" stroke={stroke} strokeWidth="4"/><polygon points="210,165 265,80 295,165" fill="#cffafe" stroke={stroke} strokeWidth="4"/><text x="164" y="115" fontSize="28" fontWeight="900">∽</text></svg>;
  if (type === "pythagoras") return <svg viewBox="0 0 360 200" className={common}><polygon points="70,165 70,45 285,165" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><rect x="70" y="145" width="20" height="20" fill="none" stroke="#0ea5e9" strokeWidth="3"/><text x="205" y="50" fontSize="19" fontWeight="900">a²＋b²＝c²</text></svg>;
  if (type === "circle") return <svg viewBox="0 0 360 200" className={common}><circle cx="180" cy="100" r="75" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><line x1="105" y1="100" x2="255" y2="100" stroke="#0ea5e9" strokeWidth="4"/><line x1="180" y1="100" x2="230" y2="45" stroke="#34d399" strokeWidth="4"/><circle cx="180" cy="100" r="5" fill="currentColor"/></svg>;
  if (type === "inscribed") return <svg viewBox="0 0 360 200" className={common}><circle cx="180" cy="100" r="78" fill="#f0f9ff" stroke={stroke} strokeWidth="4"/><line x1="110" y1="135" x2="250" y2="135" stroke="#0ea5e9" strokeWidth="4"/><line x1="110" y1="135" x2="180" y2="25" stroke="#0ea5e9" strokeWidth="4"/><line x1="250" y1="135" x2="180" y2="25" stroke="#0ea5e9" strokeWidth="4"/><text x="175" y="60" fontSize="18" fontWeight="800">x°</text><text x="165" y="125" fontSize="18" fontWeight="800">2x°</text></svg>;
  if (type === "polygon") return <svg viewBox="0 0 360 200" className={common}><polygon points="180,20 300,85 255,175 105,175 60,85" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><line x1="180" y1="20" x2="255" y2="175" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="8 6"/><line x1="180" y1="20" x2="105" y2="175" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="8 6"/></svg>;
  if (type === "symmetry") return <svg viewBox="0 0 360 200" className={common}><line x1="180" y1="20" x2="180" y2="180" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="8 6"/><polygon points="60,150 135,45 145,150" fill="#dbeafe" stroke={stroke} strokeWidth="4"/><polygon points="300,150 225,45 215,150" fill="#dbeafe" stroke={stroke} strokeWidth="4"/></svg>;
  if (type === "construction") return <svg viewBox="0 0 360 200" className={common}><line x1="75" y1="100" x2="285" y2="100" stroke={stroke} strokeWidth="4"/><circle cx="75" cy="100" r="115" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="7 6"/><circle cx="285" cy="100" r="115" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="7 6"/><line x1="180" y1="20" x2="180" y2="180" stroke="#34d399" strokeWidth="4"/></svg>;
  if (type === "prism") return <svg viewBox="0 0 360 200" className={common}><polygon points="80,55 225,55 280,95 135,95" fill="#bae6fd" stroke={stroke} strokeWidth="4"/><polygon points="80,55 135,95 135,170 80,130" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><polygon points="135,95 280,95 280,170 135,170" fill="#f0f9ff" stroke={stroke} strokeWidth="4"/></svg>;
  if (type === "pyramid") return <svg viewBox="0 0 360 200" className={common}><polygon points="180,25 70,150 290,150" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><line x1="180" y1="25" x2="180" y2="150" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="7 6"/><line x1="70" y1="150" x2="210" y2="180" stroke={stroke} strokeWidth="4"/><line x1="290" y1="150" x2="210" y2="180" stroke={stroke} strokeWidth="4"/><line x1="180" y1="25" x2="210" y2="180" stroke={stroke} strokeWidth="4"/></svg>;
  if (type === "sphere") return <svg viewBox="0 0 360 200" className={common}><circle cx="180" cy="100" r="78" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><ellipse cx="180" cy="100" rx="78" ry="25" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="7 6"/><line x1="180" y1="100" x2="245" y2="100" stroke="#34d399" strokeWidth="4"/></svg>;
  if (type === "net") return <svg viewBox="0 0 360 200" className={common}><rect x="110" y="25" width="70" height="50" fill="#bae6fd" stroke={stroke} strokeWidth="3"/><rect x="40" y="75" width="70" height="50" fill="#e0f2fe" stroke={stroke} strokeWidth="3"/><rect x="110" y="75" width="70" height="50" fill="#e0f2fe" stroke={stroke} strokeWidth="3"/><rect x="180" y="75" width="70" height="50" fill="#e0f2fe" stroke={stroke} strokeWidth="3"/><rect x="250" y="75" width="70" height="50" fill="#e0f2fe" stroke={stroke} strokeWidth="3"/><rect x="110" y="125" width="70" height="50" fill="#bae6fd" stroke={stroke} strokeWidth="3"/></svg>;
  if (type === "projection") return <svg viewBox="0 0 360 200" className={common}><rect x="40" y="45" width="110" height="110" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><rect x="210" y="70" width="110" height="85" fill="#dcfce7" stroke={stroke} strokeWidth="4"/><text x="66" y="180" fontSize="16" fontWeight="800">立面図</text><text x="236" y="180" fontSize="16" fontWeight="800">平面図</text></svg>;
  if (type === "section") return <svg viewBox="0 0 360 200" className={common}><polygon points="90,35 250,35 300,75 140,75" fill="#bae6fd" stroke={stroke} strokeWidth="4"/><polygon points="90,35 140,75 140,170 90,130" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><polygon points="140,75 300,75 300,170 140,170" fill="#f0f9ff" stroke={stroke} strokeWidth="4"/><polygon points="110,55 270,55 270,145 110,115" fill="#fde68a" fillOpacity="0.75" stroke="#f59e0b" strokeWidth="4"/></svg>;
  if (type === "surface") return <svg viewBox="0 0 360 200" className={common}><rect x="75" y="45" width="210" height="110" rx="8" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><line x1="145" y1="45" x2="145" y2="155" stroke="#0ea5e9" strokeWidth="3"/><line x1="215" y1="45" x2="215" y2="155" stroke="#0ea5e9" strokeWidth="3"/></svg>;
  if (type === "volume") return <svg viewBox="0 0 360 200" className={common}><rect x="50" y="75" width="80" height="95" fill="#bae6fd" stroke={stroke} strokeWidth="4"/><polygon points="180,170 230,45 280,170" fill="#fde68a" stroke={stroke} strokeWidth="4"/><circle cx="325" cy="115" r="38" fill="#dcfce7" stroke={stroke} strokeWidth="4"/></svg>;
  return <svg viewBox="0 0 360 200" className={common}><polygon points="80,45 235,45 290,85 135,85" fill="#dbeafe" stroke={stroke} strokeWidth="4"/><polygon points="80,45 135,85 135,170 80,130" fill="#e0f2fe" stroke={stroke} strokeWidth="4"/><polygon points="135,85 290,85 290,170 135,170" fill="#f8fafc" stroke={stroke} strokeWidth="4"/><line x1="80" y1="45" x2="235" y2="45" stroke="#0ea5e9" strokeWidth="6"/><line x1="290" y1="85" x2="290" y2="170" stroke="#34d399" strokeWidth="6"/></svg>;
}