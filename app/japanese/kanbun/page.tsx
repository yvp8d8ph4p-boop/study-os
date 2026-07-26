"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CategoryId =
  | "return"
  | "reread"
  | "negative"
  | "question"
  | "passive"
  | "comparison"
  | "idiom";

type KanbunItem = {
  id: string;
  category: CategoryId;
  title: string;
  group: string;
  meaning: string;
  reading?: string;
  rule?: string;
  example?: string;
  translation?: string;
  memory?: string;
  diagram?: string;
  custom?: boolean;
};

type NoteBlock = {
  id: string;
  title: string;
  body: string;
};

type FormState = {
  title: string;
  group: string;
  meaning: string;
  reading: string;
  rule: string;
  example: string;
  translation: string;
  memory: string;
  diagram: string;
};

type SavedState = {
  customItems: KanbunItem[];
  favorites: string[];
  learned: string[];
  itemNotes: Record<string, string>;
  notebook: NoteBlock[];
};

const STORAGE_KEY = "study-os-kanbun-v1";

const categories: {
  id: CategoryId;
  title: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "return",
    title: "返り点",
    icon: "🔁",
    description: "レ点・一二点・上中下点・甲乙点",
  },
  {
    id: "reread",
    title: "再読文字",
    icon: "📖",
    description: "未・将・当・応・宜・須・猶など",
  },
  {
    id: "negative",
    title: "否定",
    icon: "🚫",
    description: "不・未・無・非・莫・勿など",
  },
  {
    id: "question",
    title: "疑問・反語",
    icon: "❓",
    description: "何・安・焉・豈・孰・何如など",
  },
  {
    id: "passive",
    title: "使役・受身",
    icon: "⚙️",
    description: "使・令・遣・被・見・為〜所〜",
  },
  {
    id: "comparison",
    title: "比較・抑揚",
    icon: "⚖️",
    description: "於・如・不如・孰与・寧〜乎",
  },
  {
    id: "idiom",
    title: "重要句法",
    icon: "🧠",
    description: "仮定・限定・累加・選択・慣用句法",
  },
];

const builtInItems: KanbunItem[] = [
  {
    id: "return-re",
    category: "return",
    title: "レ点",
    group: "返り点",
    meaning: "一字下から一字上へ返って読む。",
    reading: "下の字を先に読み、そのあと上の字へ戻る。",
    rule: "レ点が付いた字はいったん飛ばし、次の一字を読んでから戻る。",
    diagram: "書 レ\n↓ ↑\n読 書\n読む順：下 → 上",
    example: "知レ人",
    translation: "人を知る。",
    memory: "レ点＝一つだけ戻る。",
  },
  {
    id: "return-one-two",
    category: "return",
    title: "一二点",
    group: "返り点",
    meaning: "二点まで読み進めてから、一点へ返る。",
    reading: "一の字を飛ばし、二の字まで読んでから一へ戻る。",
    rule: "一・二・三の順に対応し、数字の小さい方へ返る。",
    diagram: "読 一\n書 二\n順番：上を飛ばす → 下を読む → 上へ戻る",
    example: "欲二学一レ之",
    translation: "これを学ばんと欲す。",
    memory: "一を後回し、二まで行って一へ戻る。",
  },
  {
    id: "return-up-middle-down",
    category: "return",
    title: "上中下点",
    group: "返り点",
    meaning: "一二点より大きなまとまりで返るときに使う。",
    reading: "下点まで進み、中点、上点へと戻る。",
    rule: "上・中・下の対応関係を確認し、下から順に返る。",
    diagram: "上：最後に戻る\n中：その次\n下：先に読む",
    example: "複雑な長文で一二点と組み合わせて使われる。",
    translation: "大きな返読のまとまりを示す。",
    memory: "下から中、最後に上。",
  },
  {
    id: "return-kou-otsu",
    category: "return",
    title: "甲乙点",
    group: "返り点",
    meaning: "上中下点よりさらに大きな返読に使う。",
    reading: "乙まで進んでから甲へ戻る。",
    rule: "甲・乙・丙・丁の順に対応する。",
    diagram: "甲：後で戻る\n乙：先に読む",
    example: "非常に長い文で使われることがある。",
    translation: "大規模な返読の区切り。",
    memory: "数字より大きい単位の返り点。",
  },
  {
    id: "return-okurigana",
    category: "return",
    title: "送り仮名",
    group: "訓読の基本",
    meaning: "漢字の右下などに付いて、日本語の活用や助詞を補う。",
    reading: "送り仮名を漢字につなげて読む。",
    rule: "活用語尾・助詞・助動詞に注意する。",
    example: "学ブ・学バ・学ビ",
    translation: "文中で活用形が変わる。",
    memory: "返り点だけでなく送り仮名も必ず確認。",
  },
  {
    id: "return-okiji",
    category: "return",
    title: "置き字",
    group: "訓読の基本",
    meaning: "書き下し文では読まない、または助詞として補う字。",
    reading: "於・于・乎・矣・焉など。",
    rule: "文脈により「に・より・を・や」などの働きをする。",
    example: "学於師",
    translation: "師に学ぶ。",
    memory: "置いてあるが、そのまま音読しない。",
  },

  {
    id: "reread-mi",
    category: "reread",
    title: "未",
    group: "再読文字",
    meaning: "いまだ〜ず。まだ〜ない。",
    reading: "未だ〜ず",
    rule: "最初に「いまだ」と読み、返って「ず」と読む。",
    example: "未レ知",
    translation: "いまだ知らず。",
    memory: "未＝まだ終わっていない。",
    diagram: "未 → いまだ\n知 → 知ら\n未へ戻る → ず",
  },
  {
    id: "reread-syou",
    category: "reread",
    title: "将・且",
    group: "再読文字",
    meaning: "まさに〜んとす。今にも〜しようとする。",
    reading: "将に〜んとす",
    rule: "未来に起ころうとする直前の状態。",
    example: "将レ行",
    translation: "まさに行かんとす。",
    memory: "将来の直前＝まさに〜しようとする。",
  },
  {
    id: "reread-tou",
    category: "reread",
    title: "当",
    group: "再読文字",
    meaning: "まさに〜べし。当然〜すべきだ。",
    reading: "当に〜べし",
    rule: "当然・義務・推量を表す。",
    example: "当レ学",
    translation: "まさに学ぶべし。",
    memory: "当たり前にすべき＝当然。",
  },
  {
    id: "reread-ou",
    category: "reread",
    title: "応",
    group: "再読文字",
    meaning: "まさに〜べし。きっと〜だろう。",
    reading: "応に〜べし",
    rule: "当然・推量を表す。",
    example: "応レ来",
    translation: "応に来たるべし。",
    memory: "応じてそうなるはず。",
  },
  {
    id: "reread-gi",
    category: "reread",
    title: "宜",
    group: "再読文字",
    meaning: "よろしく〜べし。〜するのがよい。",
    reading: "宜しく〜べし",
    rule: "適当・勧告を表す。",
    example: "宜レ学",
    translation: "よろしく学ぶべし。",
    memory: "よろしい＝宜しい。",
  },
  {
    id: "reread-sube",
    category: "reread",
    title: "須",
    group: "再読文字",
    meaning: "すべからく〜べし。ぜひ〜しなければならない。",
    reading: "須らく〜べし",
    rule: "必要・義務を表す。",
    example: "須レ努力",
    translation: "すべからく努力すべし。",
    memory: "須＝必須。",
  },
  {
    id: "reread-nao",
    category: "reread",
    title: "猶",
    group: "再読文字",
    meaning: "なお〜のごとし。ちょうど〜のようだ。",
    reading: "猶ほ〜のごとし",
    rule: "比況を表す。",
    example: "猶二魚之有一レ水",
    translation: "なお魚の水有るがごとし。",
    memory: "猶予ではなく、なお〜のようだ。",
  },
  {
    id: "reread-yu",
    category: "reread",
    title: "由",
    group: "再読文字",
    meaning: "なお〜がごとし。",
    reading: "由ほ〜がごとし",
    rule: "「猶」と同様に比況を表すことがある。",
    example: "由二白雪一",
    translation: "なお白雪のごとし。",
    memory: "猶とセットで覚える。",
  },
  {
    id: "reread-盍",
    category: "reread",
    title: "盍",
    group: "再読文字",
    meaning: "なんぞ〜ざる。どうして〜しないのか。",
    reading: "盍ぞ〜ざる",
    rule: "勧誘・反語を表す。",
    example: "盍レ学",
    translation: "なんぞ学ばざる。",
    memory: "なぜやらない？＝やろうではないか。",
  },

  {
    id: "negative-fu",
    category: "negative",
    title: "不",
    group: "単純否定",
    meaning: "〜ず。〜ない。",
    reading: "動詞・形容詞の前に置く。",
    rule: "最も基本的な否定。",
    example: "不レ知",
    translation: "知らず。",
    memory: "不＝単純な否定。",
  },
  {
    id: "negative-mi",
    category: "negative",
    title: "未",
    group: "時制を含む否定",
    meaning: "いまだ〜ず。まだ〜ない。",
    reading: "再読文字として読む。",
    rule: "現在まで実現していない。",
    example: "未レ見",
    translation: "いまだ見ず。",
    memory: "これから実現する可能性が残る。",
  },
  {
    id: "negative-mu",
    category: "negative",
    title: "無・莫",
    group: "存在否定",
    meaning: "〜なし。〜するものなし。",
    reading: "無シ・莫シ、または〜することなし。",
    rule: "存在や所有を否定する。",
    example: "無レ人",
    translation: "人なし。",
    memory: "無＝存在しない。",
  },
  {
    id: "negative-hi",
    category: "negative",
    title: "非",
    group: "判断否定",
    meaning: "〜にあらず。〜ではない。",
    reading: "名詞や判断内容を否定する。",
    rule: "「AはBではない」という判断の否定。",
    example: "非二君子一",
    translation: "君子にあらず。",
    memory: "不は動作、非は判断。",
  },
  {
    id: "negative-nakare",
    category: "negative",
    title: "勿・莫",
    group: "禁止",
    meaning: "〜することなかれ。〜してはいけない。",
    reading: "動詞の前に置いて禁止。",
    rule: "命令文で用いる。",
    example: "勿レ忘",
    translation: "忘るることなかれ。",
    memory: "勿忘草の勿＝忘れるな。",
  },
  {
    id: "negative-hunou",
    category: "negative",
    title: "不能",
    group: "不可能",
    meaning: "〜するあたわず。〜できない。",
    reading: "能は「あたう」と読む。",
    rule: "能力・可能性の否定。",
    example: "不レ能レ行",
    translation: "行くあたわず。",
    memory: "能わない＝できない。",
  },
  {
    id: "negative-huka",
    category: "negative",
    title: "不可",
    group: "禁止・不可能",
    meaning: "〜べからず。〜してはいけない／できない。",
    reading: "可を「べし」と読む。",
    rule: "文脈で禁止か不可能か判断。",
    example: "不レ可レ忘",
    translation: "忘るべからず。",
    memory: "可ではない＝してはいけない。",
  },
  {
    id: "negative-nizu",
    category: "negative",
    title: "不亦〜乎",
    group: "反語的肯定",
    meaning: "また〜ならずや。なんと〜ではないか。",
    reading: "不亦〜乎",
    rule: "形は否定だが、強い肯定を表す。",
    example: "不二亦説一乎",
    translation: "また説ばしからずや。",
    memory: "『論語』頻出。実質は肯定。",
  },

  {
    id: "question-ka",
    category: "question",
    title: "何・奚・安・焉・胡",
    group: "疑問詞",
    meaning: "なに・なんぞ・いずくんぞ。",
    reading: "文脈により「何を」「なぜ」「どこに」と読む。",
    rule: "疑問または反語を作る。",
    example: "何レ為",
    translation: "何をかなす／なんすれぞ。",
    memory: "疑問詞があれば疑問・反語を疑う。",
  },
  {
    id: "question-ya",
    category: "question",
    title: "乎・邪・耶・与",
    group: "疑問終助詞",
    meaning: "〜か。〜や。",
    reading: "文末で疑問・反語を示す。",
    rule: "書き下し文では「か」「や」と読むことが多い。",
    example: "可レ乎",
    translation: "可なるか。",
    memory: "文末の疑問マーク役。",
  },
  {
    id: "question-azukara",
    category: "question",
    title: "豈〜哉",
    group: "反語",
    meaning: "あに〜や。どうして〜だろうか、いや〜ない。",
    reading: "豈を「あに」と読む。",
    rule: "強い反語。",
    example: "豈可レ忘哉",
    translation: "あに忘るべけんや。",
    memory: "豈＝まさか、いや違う。",
  },
  {
    id: "question-nanzo",
    category: "question",
    title: "何〜也",
    group: "疑問・反語",
    meaning: "なんぞ〜や。",
    reading: "理由や内容を問う。",
    rule: "文脈によって疑問・反語を判断。",
    example: "何不レ学也",
    translation: "なんぞ学ばざるや。",
    memory: "本当に質問しているか、否定したいかを確認。",
  },
  {
    id: "question-ikan",
    category: "question",
    title: "如何・奈何・若何",
    group: "方法・状態の疑問",
    meaning: "いかん。どうであるか／どうしたらよいか。",
    reading: "語順で意味が変わる。",
    rule: "目的語が間に入る場合もある。",
    example: "如レ之何",
    translation: "これをいかんせん。",
    memory: "「いかん」とひとかたまりで覚える。",
  },
  {
    id: "question-naniwo",
    category: "question",
    title: "何以",
    group: "手段・理由の疑問",
    meaning: "何を以て。どうやって／なぜ。",
    reading: "「なにをもって」と読む。",
    rule: "手段・理由を問う。",
    example: "何以知レ之",
    translation: "何を以てこれを知る。",
    memory: "以＝手段。",
  },
  {
    id: "question-taga",
    category: "question",
    title: "孰・誰",
    group: "人物・選択の疑問",
    meaning: "たれ・いずれ。",
    reading: "人なら「たれ」、比較なら「いずれ」。",
    rule: "二者選択では孰を「いずれ」と読む。",
    example: "孰勝",
    translation: "いずれか勝れる。",
    memory: "誰か、どちらか。",
  },

  {
    id: "passive-shi",
    category: "passive",
    title: "使・令・遣",
    group: "使役",
    meaning: "AをしてBせしむ。AにBさせる。",
    reading: "使役される人物の後に「をして」を補う。",
    rule: "使役動詞＋目的語＋動詞。",
    example: "使二人読一レ書",
    translation: "人をして書を読ましむ。",
    memory: "誰に何をさせるか。",
  },
  {
    id: "passive-jou",
    category: "passive",
    title: "教",
    group: "使役",
    meaning: "〜をして〜せしむ。〜させる。",
    reading: "「教む」は使役を表す場合がある。",
    rule: "文脈で通常の「教える」と区別。",
    example: "教二子学一",
    translation: "子をして学ばしむ。",
    memory: "教えて行動させる。",
  },
  {
    id: "passive-hi",
    category: "passive",
    title: "被",
    group: "受身",
    meaning: "〜に〜せらる。〜される。",
    reading: "被害・受身を表す。",
    rule: "被＋動作主＋動詞の形。",
    example: "被レ笑",
    translation: "笑はる。",
    memory: "被る＝行為を受ける。",
  },
  {
    id: "passive-ken",
    category: "passive",
    title: "見",
    group: "受身",
    meaning: "〜らる。〜される。",
    reading: "動詞の前で受身の助動詞的に働く。",
    rule: "通常の「見る」と区別。",
    example: "見レ欺",
    translation: "欺かる。",
    memory: "見が動詞の前なら受身を疑う。",
  },
  {
    id: "passive-i-syo",
    category: "passive",
    title: "為A所B",
    group: "受身",
    meaning: "AのBする所と為る。AにBされる。",
    reading: "「AのBするところとなる」。",
    rule: "典型的な受身句法。",
    example: "為二人所一レ笑",
    translation: "人の笑ふ所と為る。",
    memory: "為〜所〜＝〜される。",
  },
  {
    id: "passive-naru",
    category: "passive",
    title: "為",
    group: "受身・判断",
    meaning: "〜に〜せらる／〜となす。",
    reading: "前後関係で受身か通常動詞か判断。",
    rule: "「為A所B」の形なら受身。",
    example: "為レ敵所レ破",
    translation: "敵の破る所と為る。",
    memory: "所とセットなら受身。",
  },

  {
    id: "comparison-yo",
    category: "comparison",
    title: "A於B",
    group: "比較",
    meaning: "AはBより〜。",
    reading: "於を「より」と読む。",
    rule: "比較の基準を示す。",
    example: "青取レ之二於藍一而青二於藍一",
    translation: "青はこれを藍より取りて藍より青し。",
    memory: "於＝より。",
  },
  {
    id: "comparison-gotoshi",
    category: "comparison",
    title: "如・若",
    group: "比況",
    meaning: "〜のごとし。〜のようだ。",
    reading: "如し・若し。",
    rule: "比喩・比較を表す。",
    example: "光陰如レ箭",
    translation: "光陰箭のごとし。",
    memory: "如＝ごとし。",
  },
  {
    id: "comparison-hunyo",
    category: "comparison",
    title: "不如",
    group: "比較",
    meaning: "〜にしかず。〜には及ばない。",
    reading: "A不如B＝AはBにしかず。",
    rule: "Bの方が優れている。",
    example: "百聞不レ如二一見一",
    translation: "百聞は一見にしかず。",
    memory: "後ろの方が上。",
  },
  {
    id: "comparison-tareto",
    category: "comparison",
    title: "孰与",
    group: "比較疑問",
    meaning: "いずれぞ。どちらが〜か。",
    reading: "二者を比較する。",
    rule: "A与B孰〜の形。",
    example: "吾与二徐公一孰美",
    translation: "我と徐公といずれか美なる。",
    memory: "孰＝どちら。",
  },
  {
    id: "comparison-nei",
    category: "comparison",
    title: "寧A乎B",
    group: "選択・抑揚",
    meaning: "むしろAするともBせず。",
    reading: "強い選択を表す。",
    rule: "BよりAを選ぶ。",
    example: "寧死不レ屈",
    translation: "むしろ死すとも屈せず。",
    memory: "寧ろ＝むしろ。",
  },
  {
    id: "comparison-yori",
    category: "comparison",
    title: "与其A寧B",
    group: "選択",
    meaning: "そのAせんよりは、むしろBせよ。",
    reading: "二つを比べてBを選ぶ。",
    rule: "与其〜寧〜をセットで覚える。",
    example: "与二其生辱一寧死",
    translation: "その生きて辱められんよりは、むしろ死せよ。",
    memory: "後半のBを選ぶ。",
  },
  {
    id: "comparison-notonly",
    category: "comparison",
    title: "不唯A抑亦B",
    group: "抑揚",
    meaning: "ただAのみならず、そもそもまたB。",
    reading: "AだけでなくBも。",
    rule: "前半を否定し、後半を強く示す。",
    example: "不唯知之抑亦行之",
    translation: "ただこれを知るのみならず、そもそもまたこれを行ふ。",
    memory: "not only A but also B。",
  },

  {
    id: "idiom-moshi",
    category: "idiom",
    title: "若・如・苟",
    group: "仮定",
    meaning: "もし〜ならば。",
    reading: "若し・如し・苟しくも。",
    rule: "条件を示す。",
    example: "若有レ志",
    translation: "もし志あらば。",
    memory: "文頭の若＝もし。",
  },
  {
    id: "idiom-sunawati",
    category: "idiom",
    title: "則",
    group: "条件・結果",
    meaning: "すなわち。〜ならば。",
    reading: "前件を受けた結果を示す。",
    rule: "仮定文で「〜すれば」と訳すこともある。",
    example: "学而時習之不亦説乎",
    translation: "学びて時にこれを習ふ、また説ばしからずや。",
    memory: "条件のあとに結果。",
  },
  {
    id: "idiom-tadashi",
    category: "idiom",
    title: "但・唯・惟",
    group: "限定",
    meaning: "ただ〜のみ。",
    reading: "限定を示す。",
    rule: "「のみ」を補って訳す。",
    example: "但知レ学",
    translation: "ただ学ぶことを知るのみ。",
    memory: "only。",
  },
  {
    id: "idiom-nominarazu",
    category: "idiom",
    title: "不独・不唯",
    group: "累加",
    meaning: "ひとり〜のみならず。",
    reading: "AだけでなくBも。",
    rule: "後ろに「亦・又」などを伴うことが多い。",
    example: "不独我知之",
    translation: "ひとり我のみこれを知るにあらず。",
    memory: "not only。",
  },
  {
    id: "idiom-mata",
    category: "idiom",
    title: "亦・又",
    group: "累加",
    meaning: "また。〜もまた。",
    reading: "追加を表す。",
    rule: "前の内容と並列・累加。",
    example: "人亦有レ志",
    translation: "人もまた志あり。",
    memory: "also。",
  },
  {
    id: "idiom-所以",
    category: "idiom",
    title: "所以",
    group: "理由・手段",
    meaning: "ゆえん。〜する理由／〜する手段。",
    reading: "「所以」をひとかたまりで読む。",
    rule: "後ろに動詞が続く場合、理由や手段を表す。",
    example: "此吾所以来",
    translation: "これ吾が来たりしゆえんなり。",
    memory: "why / means。",
  },
  {
    id: "idiom-syoi",
    category: "idiom",
    title: "所A",
    group: "名詞化",
    meaning: "Aする所。Aするもの・こと。",
    reading: "動詞を名詞化する。",
    rule: "「所＋動詞」の形。",
    example: "所レ欲",
    translation: "欲する所。",
    memory: "所が後ろの動詞を名詞にする。",
  },
  {
    id: "idiom-yueni",
    category: "idiom",
    title: "故・是以",
    group: "理由・結果",
    meaning: "ゆえに。ここをもって。",
    reading: "前文を理由として結果を述べる。",
    rule: "接続語として読む。",
    example: "是以知レ之",
    translation: "ここをもってこれを知る。",
    memory: "だから。",
  },
  {
    id: "idiom-katu",
    category: "idiom",
    title: "且A且B",
    group: "並列",
    meaning: "かつAし、かつBす。",
    reading: "二つの動作・状態を並べる。",
    rule: "「一方で〜、また〜」。",
    example: "且学且思",
    translation: "かつ学び、かつ思ふ。",
    memory: "AもBも。",
  },
  {
    id: "idiom-aruiha",
    category: "idiom",
    title: "或A或B",
    group: "選択・並列",
    meaning: "あるいはAし、あるいはBす。",
    reading: "不定の複数例を並べる。",
    rule: "「ある者は〜、ある者は〜」の場合もある。",
    example: "或行或止",
    translation: "あるいは行き、あるいは止まる。",
    memory: "either / some。",
  },
  {
    id: "idiom-wo以て",
    category: "idiom",
    title: "以A為B",
    group: "判断",
    meaning: "Aを以てBと為す。AをBと考える。",
    reading: "以〜為〜をセットで読む。",
    rule: "評価・判断・任命を表す。",
    example: "以レ学為レ楽",
    translation: "学を以て楽しみと為す。",
    memory: "AをBとする。",
  },
  {
    id: "idiom-masu",
    category: "idiom",
    title: "益・愈・弥",
    group: "程度",
    meaning: "ますます。いよいよ。",
    reading: "程度の増加。",
    rule: "比較・変化の文脈で使う。",
    example: "益進",
    translation: "ますます進む。",
    memory: "益＝増える。",
  },
  {
    id: "idiom-kore",
    category: "idiom",
    title: "是・此・斯",
    group: "指示",
    meaning: "これ。この。",
    reading: "前の内容や近い対象を指す。",
    rule: "何を指しているか文脈で確認。",
    example: "是可レ学",
    translation: "これ学ぶべし。",
    memory: "指示語は前後の内容へ戻る。",
  },
];

const emptyForm: FormState = {
  title: "",
  group: "",
  meaning: "",
  reading: "",
  rule: "",
  example: "",
  translation: "",
  memory: "",
  diagram: "",
};

const css = `
*{box-sizing:border-box}
body{margin:0}
button,input,textarea,select{font:inherit}
.kanbun-page{
  min-height:100vh;
  padding:24px 14px 80px;
  color:#1f2937;
  background:
    radial-gradient(circle at 100% 0%,rgba(17,24,39,.08),transparent 25%),
    linear-gradient(145deg,#f8fafc 0%,#eef2f7 52%,#e5e7eb 100%);
}
.kanbun-container{width:100%;max-width:1200px;margin:0 auto}
.kanbun-topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}
.kanbun-brand{margin:0;color:#111827;font-size:12px;font-weight:950;letter-spacing:.14em}
.kanbun-back{text-decoration:none;color:#111827;background:rgba(255,255,255,.9);border:1px solid #d1d5db;border-radius:12px;padding:10px 14px;font-size:13px;font-weight:900}
.kanbun-hero{
  position:relative;overflow:hidden;padding:clamp(28px,5vw,54px);
  border-radius:28px;color:white;margin-bottom:20px;
  background:linear-gradient(135deg,#111827 0%,#1f2937 50%,#374151 100%);
  box-shadow:0 24px 60px rgba(17,24,39,.2)
}
.kanbun-hero:after{
  content:"漢";position:absolute;right:4%;bottom:-32px;font-size:190px;
  font-weight:950;color:rgba(255,255,255,.055);line-height:1
}
.kanbun-eyebrow{margin:0 0 10px;color:#cbd5e1;font-size:11px;font-weight:950;letter-spacing:.18em}
.kanbun-title{margin:0;font-size:clamp(42px,7vw,70px);letter-spacing:-.05em}
.kanbun-hero-text{position:relative;z-index:1;max-width:740px;margin:15px 0 0;color:#e5e7eb;font-size:14px;line-height:1.9}
.kanbun-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:16px 0 20px}
.kanbun-stat{padding:15px;border:1px solid #d7dce2;border-radius:17px;background:rgba(255,255,255,.9);box-shadow:0 9px 24px rgba(17,24,39,.06)}
.kanbun-stat-label{margin:0;color:#6b7280;font-size:11px;font-weight:850}
.kanbun-stat-value{margin:6px 0 0;color:#111827;font-size:24px;font-weight:950}
.kanbun-toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:9px;margin-bottom:17px}
.kanbun-input,.kanbun-textarea,.kanbun-select{width:100%;border:1px solid #d1d5db;border-radius:13px;padding:12px 13px;background:white;color:#111827;outline:none}
.kanbun-input:focus,.kanbun-textarea:focus,.kanbun-select:focus{border-color:#4b5563;box-shadow:0 0 0 3px rgba(17,24,39,.08)}
.kanbun-textarea{min-height:110px;resize:vertical;line-height:1.75}
.kanbun-btn{min-height:44px;border:none;border-radius:13px;padding:0 15px;cursor:pointer;background:#111827;color:white;font-weight:900}
.kanbun-btn-soft{min-height:44px;border:1px solid #d1d5db;border-radius:13px;padding:0 15px;cursor:pointer;background:white;color:#111827;font-weight:900}
.kanbun-layout{display:grid;grid-template-columns:255px minmax(0,1fr);gap:18px;align-items:start}
.kanbun-sidebar{position:sticky;top:16px;padding:10px;border:1px solid #d9dde3;border-radius:20px;background:rgba(255,255,255,.93);box-shadow:0 12px 30px rgba(17,24,39,.07)}
.kanbun-side-btn{width:100%;border:none;border-radius:14px;padding:12px;margin:3px 0;cursor:pointer;text-align:left;background:transparent;color:#374151}
.kanbun-side-btn.active{background:#e5e7eb;color:#111827}
.kanbun-side-title{display:block;font-size:14px;font-weight:950}
.kanbun-side-desc{display:block;margin-top:4px;color:#6b7280;font-size:11px;line-height:1.5}
.kanbun-data-buttons{display:grid;gap:8px;padding:10px 4px 2px}
.kanbun-content{min-width:0}
.kanbun-card{overflow:hidden;border:1px solid #d8dde3;border-radius:22px;background:rgba(255,255,255,.94);box-shadow:0 12px 30px rgba(17,24,39,.07)}
.kanbun-card-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:20px;border-bottom:1px solid #e5e7eb}
.kanbun-card-title{margin:0;color:#111827;font-size:23px}
.kanbun-card-subtitle{margin:6px 0 0;color:#6b7280;font-size:12px}
.kanbun-list{display:grid;gap:10px;padding:12px}
.kanbun-item{overflow:hidden;border:1px solid #e1e5ea;border-radius:17px;background:white}
.kanbun-item-main{width:100%;padding:16px;border:none;cursor:pointer;text-align:left;background:transparent;color:#111827}
.kanbun-item-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.kanbun-item-title{margin:0;color:#111827;font-size:18px}
.kanbun-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
.kanbun-badge{display:inline-flex;padding:4px 8px;border-radius:999px;color:#374151;background:#f3f4f6;font-size:10px;font-weight:900}
.kanbun-badge.learned{color:#365314;background:#ecfccb}
.kanbun-meaning{margin:10px 0 0;color:#4b5563;font-size:13px;line-height:1.75}
.kanbun-detail{padding:2px 16px 16px;border-top:1px solid #edf0f3}
.kanbun-info-grid{display:grid;gap:9px;margin-top:14px}
.kanbun-info{padding:12px;border-radius:13px;background:#f8fafc;color:#374151;font-size:13px;line-height:1.75}
.kanbun-info strong{color:#111827}
.kanbun-diagram{white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#111827;color:#f9fafb;border-radius:14px;padding:15px;line-height:1.8;overflow-x:auto}
.kanbun-note-title{margin:17px 0 8px;color:#111827;font-size:14px}
.kanbun-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.kanbun-mini{padding:8px 10px;border:1px solid #d1d5db;border-radius:10px;background:white;color:#111827;cursor:pointer;font-size:12px;font-weight:900}
.kanbun-mini.danger{color:#b42318;background:#fff7f7;border-color:#efcaca}
.kanbun-empty{padding:45px 20px;color:#6b7280;text-align:center}
.kanbun-note-list{display:grid;gap:12px;padding:14px}
.kanbun-note-card{padding:14px;border:1px solid #dde2e8;border-radius:16px;background:white}
.kanbun-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:16px;background:rgba(17,24,39,.58)}
.kanbun-modal{width:100%;max-width:660px;max-height:90vh;overflow-y:auto;padding:20px;border:1px solid #d9dee5;border-radius:22px;background:#f9fafb;box-shadow:0 30px 80px rgba(17,24,39,.3)}
.kanbun-form{display:grid;gap:12px}
.kanbun-label{display:grid;gap:6px;color:#374151;font-size:12px;font-weight:900}
.kanbun-modal-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:16px}
@media(max-width:880px){
  .kanbun-layout{grid-template-columns:1fr}
  .kanbun-sidebar{position:static}
  .kanbun-sidebar-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:700px){
  .kanbun-toolbar{grid-template-columns:1fr}
  .kanbun-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .kanbun-sidebar-nav{grid-template-columns:1fr}
  .kanbun-btn,.kanbun-btn-soft{width:100%}
}
`;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function KanbunPage() {
  const [activeCategory, setActiveCategory] =
    useState<CategoryId>("return");
  const [showNotebook, setShowNotebook] = useState(false);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const [customItems, setCustomItems] = useState<KanbunItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [learned, setLearned] = useState<string[]>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [notebook, setNotebook] = useState<NoteBlock[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KanbunItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [ready, setReady] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const saved = JSON.parse(raw) as SavedState;
        setCustomItems(saved.customItems ?? []);
        setFavorites(saved.favorites ?? []);
        setLearned(saved.learned ?? []);
        setItemNotes(saved.itemNotes ?? {});
        setNotebook(saved.notebook ?? []);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const data: SavedState = {
      customItems,
      favorites,
      learned,
      itemNotes,
      notebook,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [customItems, favorites, learned, itemNotes, notebook, ready]);

  useEffect(() => {
    setGroupFilter("all");
    setOpenItemId(null);
  }, [activeCategory]);

  const allItems = useMemo(
    () => [...builtInItems, ...customItems],
    [customItems],
  );

  const categoryItems = useMemo(
    () => allItems.filter((item) => item.category === activeCategory),
    [activeCategory, allItems],
  );

  const groups = useMemo(
    () => Array.from(new Set(categoryItems.map((item) => item.group))).sort(),
    [categoryItems],
  );

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return categoryItems.filter((item) => {
      const favoriteMatch =
        !showFavoritesOnly || favorites.includes(item.id);
      const groupMatch =
        groupFilter === "all" || item.group === groupFilter;
      const queryMatch =
        !normalized ||
        [
          item.title,
          item.group,
          item.meaning,
          item.reading ?? "",
          item.rule ?? "",
          item.example ?? "",
          item.translation ?? "",
          item.memory ?? "",
          item.diagram ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      return favoriteMatch && groupMatch && queryMatch;
    });
  }, [
    categoryItems,
    favorites,
    groupFilter,
    query,
    showFavoritesOnly,
  ]);

  const activeData =
    categories.find((category) => category.id === activeCategory) ??
    categories[0];

  const learnedInCategory = categoryItems.filter((item) =>
    learned.includes(item.id),
  ).length;

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(item: KanbunItem) {
    setEditingItem(item);
    setForm({
      title: item.title,
      group: item.group,
      meaning: item.meaning,
      reading: item.reading ?? "",
      rule: item.rule ?? "",
      example: item.example ?? "",
      translation: item.translation ?? "",
      memory: item.memory ?? "",
      diagram: item.diagram ?? "",
    });
    setModalOpen(true);
  }

  function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.meaning.trim()) return;

    const nextItem: KanbunItem = {
      id: editingItem?.id ?? uid(),
      category: editingItem?.category ?? activeCategory,
      title: form.title.trim(),
      group: form.group.trim() || "自分で追加",
      meaning: form.meaning.trim(),
      reading: form.reading.trim(),
      rule: form.rule.trim(),
      example: form.example.trim(),
      translation: form.translation.trim(),
      memory: form.memory.trim(),
      diagram: form.diagram.trim(),
      custom: true,
    };

    if (editingItem) {
      setCustomItems((items) =>
        items.map((item) =>
          item.id === editingItem.id ? nextItem : item,
        ),
      );
    } else {
      setCustomItems((items) => [...items, nextItem]);
    }

    setModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  function deleteCustomItem(id: string) {
    if (!window.confirm("この追加項目を削除しますか？")) return;

    setCustomItems((items) => items.filter((item) => item.id !== id));
    setFavorites((items) => items.filter((itemId) => itemId !== id));
    setLearned((items) => items.filter((itemId) => itemId !== id));
    setItemNotes((notes) => {
      const next = { ...notes };
      delete next[id];
      return next;
    });
  }

  function toggleFromList(
    id: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setter((items) =>
      items.includes(id)
        ? items.filter((itemId) => itemId !== id)
        : [...items, id],
    );
  }

  function addNotebookBlock() {
    setNotebook((blocks) => [
      ...blocks,
      { id: uid(), title: "新しい漢文ノート", body: "" },
    ]);
  }

  function exportData() {
    const data: SavedState = {
      customItems,
      favorites,
      learned,
      itemNotes,
      notebook,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "study-os-kanbun-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as SavedState;
        setCustomItems(data.customItems ?? []);
        setFavorites(data.favorites ?? []);
        setLearned(data.learned ?? []);
        setItemNotes(data.itemNotes ?? {});
        setNotebook(data.notebook ?? []);
        window.alert("漢文データを読み込みました。");
      } catch {
        window.alert(
          "読み込みに失敗しました。正しいJSONファイルを選んでください。",
        );
      } finally {
        if (importRef.current) importRef.current.value = "";
      }
    };

    reader.readAsText(file);
  }

  return (
    <>
      <style>{css}</style>

      <main className="kanbun-page">
        <div className="kanbun-container">
          <header className="kanbun-topbar">
            <p className="kanbun-brand">
              STUDY OS / JAPANESE / KANBUN
            </p>

            <Link href="/japanese" className="kanbun-back">
              ← 国語ホーム
            </Link>
          </header>

          <section className="kanbun-hero">
            <p className="kanbun-eyebrow">CLASSICAL CHINESE</p>
            <h1 className="kanbun-title">漢文</h1>
            <p className="kanbun-hero-text">
              返り点・再読文字・否定・疑問反語・使役受身・比較・重要句法を、
              読み方と現代語訳までまとめて確認できます。
              自分の授業メモや追加句法も保存できる、育てる漢文辞典です。
            </p>
          </section>

          <section className="kanbun-stats">
            <div className="kanbun-stat">
              <p className="kanbun-stat-label">現在の分野</p>
              <p className="kanbun-stat-value">
                {activeData.icon} {activeData.title}
              </p>
            </div>

            <div className="kanbun-stat">
              <p className="kanbun-stat-label">登録項目</p>
              <p className="kanbun-stat-value">{categoryItems.length}</p>
            </div>

            <div className="kanbun-stat">
              <p className="kanbun-stat-label">覚えた</p>
              <p className="kanbun-stat-value">
                {learnedInCategory}/{categoryItems.length}
              </p>
            </div>

            <div className="kanbun-stat">
              <p className="kanbun-stat-label">お気に入り</p>
              <p className="kanbun-stat-value">{favorites.length}</p>
            </div>
          </section>

          <div className="kanbun-toolbar">
            <input
              className="kanbun-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="句法・読み方・意味を検索…"
            />

            <button
              type="button"
              className="kanbun-btn-soft"
              onClick={() => setShowFavoritesOnly((value) => !value)}
            >
              {showFavoritesOnly ? "⭐ お気に入りのみ" : "☆ お気に入り"}
            </button>

            <button
              type="button"
              className="kanbun-btn"
              onClick={openCreateModal}
            >
              ＋ 項目を追加
            </button>
          </div>

          <div className="kanbun-layout">
            <aside className="kanbun-sidebar">
              <div className="kanbun-sidebar-nav">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`kanbun-side-btn ${
                      !showNotebook && activeCategory === category.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setShowNotebook(false);
                      setActiveCategory(category.id);
                    }}
                  >
                    <span className="kanbun-side-title">
                      {category.icon} {category.title}
                    </span>
                    <span className="kanbun-side-desc">
                      {category.description}
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  className={`kanbun-side-btn ${
                    showNotebook ? "active" : ""
                  }`}
                  onClick={() => setShowNotebook(true)}
                >
                  <span className="kanbun-side-title">📒 漢文ノート</span>
                  <span className="kanbun-side-desc">
                    授業・模試・書き下し文を自由に保存
                  </span>
                </button>
              </div>

              <div className="kanbun-data-buttons">
                <button
                  type="button"
                  className="kanbun-btn-soft"
                  onClick={exportData}
                >
                  データを書き出す
                </button>

                <button
                  type="button"
                  className="kanbun-btn-soft"
                  onClick={() => importRef.current?.click()}
                >
                  データを読み込む
                </button>

                <input
                  ref={importRef}
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={importData}
                />
              </div>
            </aside>

            <section className="kanbun-content">
              {!showNotebook ? (
                <div className="kanbun-card">
                  <div className="kanbun-card-head">
                    <div>
                      <h2 className="kanbun-card-title">
                        {activeData.icon} {activeData.title}
                      </h2>
                      <p className="kanbun-card-subtitle">
                        {activeData.description}・{visibleItems.length}件表示
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <select
                        className="kanbun-select"
                        value={groupFilter}
                        onChange={(event) =>
                          setGroupFilter(event.target.value)
                        }
                        style={{ width: "auto", minWidth: 145 }}
                      >
                        <option value="all">すべての分類</option>
                        {groups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="kanbun-btn"
                        onClick={openCreateModal}
                      >
                        ＋ {activeData.title}を追加
                      </button>
                    </div>
                  </div>

                  <div className="kanbun-list">
                    {visibleItems.length === 0 ? (
                      <div className="kanbun-empty">
                        条件に合う項目がありません。
                      </div>
                    ) : (
                      visibleItems.map((item) => {
                        const opened = openItemId === item.id;
                        const favorite = favorites.includes(item.id);
                        const isLearned = learned.includes(item.id);

                        return (
                          <article key={item.id} className="kanbun-item">
                            <button
                              type="button"
                              className="kanbun-item-main"
                              onClick={() =>
                                setOpenItemId(opened ? null : item.id)
                              }
                            >
                              <div className="kanbun-item-top">
                                <div>
                                  <h3 className="kanbun-item-title">
                                    {item.title}
                                  </h3>

                                  <div className="kanbun-badges">
                                    <span className="kanbun-badge">
                                      {item.group}
                                    </span>

                                    {item.custom && (
                                      <span className="kanbun-badge">
                                        自分で追加
                                      </span>
                                    )}

                                    {isLearned && (
                                      <span className="kanbun-badge learned">
                                        ✓ 覚えた
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span
                                  style={{
                                    color: "#111827",
                                    fontSize: 20,
                                    fontWeight: 900,
                                  }}
                                >
                                  {opened ? "−" : "＋"}
                                </span>
                              </div>

                              <p className="kanbun-meaning">
                                {item.meaning}
                              </p>
                            </button>

                            {opened && (
                              <div className="kanbun-detail">
                                <div className="kanbun-info-grid">
                                  {item.diagram && (
                                    <div className="kanbun-diagram">
                                      {item.diagram}
                                    </div>
                                  )}

                                  {item.reading && (
                                    <div className="kanbun-info">
                                      <strong>読み方：</strong>
                                      {item.reading}
                                    </div>
                                  )}

                                  {item.rule && (
                                    <div className="kanbun-info">
                                      <strong>ルール・見分け方：</strong>
                                      {item.rule}
                                    </div>
                                  )}

                                  {item.example && (
                                    <div className="kanbun-info">
                                      <strong>例文：</strong>
                                      {item.example}
                                    </div>
                                  )}

                                  {item.translation && (
                                    <div className="kanbun-info">
                                      <strong>書き下し・現代語訳：</strong>
                                      {item.translation}
                                    </div>
                                  )}

                                  {item.memory && (
                                    <div className="kanbun-info">
                                      <strong>覚え方：</strong>
                                      {item.memory}
                                    </div>
                                  )}
                                </div>

                                <h4 className="kanbun-note-title">
                                  📝 自分のメモ
                                </h4>

                                <textarea
                                  className="kanbun-textarea"
                                  value={itemNotes[item.id] ?? ""}
                                  onChange={(event) =>
                                    setItemNotes((notes) => ({
                                      ...notes,
                                      [item.id]: event.target.value,
                                    }))
                                  }
                                  placeholder="先生の説明、書き下し文、間違えた問題など…"
                                />

                                <div className="kanbun-actions">
                                  <button
                                    type="button"
                                    className="kanbun-mini"
                                    onClick={() =>
                                      toggleFromList(item.id, setFavorites)
                                    }
                                  >
                                    {favorite
                                      ? "★ お気に入り解除"
                                      : "☆ お気に入り"}
                                  </button>

                                  <button
                                    type="button"
                                    className="kanbun-mini"
                                    onClick={() =>
                                      toggleFromList(item.id, setLearned)
                                    }
                                  >
                                    {isLearned
                                      ? "✓ 覚えたを解除"
                                      : "○ 覚えた"}
                                  </button>

                                  {item.custom && (
                                    <>
                                      <button
                                        type="button"
                                        className="kanbun-mini"
                                        onClick={() => openEditModal(item)}
                                      >
                                        編集
                                      </button>

                                      <button
                                        type="button"
                                        className="kanbun-mini danger"
                                        onClick={() =>
                                          deleteCustomItem(item.id)
                                        }
                                      >
                                        削除
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="kanbun-card">
                  <div className="kanbun-card-head">
                    <div>
                      <h2 className="kanbun-card-title">📒 漢文ノート</h2>
                      <p className="kanbun-card-subtitle">
                        入力内容はこの端末に自動保存されます。
                      </p>
                    </div>

                    <button
                      type="button"
                      className="kanbun-btn"
                      onClick={addNotebookBlock}
                    >
                      ＋ ノート追加
                    </button>
                  </div>

                  <div className="kanbun-note-list">
                    {notebook.length === 0 ? (
                      <div className="kanbun-empty">
                        まだノートがありません。「ノート追加」から作れます。
                      </div>
                    ) : (
                      notebook.map((block) => (
                        <article key={block.id} className="kanbun-note-card">
                          <input
                            className="kanbun-input"
                            style={{ marginBottom: 10, fontWeight: 900 }}
                            value={block.title}
                            onChange={(event) =>
                              setNotebook((blocks) =>
                                blocks.map((item) =>
                                  item.id === block.id
                                    ? { ...item, title: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />

                          <textarea
                            className="kanbun-textarea"
                            style={{ minHeight: 190 }}
                            value={block.body}
                            onChange={(event) =>
                              setNotebook((blocks) =>
                                blocks.map((item) =>
                                  item.id === block.id
                                    ? { ...item, body: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder="返り点、再読文字、句法、書き下し文、現代語訳など…"
                          />

                          <div className="kanbun-actions">
                            <button
                              type="button"
                              className="kanbun-mini danger"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "このノートを削除しますか？",
                                  )
                                ) {
                                  setNotebook((blocks) =>
                                    blocks.filter(
                                      (item) => item.id !== block.id,
                                    ),
                                  );
                                }
                              }}
                            >
                              ノートを削除
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {modalOpen && (
          <div
            className="kanbun-modal-backdrop"
            onMouseDown={() => setModalOpen(false)}
          >
            <form
              className="kanbun-modal"
              onSubmit={saveItem}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 16px", color: "#111827" }}>
                {editingItem ? "項目を編集" : `${activeData.title}を追加`}
              </h2>

              <div className="kanbun-form">
                <label className="kanbun-label">
                  名前 *
                  <input
                    className="kanbun-input"
                    value={form.title}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        title: event.target.value,
                      }))
                    }
                    placeholder="例：何以"
                  />
                </label>

                <label className="kanbun-label">
                  分類
                  <input
                    className="kanbun-input"
                    value={form.group}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        group: event.target.value,
                      }))
                    }
                    placeholder="例：疑問"
                  />
                </label>

                <label className="kanbun-label">
                  意味 *
                  <textarea
                    className="kanbun-textarea"
                    value={form.meaning}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        meaning: event.target.value,
                      }))
                    }
                    placeholder="句法の意味"
                  />
                </label>

                <label className="kanbun-label">
                  読み方
                  <textarea
                    className="kanbun-textarea"
                    value={form.reading}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        reading: event.target.value,
                      }))
                    }
                    placeholder="書き下しでの読み方"
                  />
                </label>

                <label className="kanbun-label">
                  ルール・見分け方
                  <textarea
                    className="kanbun-textarea"
                    value={form.rule}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        rule: event.target.value,
                      }))
                    }
                    placeholder="返り方・文型・注意点"
                  />
                </label>

                <label className="kanbun-label">
                  例文
                  <textarea
                    className="kanbun-textarea"
                    value={form.example}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        example: event.target.value,
                      }))
                    }
                    placeholder="漢文の例"
                  />
                </label>

                <label className="kanbun-label">
                  書き下し・現代語訳
                  <textarea
                    className="kanbun-textarea"
                    value={form.translation}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        translation: event.target.value,
                      }))
                    }
                    placeholder="書き下し文や現代語訳"
                  />
                </label>

                <label className="kanbun-label">
                  覚え方
                  <textarea
                    className="kanbun-textarea"
                    value={form.memory}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        memory: event.target.value,
                      }))
                    }
                    placeholder="語呂合わせや注意点"
                  />
                </label>

                <label className="kanbun-label">
                  図解
                  <textarea
                    className="kanbun-textarea"
                    value={form.diagram}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        diagram: event.target.value,
                      }))
                    }
                    placeholder={"例：\n上を飛ばす\n↓\n下を読む\n↓\n上へ戻る"}
                  />
                </label>
              </div>

              <div className="kanbun-modal-actions">
                <button
                  type="button"
                  className="kanbun-btn-soft"
                  onClick={() => setModalOpen(false)}
                >
                  キャンセル
                </button>

                <button type="submit" className="kanbun-btn">
                  保存
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
}