"use client";

import Link from "next/link";
import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type CategoryId =
  | "authors"
  | "works"
  | "techniques"
  | "kanshi"
  | "history"
  | "favorites";

type LiteratureItem = {
  id: string;
  category: Exclude<CategoryId, "favorites">;
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  details: {
    label: string;
    value: string;
  }[];
  examples?: string[];
  points?: string[];
  tags: string[];
  custom?: boolean;
};

type SavedData = {
  favoriteIds: string[];
  itemNotes: Record<string, string>;
  overallNote: string;
  customItems: LiteratureItem[];
};

type CustomForm = {
  category: Exclude<CategoryId, "favorites">;
  title: string;
  subtitle: string;
  summary: string;
  example: string;
  point: string;
};

const storageKey = "study-os-japanese-literature-v1";

const categories: {
  id: CategoryId;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "authors",
    label: "作者",
    icon: "👤",
    description: "代表的な作者と作品を確認",
  },
  {
    id: "works",
    label: "作品",
    icon: "📕",
    description: "作品の内容と入試ポイント",
  },
  {
    id: "techniques",
    label: "表現技法",
    icon: "📝",
    description: "意味・効果・例文を整理",
  },
  {
    id: "kanshi",
    label: "漢詩",
    icon: "🏮",
    description: "形式・構成・表現を確認",
  },
  {
    id: "history",
    label: "文学史",
    icon: "📜",
    description: "時代ごとの作品を確認",
  },
  {
    id: "favorites",
    label: "お気に入り",
    icon: "⭐",
    description: "登録した項目だけを復習",
  },
];

const builtInItems: LiteratureItem[] = [
  {
    id: "author-natsume-soseki",
    category: "authors",
    title: "夏目漱石",
    subtitle: "明治・大正の小説家",
    icon: "👤",
    summary:
      "近代日本文学を代表する作家。人間の内面や近代社会の孤独を描いた作品が多い。",
    details: [
      { label: "生没年", value: "1867年〜1916年" },
      { label: "代表作品", value: "『吾輩は猫である』『坊っちゃん』『こころ』" },
      { label: "時代", value: "明治〜大正" },
    ],
    points: [
      "『こころ』では、人間の罪悪感や孤独が重要なテーマ。",
      "近代化する社会と個人の心の問題を描く。",
    ],
    tags: ["近代文学", "小説", "頻出"],
  },
  {
    id: "author-akutagawa",
    category: "authors",
    title: "芥川龍之介",
    subtitle: "大正の小説家",
    icon: "👤",
    summary:
      "古典を題材にしながら、人間の心の弱さや矛盾を鋭く描いた。",
    details: [
      { label: "生没年", value: "1892年〜1927年" },
      { label: "代表作品", value: "『羅生門』『鼻』『蜘蛛の糸』" },
      { label: "時代", value: "大正〜昭和初期" },
    ],
    points: [
      "古典作品を現代的に作り直した作品が多い。",
      "人物の心理変化を丁寧に読む。",
    ],
    tags: ["近代文学", "小説", "頻出"],
  },
  {
    id: "author-dazai",
    category: "authors",
    title: "太宰治",
    subtitle: "昭和の小説家",
    icon: "👤",
    summary:
      "人間の弱さや苦悩を、告白的で読みやすい文章によって描いた。",
    details: [
      { label: "生没年", value: "1909年〜1948年" },
      { label: "代表作品", value: "『走れメロス』『人間失格』『斜陽』" },
      { label: "時代", value: "昭和" },
    ],
    points: [
      "『走れメロス』では友情・信頼・正義が中心テーマ。",
      "語り手の感情や心理の揺れに注目する。",
    ],
    tags: ["近代文学", "小説", "頻出"],
  },
  {
    id: "author-miyazawa",
    category: "authors",
    title: "宮沢賢治",
    subtitle: "詩人・童話作家",
    icon: "👤",
    summary:
      "自然・宇宙・生命を独特の言葉で描いた。農業や科学への関心も深かった。",
    details: [
      { label: "生没年", value: "1896年〜1933年" },
      { label: "代表作品", value: "『銀河鉄道の夜』『注文の多い料理店』『雨ニモマケズ』" },
      { label: "時代", value: "大正〜昭和" },
    ],
    points: [
      "自然と人間の関係、自己犠牲、幸福が重要なテーマ。",
      "独特の擬音語・擬態語にも注目。",
    ],
    tags: ["童話", "詩", "頻出"],
  },
  {
    id: "work-kokoro",
    category: "works",
    title: "こころ",
    subtitle: "夏目漱石",
    icon: "📕",
    summary:
      "「私」と「先生」の交流を通して、近代人の孤独や罪悪感を描いた小説。",
    details: [
      { label: "作者", value: "夏目漱石" },
      { label: "発表", value: "1914年" },
      { label: "ジャンル", value: "小説" },
      { label: "主な人物", value: "私・先生・K" },
    ],
    points: [
      "先生が抱える罪悪感と孤独が中心。",
      "手紙の形式によって先生の過去が明かされる。",
    ],
    tags: ["小説", "明治・大正", "頻出"],
  },
  {
    id: "work-rashomon",
    category: "works",
    title: "羅生門",
    subtitle: "芥川龍之介",
    icon: "📕",
    summary:
      "生きるための善悪をめぐり、下人の心が大きく変化する様子を描く。",
    details: [
      { label: "作者", value: "芥川龍之介" },
      { label: "発表", value: "1915年" },
      { label: "題材", value: "『今昔物語集』" },
      { label: "主な人物", value: "下人・老婆" },
    ],
    points: [
      "下人の心理変化を追う。",
      "老婆の論理が下人の決断に影響する。",
    ],
    tags: ["小説", "古典題材", "頻出"],
  },
  {
    id: "work-hashire-melos",
    category: "works",
    title: "走れメロス",
    subtitle: "太宰治",
    icon: "📕",
    summary:
      "親友との約束を守るために走り続けるメロスを通して、友情と信頼を描く。",
    details: [
      { label: "作者", value: "太宰治" },
      { label: "発表", value: "1940年" },
      { label: "ジャンル", value: "短編小説" },
      { label: "主な人物", value: "メロス・セリヌンティウス・王" },
    ],
    points: [
      "メロスの心情の変化を順番に追う。",
      "友情だけでなく、人間への信頼の回復もテーマ。",
    ],
    tags: ["小説", "友情", "頻出"],
  },
  {
    id: "technique-taigendome",
    category: "techniques",
    title: "体言止め",
    subtitle: "文末を名詞で終える",
    icon: "📝",
    summary:
      "文末を体言（主に名詞）で終え、余韻や強い印象を残す表現技法。",
    details: [
      { label: "意味", value: "文の終わりを名詞にする。" },
      { label: "主な効果", value: "余韻・強調・印象付け" },
    ],
    examples: ["忘れられない、あの夏。", "窓の外に広がる青い海。"],
    points: [
      "文末が名詞なら、まず体言止めを疑う。",
      "効果は文脈に合わせて『余韻』『強調』などと答える。",
    ],
    tags: ["表現技法", "頻出", "文末"],
  },
  {
    id: "technique-tsuiku",
    category: "techniques",
    title: "対句",
    subtitle: "似た形の語句を対応させる",
    icon: "📝",
    summary:
      "構造や意味が対応する二つの語句を並べ、リズムや印象を強める。",
    details: [
      { label: "意味", value: "似た構造の語句を対になるように並べる。" },
      { label: "主な効果", value: "リズム・強調・対比" },
    ],
    examples: ["山は高く、海は深い。", "見る者は笑い、聞く者は涙する。"],
    points: [
      "文の形や品詞の並びが対応しているかを見る。",
      "反対の内容だけでなく、似た内容を並べる場合もある。",
    ],
    tags: ["表現技法", "頻出", "リズム"],
  },
  {
    id: "technique-tochi",
    category: "techniques",
    title: "倒置法",
    subtitle: "語順を入れ替える",
    icon: "📝",
    summary:
      "通常とは異なる語順にし、強調したい言葉を目立たせる。",
    details: [
      { label: "意味", value: "普通の語順を逆にする。" },
      { label: "主な効果", value: "強調・余韻・感情の高まり" },
    ],
    examples: ["美しい、その夕焼けは。", "忘れない、私はあの日を。"],
    points: [
      "普通の語順に戻せるか確認する。",
      "前や後ろに移された語が強調される。",
    ],
    tags: ["表現技法", "頻出", "語順"],
  },
  {
    id: "technique-repetition",
    category: "techniques",
    title: "反復法",
    subtitle: "同じ言葉を繰り返す",
    icon: "📝",
    summary:
      "同じ語句を繰り返し、意味や感情、リズムを強める。",
    details: [
      { label: "意味", value: "同じ言葉・表現を繰り返す。" },
      { label: "主な効果", value: "強調・リズム・感情表現" },
    ],
    examples: ["走れ、走れ、どこまでも。", "まだだ、まだ終わらない。"],
    points: [
      "同じ語句が意図的に繰り返されているかを見る。",
      "何を強調しているのかまで答える。",
    ],
    tags: ["表現技法", "頻出", "反復"],
  },
  {
    id: "technique-simile",
    category: "techniques",
    title: "直喩",
    subtitle: "「ようだ」などを使う比喩",
    icon: "📝",
    summary:
      "「ようだ」「みたいだ」などを使い、あるものを別のものにたとえる。",
    details: [
      { label: "意味", value: "たとえであることを明示する比喩。" },
      { label: "主な効果", value: "様子を具体的・印象的に伝える。" },
    ],
    examples: ["雪のように白い。", "ライオンのように勇敢だ。"],
    points: [
      "「ようだ」「みたいだ」「ごとし」などが目印。",
      "何を何にたとえているか確認する。",
    ],
    tags: ["比喩", "頻出", "たとえ"],
  },
  {
    id: "technique-metaphor",
    category: "techniques",
    title: "隠喩",
    subtitle: "たとえを直接言い切る",
    icon: "📝",
    summary:
      "「ようだ」などを使わず、あるものを別のものとして直接表現する。",
    details: [
      { label: "意味", value: "たとえを示す言葉を使わない比喩。" },
      { label: "主な効果", value: "強い印象・イメージの凝縮" },
    ],
    examples: ["彼はクラスの太陽だ。", "青春は長い坂道だ。"],
    points: [
      "文字どおりの意味では不自然な表現に注目。",
      "たとえられるものと、たとえるものを区別する。",
    ],
    tags: ["比喩", "頻出", "たとえ"],
  },
  {
    id: "technique-personification",
    category: "techniques",
    title: "擬人法",
    subtitle: "人でないものを人のように表す",
    icon: "📝",
    summary:
      "自然や物を、人間のように動いたり感じたりするものとして表す。",
    details: [
      { label: "意味", value: "人間でないものに人間の動作や感情を与える。" },
      { label: "主な効果", value: "情景を生き生きと印象的にする。" },
    ],
    examples: ["風がささやく。", "太陽が笑っている。"],
    points: [
      "主語が人間以外なのに、人間らしい動作をしているかを見る。",
      "比喩の一種として扱われる。",
    ],
    tags: ["比喩", "頻出", "擬人"],
  },
  {
    id: "technique-onomatopoeia",
    category: "techniques",
    title: "擬音語・擬態語",
    subtitle: "音や様子を言葉で表す",
    icon: "📝",
    summary:
      "実際の音や、音のない状態・動き・感情を感覚的な言葉で表す。",
    details: [
      { label: "擬音語", value: "実際に聞こえる音を表す。" },
      { label: "擬態語", value: "状態・動き・感情などを表す。" },
    ],
    examples: ["雨がザーザー降る。", "星がきらきら光る。"],
    points: [
      "音が実際に聞こえるなら擬音語。",
      "様子や状態を表しているなら擬態語。",
    ],
    tags: ["表現技法", "音", "様子"],
  },
  {
    id: "kanshi-gogon",
    category: "kanshi",
    title: "五言",
    subtitle: "一句が五字",
    icon: "🏮",
    summary:
      "漢詩で、一つの句が五つの漢字からできている形式。",
    details: [
      { label: "五言絶句", value: "一句五字・全四句・合計二十字" },
      { label: "五言律詩", value: "一句五字・全八句・合計四十字" },
    ],
    points: [
      "まず一行の漢字数を数える。",
      "四句なら絶句、八句なら律詩。",
    ],
    tags: ["漢詩", "形式", "基本"],
  },
  {
    id: "kanshi-shichigon",
    category: "kanshi",
    title: "七言",
    subtitle: "一句が七字",
    icon: "🏮",
    summary:
      "漢詩で、一つの句が七つの漢字からできている形式。",
    details: [
      { label: "七言絶句", value: "一句七字・全四句・合計二十八字" },
      { label: "七言律詩", value: "一句七字・全八句・合計五十六字" },
    ],
    points: [
      "五言と同じく、字数と句数を組み合わせて判断する。",
    ],
    tags: ["漢詩", "形式", "基本"],
  },
  {
    id: "kanshi-zekku",
    category: "kanshi",
    title: "絶句",
    subtitle: "全四句の漢詩",
    icon: "🏮",
    summary:
      "四つの句で構成される漢詩。五言絶句と七言絶句がある。",
    details: [
      { label: "句数", value: "四句" },
      { label: "構成", value: "起・承・転・結" },
    ],
    points: [
      "四句なので、起承転結が一つずつ対応する。",
      "短い中で情景や心情の変化を読む。",
    ],
    tags: ["漢詩", "形式", "起承転結"],
  },
  {
    id: "kanshi-risshi",
    category: "kanshi",
    title: "律詩",
    subtitle: "全八句の漢詩",
    icon: "🏮",
    summary:
      "八つの句で構成される漢詩。五言律詩と七言律詩がある。",
    details: [
      { label: "句数", value: "八句" },
      { label: "対句", value: "第三・四句、第五・六句が対句になるのが基本" },
    ],
    points: [
      "絶句より長く、対句の規則が重要。",
      "首聯・頷聯・頸聯・尾聯の四組に分けて考える。",
    ],
    tags: ["漢詩", "形式", "対句"],
  },
  {
    id: "kanshi-in",
    category: "kanshi",
    title: "押韻",
    subtitle: "句末の音をそろえる",
    icon: "🏮",
    summary:
      "決められた句の最後に、同じ響きを持つ漢字を置く。",
    details: [
      { label: "絶句", value: "基本的に第二句・第四句。第一句にも置く場合がある。" },
      { label: "律詩", value: "基本的に偶数句。第一句にも置く場合がある。" },
    ],
    points: [
      "書き下し文ではなく、漢文の句末の漢字を見る。",
      "同じ母音の響きを持つ漢字を探す。",
    ],
    tags: ["漢詩", "表現", "頻出"],
  },
  {
    id: "kanshi-tsuiku",
    category: "kanshi",
    title: "漢詩の対句",
    subtitle: "語句や構造を対応させる",
    icon: "🏮",
    summary:
      "二つの句で、語の意味・品詞・構造を対応させる表現。",
    details: [
      { label: "効果", value: "リズム・対比・情景の強調" },
      { label: "律詩", value: "第三・四句、第五・六句で用いられるのが基本" },
    ],
    examples: ["山と川、朝と夕、天と地などを対応させる。"],
    points: [
      "同じ位置にある語の関係を見る。",
      "現代文の対句と共通する考え方。",
    ],
    tags: ["漢詩", "対句", "頻出"],
  },
  {
    id: "history-nara",
    category: "history",
    title: "奈良時代",
    subtitle: "古代文学の成立",
    icon: "📜",
    summary:
      "神話・歴史・歌謡が書物としてまとめられた時代。",
    details: [
      { label: "代表作品", value: "『古事記』『日本書紀』『万葉集』" },
      { label: "特徴", value: "漢字を用いて日本語を表記した。" },
    ],
    points: [
      "『万葉集』は現存する最古の歌集。",
      "身分を問わず幅広い人々の歌を収める。",
    ],
    tags: ["文学史", "奈良", "古代"],
  },
  {
    id: "history-heian",
    category: "history",
    title: "平安時代",
    subtitle: "かな文学の発達",
    icon: "📜",
    summary:
      "かな文字の発達により、物語・随筆・日記・和歌が大きく発展した。",
    details: [
      { label: "代表作品", value: "『古今和歌集』『枕草子』『源氏物語』『土佐日記』" },
      { label: "主な作者", value: "清少納言・紫式部・紀貫之" },
    ],
    points: [
      "『枕草子』は随筆、『源氏物語』は物語。",
      "かな文学と女流文学が重要。",
    ],
    tags: ["文学史", "平安", "古典"],
  },
  {
    id: "history-kamakura",
    category: "history",
    title: "鎌倉時代",
    subtitle: "武士と無常観",
    icon: "📜",
    summary:
      "武士の時代を背景に、軍記物語や随筆が発達した。",
    details: [
      { label: "代表作品", value: "『平家物語』『方丈記』『徒然草』" },
      { label: "特徴", value: "無常観・武士の活躍・仏教思想" },
    ],
    points: [
      "『平家物語』は軍記物語。",
      "『方丈記』『徒然草』は随筆。",
    ],
    tags: ["文学史", "鎌倉", "古典"],
  },
  {
    id: "history-edo",
    category: "history",
    title: "江戸時代",
    subtitle: "庶民文学の発展",
    icon: "📜",
    summary:
      "出版文化が広がり、俳諧・浮世草子・人形浄瑠璃などが発達した。",
    details: [
      { label: "代表者", value: "松尾芭蕉・井原西鶴・近松門左衛門" },
      { label: "代表作品", value: "『奥の細道』『曽根崎心中』" },
    ],
    points: [
      "松尾芭蕉は俳諧を芸術として高めた。",
      "町人文化との結び付きが強い。",
    ],
    tags: ["文学史", "江戸", "近世"],
  },
  {
    id: "history-modern",
    category: "history",
    title: "明治以降",
    subtitle: "近代文学の成立",
    icon: "📜",
    summary:
      "西洋文化の影響を受け、近代的な小説・詩・評論が発達した。",
    details: [
      { label: "主な作者", value: "夏目漱石・森鷗外・樋口一葉・芥川龍之介" },
      { label: "特徴", value: "個人の内面・近代社会・自我の問題" },
    ],
    points: [
      "作者と代表作品の組み合わせを整理する。",
      "明治・大正・昭和の時代区分も確認する。",
    ],
    tags: ["文学史", "近代", "頻出"],
  },
];

const defaultSavedData: SavedData = {
  favoriteIds: [],
  itemNotes: {},
  overallNote: "",
  customItems: [],
};

const emptyCustomForm: CustomForm = {
  category: "techniques",
  title: "",
  subtitle: "",
  summary: "",
  example: "",
  point: "",
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "38px 18px 64px",
    background:
      "linear-gradient(180deg, #FFF7ED 0%, #F8FAFC 48%, #FFFFFF 100%)",
    color: "#0F172A",
  },
  container: {
    width: "100%",
    maxWidth: "1160px",
    margin: "0 auto",
  },
  card: {
    border: "1px solid #E2E8F0",
    borderRadius: "22px",
    background: "#FFFFFF",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.07)",
  },
  button: {
    border: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
};

export default function LiteraturePage() {
  const [activeCategory, setActiveCategory] =
    useState<CategoryId>("techniques");
  const [selectedId, setSelectedId] =
    useState<string>("technique-taigendome");
  const [searchText, setSearchText] = useState("");
  const [savedData, setSavedData] =
    useState<SavedData>(defaultSavedData);
  const [loaded, setLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customForm, setCustomForm] =
    useState<CustomForm>(emptyCustomForm);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SavedData>;

        setSavedData({
          favoriteIds: parsed.favoriteIds ?? [],
          itemNotes: parsed.itemNotes ?? {},
          overallNote: parsed.overallNote ?? "",
          customItems: parsed.customItems ?? [],
        });
      }
    } catch {
      setSavedData(defaultSavedData);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(savedData));
  }, [savedData, loaded]);

  const allItems = useMemo(
    () => [...builtInItems, ...savedData.customItems],
    [savedData.customItems],
  );

  const visibleItems = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return allItems.filter((item) => {
      const categoryMatch =
        activeCategory === "favorites"
          ? savedData.favoriteIds.includes(item.id)
          : item.category === activeCategory;

      const searchTarget = [
        item.title,
        item.subtitle,
        item.summary,
        item.tags.join(" "),
        item.details.map((detail) => detail.value).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return (
        categoryMatch &&
        (!normalizedSearch ||
          searchTarget.includes(normalizedSearch))
      );
    });
  }, [
    activeCategory,
    allItems,
    savedData.favoriteIds,
    searchText,
  ]);

  useEffect(() => {
    if (
      visibleItems.length > 0 &&
      !visibleItems.some((item) => item.id === selectedId)
    ) {
      setSelectedId(visibleItems[0].id);
    }
  }, [visibleItems, selectedId]);

  const selectedItem =
    allItems.find((item) => item.id === selectedId) ??
    visibleItems[0] ??
    null;

  const toggleFavorite = (itemId: string) => {
    setSavedData((current) => ({
      ...current,
      favoriteIds: current.favoriteIds.includes(itemId)
        ? current.favoriteIds.filter((id) => id !== itemId)
        : [...current.favoriteIds, itemId],
    }));
  };

  const addCustomItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customForm.title.trim() || !customForm.summary.trim()) {
      return;
    }

    const newItem: LiteratureItem = {
      id: `custom-${Date.now()}`,
      category: customForm.category,
      title: customForm.title.trim(),
      subtitle:
        customForm.subtitle.trim() || "自分で追加した項目",
      icon:
        customForm.category === "authors"
          ? "👤"
          : customForm.category === "works"
            ? "📕"
            : customForm.category === "kanshi"
              ? "🏮"
              : customForm.category === "history"
                ? "📜"
                : "📝",
      summary: customForm.summary.trim(),
      details: [
        {
          label: "追加項目",
          value: "自分で登録した内容",
        },
      ],
      examples: customForm.example.trim()
        ? [customForm.example.trim()]
        : undefined,
      points: customForm.point.trim()
        ? [customForm.point.trim()]
        : undefined,
      tags: ["自分で追加"],
      custom: true,
    };

    setSavedData((current) => ({
      ...current,
      customItems: [...current.customItems, newItem],
    }));

    setActiveCategory(customForm.category);
    setSelectedId(newItem.id);
    setCustomForm(emptyCustomForm);
    setShowAddForm(false);
  };

  const deleteCustomItem = (itemId: string) => {
    setSavedData((current) => ({
      ...current,
      customItems: current.customItems.filter(
        (item) => item.id !== itemId,
      ),
      favoriteIds: current.favoriteIds.filter(
        (id) => id !== itemId,
      ),
      itemNotes: Object.fromEntries(
        Object.entries(current.itemNotes).filter(
          ([id]) => id !== itemId,
        ),
      ),
    }));
  };

  const activeCategoryData =
    categories.find((category) => category.id === activeCategory) ??
    categories[0];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header
          style={{
            marginBottom: "34px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: "88px",
              height: "88px",
              marginBottom: "16px",
              borderRadius: "28px",
              background: "#FFFFFF",
              boxShadow:
                "0 12px 30px rgba(194, 65, 12, 0.14)",
              fontSize: "48px",
            }}
          >
            📚
          </div>

          <h1
            style={{
              margin: 0,
              color: "#C2410C",
              fontSize: "clamp(42px, 8vw, 64px)",
            }}
          >
            文学
          </h1>

          <p
            style={{
              maxWidth: "720px",
              margin: "12px auto 0",
              color: "#64748B",
              fontSize: "18px",
              lineHeight: 1.8,
            }}
          >
            作者・作品・表現技法・漢詩・文学史を、自分専用の辞典として整理するページ
          </p>
        </header>

        <section
          style={{
            ...styles.card,
            marginBottom: "24px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(155px, 1fr))",
              gap: "10px",
            }}
          >
            {categories.map((category) => {
              const active = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchText("");
                  }}
                  style={{
                    ...styles.button,
                    padding: "15px 12px",
                    border: active
                      ? "2px solid #EA580C"
                      : "1px solid #E2E8F0",
                    borderRadius: "16px",
                    background: active
                      ? "#FFEDD5"
                      : "#FFFFFF",
                    color: active ? "#C2410C" : "#475569",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "25px",
                    }}
                  >
                    {category.icon}
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "7px",
                      fontSize: "17px",
                    }}
                  >
                    {category.label}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",
                      fontSize: "12px",
                      lineHeight: 1.45,
                    }}
                  >
                    {category.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          style={{
            ...styles.card,
            marginBottom: "24px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <input
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="作者・作品・技法を検索"
              style={{
                flex: "1 1 260px",
                minHeight: "48px",
                padding: "0 15px",
                border: "1px solid #CBD5E1",
                borderRadius: "14px",
                outline: "none",
                background: "#F8FAFC",
                color: "#0F172A",
                fontFamily: "inherit",
                fontSize: "16px",
              }}
            />

            {activeCategory !== "favorites" && (
              <button
                type="button"
                onClick={() => {
                  setCustomForm((current) => ({
                    ...current,
                    category: activeCategory,
                  }));
                  setShowAddForm((current) => !current);
                }}
                style={{
                  ...styles.button,
                  minHeight: "48px",
                  padding: "0 17px",
                  borderRadius: "14px",
                  background: "#C2410C",
                  color: "#FFFFFF",
                  fontWeight: 800,
                }}
              >
                ＋ 用法・項目を追加
              </button>
            )}
          </div>
        </section>

        {showAddForm && (
          <section
            style={{
              ...styles.card,
              marginBottom: "24px",
              padding: "22px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#C2410C",
                fontSize: "25px",
              }}
            >
              新しい項目を追加
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                color: "#64748B",
                lineHeight: 1.7,
              }}
            >
              学校のプリントや授業で習った表現技法などを、自分で登録できます。
            </p>

            <form
              onSubmit={addCustomItem}
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "18px",
              }}
            >
              <select
                value={customForm.category}
                onChange={(event) =>
                  setCustomForm((current) => ({
                    ...current,
                    category: event.target
                      .value as CustomForm["category"],
                  }))
                }
                style={{
                  minHeight: "46px",
                  padding: "0 13px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  fontFamily: "inherit",
                  fontSize: "15px",
                }}
              >
                {categories
                  .filter(
                    (
                      category,
                    ): category is typeof category & {
                      id: Exclude<CategoryId, "favorites">;
                    } => category.id !== "favorites",
                  )
                  .map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.label}
                    </option>
                  ))}
              </select>

              <input
                required
                value={customForm.title}
                onChange={(event) =>
                  setCustomForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="名前　例：省略法"
                style={{
                  minHeight: "46px",
                  padding: "0 13px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                }}
              />

              <input
                value={customForm.subtitle}
                onChange={(event) =>
                  setCustomForm((current) => ({
                    ...current,
                    subtitle: event.target.value,
                  }))
                }
                placeholder="短い説明　例：言葉を省いて余韻を残す"
                style={{
                  minHeight: "46px",
                  padding: "0 13px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                }}
              />

              <textarea
                required
                value={customForm.summary}
                onChange={(event) =>
                  setCustomForm((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                placeholder="意味・説明"
                rows={4}
                style={{
                  width: "100%",
                  padding: "13px",
                  boxSizing: "border-box",
                  resize: "vertical",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              />

              <input
                value={customForm.example}
                onChange={(event) =>
                  setCustomForm((current) => ({
                    ...current,
                    example: event.target.value,
                  }))
                }
                placeholder="例文・代表作など"
                style={{
                  minHeight: "46px",
                  padding: "0 13px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                }}
              />

              <input
                value={customForm.point}
                onChange={(event) =>
                  setCustomForm((current) => ({
                    ...current,
                    point: event.target.value,
                  }))
                }
                placeholder="覚えるポイント・効果"
                style={{
                  minHeight: "46px",
                  padding: "0 13px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    padding: "12px 18px",
                    borderRadius: "12px",
                    background: "#C2410C",
                    color: "#FFFFFF",
                    fontWeight: 800,
                  }}
                >
                  追加して保存
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    ...styles.button,
                    padding: "12px 18px",
                    border: "1px solid #CBD5E1",
                    borderRadius: "12px",
                    background: "#FFFFFF",
                    color: "#475569",
                    fontWeight: 800,
                  }}
                >
                  閉じる
                </button>
              </div>
            </form>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(250px, 0.78fr) minmax(0, 1.65fr)",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <aside
            style={{
              ...styles.card,
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#C2410C",
                    fontSize: "23px",
                  }}
                >
                  {activeCategoryData.icon}{" "}
                  {activeCategoryData.label}
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748B",
                    fontSize: "13px",
                  }}
                >
                  {visibleItems.length}件
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "9px",
                marginTop: "15px",
                maxHeight: "700px",
                overflowY: "auto",
              }}
            >
              {visibleItems.map((item) => {
                const selected = item.id === selectedItem?.id;
                const favorite =
                  savedData.favoriteIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      ...styles.button,
                      width: "100%",
                      padding: "13px",
                      border: selected
                        ? "2px solid #EA580C"
                        : "1px solid #E2E8F0",
                      borderRadius: "14px",
                      background: selected
                        ? "#FFF7ED"
                        : "#FFFFFF",
                      color: "#0F172A",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <strong
                        style={{
                          color: selected
                            ? "#C2410C"
                            : "#0F172A",
                          fontSize: "16px",
                        }}
                      >
                        {item.icon} {item.title}
                      </strong>

                      {favorite && <span>⭐</span>}
                    </div>

                    <span
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "#64748B",
                        fontSize: "12px",
                        lineHeight: 1.45,
                      }}
                    >
                      {item.subtitle}
                    </span>
                  </button>
                );
              })}

              {visibleItems.length === 0 && (
                <div
                  style={{
                    padding: "24px 12px",
                    color: "#64748B",
                    textAlign: "center",
                    lineHeight: 1.7,
                  }}
                >
                  該当する項目がありません。
                  <br />
                  検索条件を変えるか、新しい項目を追加してください。
                </div>
              )}
            </div>
          </aside>

          <div>
            {selectedItem ? (
              <article
                style={{
                  ...styles.card,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "25px",
                    background:
                      "linear-gradient(135deg, #FFEDD5, #FFF7ED)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "15px",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          background: "#FFFFFF",
                          color: "#C2410C",
                          fontSize: "13px",
                          fontWeight: 800,
                        }}
                      >
                        {
                          categories.find(
                            (category) =>
                              category.id ===
                              selectedItem.category,
                          )?.label
                        }
                      </span>

                      <h2
                        style={{
                          margin: "12px 0 0",
                          color: "#9A3412",
                          fontSize:
                            "clamp(30px, 6vw, 43px)",
                        }}
                      >
                        {selectedItem.icon}{" "}
                        {selectedItem.title}
                      </h2>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#C2410C",
                          fontSize: "17px",
                          fontWeight: 700,
                        }}
                      >
                        {selectedItem.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleFavorite(selectedItem.id)
                      }
                      style={{
                        ...styles.button,
                        padding: "11px 15px",
                        border: savedData.favoriteIds.includes(
                          selectedItem.id,
                        )
                          ? "2px solid #F59E0B"
                          : "1px solid #FDBA74",
                        borderRadius: "13px",
                        background:
                          savedData.favoriteIds.includes(
                            selectedItem.id,
                          )
                            ? "#FEF3C7"
                            : "#FFFFFF",
                        color: "#92400E",
                        fontWeight: 800,
                      }}
                    >
                      {savedData.favoriteIds.includes(
                        selectedItem.id,
                      )
                        ? "⭐ お気に入り登録済み"
                        : "☆ お気に入りに追加"}
                    </button>
                  </div>
                </div>

                <div style={{ padding: "24px" }}>
                  <p
                    style={{
                      margin: 0,
                      color: "#334155",
                      fontSize: "17px",
                      lineHeight: 1.85,
                    }}
                  >
                    {selectedItem.summary}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "11px",
                      marginTop: "20px",
                    }}
                  >
                    {selectedItem.details.map((detail) => (
                      <div
                        key={`${detail.label}-${detail.value}`}
                        style={{
                          padding: "15px",
                          border: "1px solid #E2E8F0",
                          borderRadius: "14px",
                          background: "#F8FAFC",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            color: "#C2410C",
                            fontSize: "13px",
                          }}
                        >
                          {detail.label}
                        </strong>

                        <p
                          style={{
                            margin: "7px 0 0",
                            color: "#334155",
                            lineHeight: 1.65,
                          }}
                        >
                          {detail.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedItem.examples &&
                    selectedItem.examples.length > 0 && (
                      <section
                        style={{
                          marginTop: "20px",
                          padding: "18px",
                          border: "1px solid #FED7AA",
                          borderRadius: "16px",
                          background: "#FFF7ED",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: "#9A3412",
                            fontSize: "19px",
                          }}
                        >
                          例
                        </h3>

                        {selectedItem.examples.map((example) => (
                          <p
                            key={example}
                            style={{
                              margin: "9px 0 0",
                              color: "#475569",
                              lineHeight: 1.7,
                            }}
                          >
                            ・{example}
                          </p>
                        ))}
                      </section>
                    )}

                  {selectedItem.points &&
                    selectedItem.points.length > 0 && (
                      <section
                        style={{
                          marginTop: "20px",
                          padding: "18px",
                          border: "1px solid #BBF7D0",
                          borderRadius: "16px",
                          background: "#F0FDF4",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: "#166534",
                            fontSize: "19px",
                          }}
                        >
                          💡 覚えるポイント
                        </h3>

                        {selectedItem.points.map((point) => (
                          <p
                            key={point}
                            style={{
                              margin: "9px 0 0",
                              color: "#166534",
                              lineHeight: 1.7,
                              fontWeight: 700,
                            }}
                          >
                            ・{point}
                          </p>
                        ))}
                      </section>
                    )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "19px",
                      flexWrap: "wrap",
                    }}
                  >
                    {selectedItem.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "7px 10px",
                          borderRadius: "999px",
                          background: "#F1F5F9",
                          color: "#475569",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <section
                    style={{
                      marginTop: "24px",
                      padding: "20px",
                      border: "1px solid #FED7AA",
                      borderRadius: "18px",
                      background: "#FFF7ED",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: "#9A3412",
                          fontSize: "22px",
                        }}
                      >
                        📝 {selectedItem.title}ノート
                      </h3>

                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "999px",
                          background: "#FFEDD5",
                          color: "#C2410C",
                          fontSize: "12px",
                          fontWeight: 800,
                        }}
                      >
                        自動保存
                      </span>
                    </div>

                    <textarea
                      value={
                        savedData.itemNotes[selectedItem.id] ?? ""
                      }
                      onChange={(event) =>
                        setSavedData((current) => ({
                          ...current,
                          itemNotes: {
                            ...current.itemNotes,
                            [selectedItem.id]:
                              event.target.value,
                          },
                        }))
                      }
                      placeholder="授業で習ったこと、効果、覚え方、間違えやすい点など"
                      rows={8}
                      style={{
                        width: "100%",
                        marginTop: "14px",
                        padding: "15px",
                        boxSizing: "border-box",
                        resize: "vertical",
                        border: "1px solid #FDBA74",
                        borderRadius: "14px",
                        outline: "none",
                        background: "#FFFFFF",
                        color: "#0F172A",
                        fontFamily: "inherit",
                        fontSize: "16px",
                        lineHeight: 1.8,
                      }}
                    />
                  </section>

                  {selectedItem.custom && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteCustomItem(selectedItem.id)
                      }
                      style={{
                        ...styles.button,
                        marginTop: "17px",
                        padding: "10px 14px",
                        border: "1px solid #FDA4AF",
                        borderRadius: "12px",
                        background: "#FFF1F2",
                        color: "#BE123C",
                        fontWeight: 800,
                      }}
                    >
                      この追加項目を削除
                    </button>
                  )}
                </div>
              </article>
            ) : (
              <div
                style={{
                  ...styles.card,
                  padding: "40px 22px",
                  color: "#64748B",
                  textAlign: "center",
                  lineHeight: 1.8,
                }}
              >
                表示する項目がありません。
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            ...styles.card,
            marginTop: "26px",
            padding: "22px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#C2410C",
              fontSize: "26px",
            }}
          >
            文学 全体ノート
          </h2>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748B",
              lineHeight: 1.7,
            }}
          >
            表現技法・漢詩・文学史など、単元をまたいで覚えたいことをまとめられます。
          </p>

          <textarea
            value={savedData.overallNote}
            onChange={(event) =>
              setSavedData((current) => ({
                ...current,
                overallNote: event.target.value,
              }))
            }
            placeholder="例：体言止めは余韻、対句はリズムと対比。漢詩の絶句は四句。"
            rows={8}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "15px",
              boxSizing: "border-box",
              resize: "vertical",
              border: "1px solid #CBD5E1",
              borderRadius: "15px",
              outline: "none",
              background: "#F8FAFC",
              color: "#0F172A",
              fontFamily: "inherit",
              fontSize: "16px",
              lineHeight: 1.8,
            }}
          />
        </section>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "22px",
            marginTop: "34px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/japanese"
            style={{
              color: "#C2410C",
              fontSize: "18px",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← 国語へ戻る
          </Link>

          <Link
            href="/"
            style={{
              color: "#64748B",
              fontSize: "18px",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ホームへ戻る
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 820px) {
          section {
            min-width: 0;
          }

          main section[style*="grid-template-columns: minmax(250px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}