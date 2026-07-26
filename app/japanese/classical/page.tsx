"use client";

import Link from "next/link";
import {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CategoryId =
  | "word"
  | "auxiliary"
  | "particle"
  | "honorific"
  | "grammar";

type ClassicalItem = {
  id: string;
  category: CategoryId;
  title: string;
  group: string;
  meaning: string;
  connection?: string;
  usage?: string;
  example?: string;
  memory?: string;
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
  connection: string;
  usage: string;
  example: string;
  memory: string;
};

type SavedState = {
  customItems: ClassicalItem[];
  favorites: string[];
  itemNotes: Record<string, string>;
  notebook: NoteBlock[];
  learned: string[];
};

const STORAGE_KEY = "study-os-classical-japanese-v2";

const categories: {
  id: CategoryId;
  title: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "word",
    title: "古文単語",
    icon: "📖",
    description: "頻出単語の意味・使い分け・覚え方",
  },
  {
    id: "auxiliary",
    title: "助動詞",
    icon: "⚙️",
    description: "意味・接続・識別・例文",
  },
  {
    id: "particle",
    title: "助詞",
    icon: "🔤",
    description: "係助詞・接続助詞・格助詞など",
  },
  {
    id: "honorific",
    title: "敬語",
    icon: "👑",
    description: "尊敬・謙譲・丁寧と敬意の方向",
  },
  {
    id: "grammar",
    title: "文法",
    icon: "📝",
    description: "係り結び・識別・主語判定など",
  },
];

const builtInItems: ClassicalItem[] = [
  // 古文単語
  {
    id: "word-ahare",
    category: "word",
    title: "あはれ",
    group: "感情・評価",
    meaning: "しみじみと心を動かされる趣・感動。",
    usage: "うれしさ、悲しさ、美しさなど幅広い感動を表す。",
    example: "例：月を見て、あはれと思ふ。",
    memory: "「ああ、はれやか」ではなく、しみじみ系の感動。",
  },
  {
    id: "word-wokasi",
    category: "word",
    title: "をかし",
    group: "感情・評価",
    meaning: "趣がある。美しい。おもしろい。",
    usage: "明るく知的な美しさや、見ていて楽しい様子に使われる。",
    example: "例：春はあけぼの。やうやう白くなりゆく山ぎは、をかし。",
    memory: "『枕草子』の美意識＝をかし。",
  },
  {
    id: "word-imiJi",
    category: "word",
    title: "いみじ",
    group: "程度",
    meaning: "とても。たいそう。すばらしい。ひどい。",
    usage: "程度がはなはだしいこと。文脈により良い意味にも悪い意味にもなる。",
    example: "例：いみじううつくしき児なり。",
    memory: "「意味が強い」→程度がものすごい。",
  },
  {
    id: "word-yagate",
    category: "word",
    title: "やがて",
    group: "時間・状態",
    meaning: "そのまま。すぐに。やがて。",
    usage: "古文では現代語の「そのうち」だけでなく「そのまま」の意味が重要。",
    example: "例：立ちたる所に、やがて居ぬ。",
    memory: "古文の第一候補は「そのまま」。",
  },
  {
    id: "word-naho",
    category: "word",
    title: "なほ",
    group: "副詞",
    meaning: "やはり。さらに。それでも。",
    usage: "前の内容を受けても結論が変わらない場合や、程度が増す場合に使う。",
    example: "例：なほ都へ帰らむと思ふ。",
    memory: "「なお」の現代語と近いが「やはり」が頻出。",
  },
  {
    id: "word-okotaru",
    category: "word",
    title: "おこたる",
    group: "動詞",
    meaning: "病気がよくなる。怠ける。",
    usage: "古文では「病気が回復する」の意味がよく出る。",
    example: "例：病おこたりて、起きゐたり。",
    memory: "「怠る」だけで決めつけない。",
  },
  {
    id: "word-nayamashi",
    category: "word",
    title: "なやまし",
    group: "形容詞",
    meaning: "気分が悪い。病気で苦しい。",
    usage: "現代語の「悩ましい」とは違い、身体的な不調を表すことが多い。",
    example: "例：心地なやましければ、臥したり。",
    memory: "古文の「なやまし」＝体調不良。",
  },
  {
    id: "word-uti",
    category: "word",
    title: "うち",
    group: "名詞",
    meaning: "内側。宮中。天皇。心の中。",
    usage: "文脈によって場所・身分・心理を表す。",
    example: "例：内に参り給ふ。",
    memory: "敬語が多ければ宮中や天皇の可能性。",
  },
  {
    id: "word-sarugoto",
    category: "word",
    title: "さること",
    group: "連語",
    meaning: "もっともなこと。そのようなこと。",
    usage: "「さる」は「そのような」、「こと」は事柄。",
    example: "例：さることもあらむ。",
    memory: "猿ではない。「然ること」。",
  },
  {
    id: "word-ariki",
    category: "word",
    title: "ありく",
    group: "動詞",
    meaning: "歩き回る。あちこち〜して回る。",
    usage: "他の動詞の連用形について、継続的に行動する意味になることもある。",
    example: "例：遊びありく。",
    memory: "「歩く」より広く、動き回る。",
  },
  {
    id: "word-omohoyu",
    category: "word",
    title: "おぼゆ",
    group: "動詞",
    meaning: "思われる。感じられる。思い出される。似る。",
    usage: "自発の意味が中心。誰かに自然と思われる。",
    example: "例：昔のことおぼゆ。",
    memory: "「覚える」だけにしない。自然に思われる。",
  },
  {
    id: "word-miru",
    category: "word",
    title: "見る",
    group: "動詞",
    meaning: "見る。会う。世話をする。結婚する。",
    usage: "男女関係の文脈では「結婚する」の意味がある。",
    example: "例：女を見て、年ごろ経たり。",
    memory: "古文の「見る」は人間関係まで見る。",
  },
  {
    id: "word-yorodu",
    category: "word",
    title: "よろづ",
    group: "名詞・副詞",
    meaning: "さまざま。すべて。何事につけても。",
    usage: "多くの物事をひとまとめに表す。",
    example: "例：よろづのことに心を配る。",
    memory: "「万」＝あらゆるもの。",
  },
  {
    id: "word-yu",
    category: "word",
    title: "ゆかし",
    group: "形容詞",
    meaning: "見たい。聞きたい。知りたい。心ひかれる。",
    usage: "対象への知的好奇心や関心を表す。",
    example: "例：その人のありさま、ゆかしく思ふ。",
    memory: "「床しい」ではなく「行きたい・知りたい」。",
  },
  {
    id: "word-kokoronikusi",
    category: "word",
    title: "こころにくし",
    group: "形容詞",
    meaning: "奥ゆかしい。上品だ。心ひかれる。",
    usage: "見えない部分に魅力や深みを感じる評価。",
    example: "例：もの越しのけはひ、こころにくし。",
    memory: "心が憎いほど魅力的＝奥ゆかしい。",
  },
  {
    id: "word-uturou",
    category: "word",
    title: "うつろふ",
    group: "動詞",
    meaning: "色あせる。心変わりする。移動する。",
    usage: "花の色や人の愛情が変化する場面で頻出。",
    example: "例：花の色はうつろひにけり。",
    memory: "移ろう＝変化する。",
  },
  {
    id: "word-sugou",
    category: "word",
    title: "すごし",
    group: "形容詞",
    meaning: "もの寂しい。気味が悪い。すばらしい。",
    usage: "ぞっとするほどの寂しさや、圧倒される美しさを表す。",
    example: "例：秋の夜の月、すごく見ゆ。",
    memory: "現代語の「すごい」の原点。圧倒される感じ。",
  },
  {
    id: "word-uturukushi",
    category: "word",
    title: "うつくし",
    group: "形容詞",
    meaning: "かわいらしい。いとしい。",
    usage: "古文では小さなものや子どもへの愛情を表す。",
    example: "例：瓜にかきたるちごの顔、いとうつくし。",
    memory: "古文の第一候補は「かわいい」。",
  },
  {
    id: "word-katashi",
    category: "word",
    title: "かたし",
    group: "形容詞",
    meaning: "難しい。めったにない。",
    usage: "実現困難または希少であることを表す。",
    example: "例：会ふことかたし。",
    memory: "「難い」と同じ。",
  },
  {
    id: "word-binasi",
    category: "word",
    title: "びんなし",
    group: "形容詞",
    meaning: "都合が悪い。具合が悪い。気の毒だ。",
    usage: "場面や立場に対して不都合であること。",
    example: "例：人の見るに、びんなきことなり。",
    memory: "便なし＝都合が悪い。",
  },
  {
    id: "word-kususi",
    category: "word",
    title: "くすし",
    group: "形容詞",
    meaning: "不思議だ。神秘的だ。",
    usage: "人の力を超えた霊妙さに用いる。",
    example: "例：くすしき光さし入りたり。",
    memory: "薬師・神のような不思議さ。",
  },
  {
    id: "word-atara",
    category: "word",
    title: "あたらし",
    group: "形容詞",
    meaning: "惜しい。もったいない。",
    usage: "現代語の「新しい」とは異なる。",
    example: "例：あたらしき命を失ひぬ。",
    memory: "古文の「あたらし」＝惜しい。",
  },
  {
    id: "word-hazukashi",
    category: "word",
    title: "はづかし",
    group: "形容詞",
    meaning: "立派だ。気後れするほどすばらしい。",
    usage: "相手が優れていて、自分が恥ずかしくなるほどだという評価。",
    example: "例：はづかしき人の御前。",
    memory: "恥ずかしい原因は、相手が立派だから。",
  },
  {
    id: "word-yasusi",
    category: "word",
    title: "やすし",
    group: "形容詞",
    meaning: "たやすい。安心だ。穏やかだ。",
    usage: "簡単さや心の安らぎを表す。",
    example: "例：このこと、やすく成し遂げむ。",
    memory: "安し＝簡単・安心。",
  },
  {
    id: "word-tuide",
    category: "word",
    title: "ついで",
    group: "名詞",
    meaning: "機会。順序。",
    usage: "何かをするのにちょうどよい機会を表す。",
    example: "例：参るついでに、文を奉る。",
    memory: "現代語の「ついで」と近い。",
  },
  {
    id: "word-kotoWari",
    category: "word",
    title: "ことわり",
    group: "名詞",
    meaning: "道理。もっともなこと。理由。",
    usage: "物事の筋道や当然性。",
    example: "例：人の嘆くもことわりなり。",
    memory: "理＝道理。",
  },
  {
    id: "word-kehai",
    category: "word",
    title: "けはひ",
    group: "名詞",
    meaning: "様子。雰囲気。気配。",
    usage: "姿が直接見えなくても感じ取れる様子。",
    example: "例：人のけはひ、ただならず。",
    memory: "現代語の「気配」とほぼ同じ。",
  },
  {
    id: "word-fumi",
    category: "word",
    title: "ふみ",
    group: "名詞",
    meaning: "手紙。漢詩・漢文。書物。",
    usage: "恋愛場面では手紙、学問場面では漢籍のことが多い。",
    example: "例：ふみを書きて遣はす。",
    memory: "文＝手紙・書物。",
  },
  {
    id: "word-sama",
    category: "word",
    title: "さま",
    group: "名詞",
    meaning: "様子。方法。方向。",
    usage: "文脈により状態・手段・向かう先を表す。",
    example: "例：帰るさまに人に会ふ。",
    memory: "「様」だけでなく「方向」もある。",
  },
  {
    id: "word-sibasi",
    category: "word",
    title: "しばし",
    group: "時間",
    meaning: "少しの間。しばらく。",
    usage: "短い時間を表す。",
    example: "例：しばし待ち給へ。",
    memory: "現代語とほぼ同じ。",
  },
  {
    id: "word-touto",
    category: "word",
    title: "とく",
    group: "時間",
    meaning: "早く。すぐに。",
    usage: "形容詞「とし（速し）」の連用形。",
    example: "例：とく参れ。",
    memory: "「得」ではなく「早く」。",
  },

  // 助動詞
  {
    id: "aux-ru-raru",
    category: "auxiliary",
    title: "る・らる",
    group: "受身・尊敬・自発・可能",
    meaning: "受身、尊敬、自発、可能。",
    connection: "未然形に接続。四段・ナ変・ラ変には「る」、それ以外には「らる」。",
    usage:
      "主語が高貴な人物なら尊敬。自然にそう思われるなら自発。能力・状況なら可能。動作を受けるなら受身。",
    example: "例：昔のこと思ひ出でらる。（自然と思い出される＝自発）",
    memory: "「受・尊・自・可（じゅそんじか）」。",
  },
  {
    id: "aux-su-sasu-simu",
    category: "auxiliary",
    title: "す・さす・しむ",
    group: "使役・尊敬",
    meaning: "使役、尊敬。",
    connection: "未然形に接続。",
    usage:
      "「〜に…させる」なら使役。高貴な主語に直接つき、使役の相手がなければ尊敬を疑う。",
    example: "例：人に歌を詠ませ給ふ。（詠ませる＝使役）",
    memory: "誰かにさせる→使役。高貴な人自身→尊敬。",
  },
  {
    id: "aux-zu",
    category: "auxiliary",
    title: "ず",
    group: "打消",
    meaning: "〜ない。",
    connection: "未然形に接続。",
    usage:
      "連用形「ず・ざり」、終止形「ず」、連体形「ぬ・ざる」など形が変わる。",
    example: "例：人も来ず。",
    memory: "「ぬ」が打消になる場合がある点に注意。",
  },
  {
    id: "aux-mu",
    category: "auxiliary",
    title: "む（ん）",
    group: "推量・意志・勧誘・仮定・婉曲・適当",
    meaning: "〜だろう。〜しよう。〜するのがよい。",
    connection: "未然形に接続。",
    usage:
      "一人称主語なら意志、二人称なら勧誘・適当、三人称なら推量が基本。連体形で名詞を修飾すると婉曲が多い。",
    example: "例：われ行かむ。（私は行こう＝意志）",
    memory: "主語で判断。一人称＝意志、三人称＝推量。",
  },
  {
    id: "aux-muzu",
    category: "auxiliary",
    title: "むず（んず）",
    group: "推量・意志",
    meaning: "〜だろう。〜しよう。",
    connection: "未然形に接続。",
    usage: "「むとす」が縮まった形。意味は「む」に近い。",
    example: "例：雨降らんず。",
    memory: "むとす → むず → んず。",
  },
  {
    id: "aux-masi",
    category: "auxiliary",
    title: "まし",
    group: "反実仮想・ためらい・推量",
    meaning: "もし〜なら…だろうに。〜したらよいだろうか。",
    connection: "未然形に接続。",
    usage:
      "「せば〜まし」「ましかば〜まし」の形は反実仮想。疑問語を伴うとためらいの意志。",
    example: "例：鳥ならましかば、飛びて行かまし。",
    memory: "現実と反対の想像＝反実仮想。",
  },
  {
    id: "aux-ji",
    category: "auxiliary",
    title: "じ",
    group: "打消推量・打消意志",
    meaning: "〜ないだろう。〜するまい。",
    connection: "未然形に接続。",
    usage: "一人称主語なら打消意志、三人称主語なら打消推量。",
    example: "例：われは行くまじではなく、われは行かじ。",
    memory: "「む」の打消版。",
  },
  {
    id: "aux-ki",
    category: "auxiliary",
    title: "き",
    group: "過去",
    meaning: "〜た。",
    connection: "連用形に接続。",
    usage: "話し手が直接経験した過去を表すことが多い。",
    example: "例：昨日、寺へ参りき。",
    memory: "直接体験の過去。",
  },
  {
    id: "aux-keri",
    category: "auxiliary",
    title: "けり",
    group: "過去・詠嘆",
    meaning: "〜た。〜たのだなあ。",
    connection: "連用形に接続。",
    usage:
      "物語の地の文では過去。和歌や会話で気づき・感動があれば詠嘆。",
    example: "例：花は散りけり。（花は散ったのだなあ）",
    memory: "物語＝過去、和歌＝詠嘆をまず疑う。",
  },
  {
    id: "aux-tu-nu",
    category: "auxiliary",
    title: "つ・ぬ",
    group: "完了・強意",
    meaning: "〜た。きっと〜。すっかり〜。",
    connection: "連用形に接続。",
    usage:
      "後ろに推量の助動詞が続くと強意になりやすい。「てむ」「なむ」「つべし」「ぬべし」。",
    example: "例：必ず参りなむ。（きっと参上するだろう）",
    memory: "推量とセットなら強意。",
  },
  {
    id: "aux-tari-ri",
    category: "auxiliary",
    title: "たり・り",
    group: "完了・存続",
    meaning: "〜た。〜ている。",
    connection:
      "「たり」は連用形に接続。「り」はサ変未然形・四段已然形に接続。",
    usage: "動作が終わったなら完了、結果の状態が続くなら存続。",
    example: "例：門閉ぢたり。（門が閉じている＝存続）",
    memory: "「り」の接続は『サ未四已（さみしい）』。",
  },
  {
    id: "aux-besi",
    category: "auxiliary",
    title: "べし",
    group: "推量・意志・可能・当然・命令・適当",
    meaning: "〜だろう。〜べきだ。〜できる。〜せよ。",
    connection: "終止形に接続。ラ変型には連体形に接続。",
    usage:
      "主語や文脈で識別。一人称＝意志、二人称＝命令・適当、三人称＝推量が基本。",
    example: "例：人は約束を守るべし。（当然）",
    memory: "「す・い・か・と・め・て」＝推意可当命適。",
  },
  {
    id: "aux-rasu",
    category: "auxiliary",
    title: "らむ",
    group: "現在推量・現在原因推量・伝聞・婉曲",
    meaning: "今ごろ〜ているだろう。なぜ〜ているのだろう。",
    connection: "終止形に接続。ラ変型には連体形。",
    usage:
      "目の前にない現在を推量する。「など・なに・いかに」と共にあれば原因推量。",
    example: "例：都では今ごろ花咲くらむ。",
    memory: "「今」の推量。",
  },
  {
    id: "aux-kemu",
    category: "auxiliary",
    title: "けむ",
    group: "過去推量・過去原因推量・伝聞・婉曲",
    meaning: "〜ただろう。なぜ〜たのだろう。",
    connection: "連用形に接続。",
    usage: "直接知らない過去を推量する。",
    example: "例：昔の人はいかに思ひけむ。",
    memory: "「過去」の推量。",
  },
  {
    id: "aux-rasi",
    category: "auxiliary",
    title: "らし",
    group: "推定",
    meaning: "〜らしい。",
    connection: "終止形に接続。ラ変型には連体形。",
    usage: "目に見える根拠をもとに判断する。",
    example: "例：風の音す。雨降るらし。",
    memory: "根拠ありの推定。",
  },
  {
    id: "aux-meri",
    category: "auxiliary",
    title: "めり",
    group: "推定・婉曲",
    meaning: "〜ようだ。〜ように見える。",
    connection: "終止形に接続。ラ変型には連体形。",
    usage: "視覚的な根拠による推定。「見あり」が変化したとされる。",
    example: "例：人の来るめり。",
    memory: "目で見て推定＝めり。",
  },
  {
    id: "aux-nari-hearsay",
    category: "auxiliary",
    title: "なり（伝聞・推定）",
    group: "伝聞・推定",
    meaning: "〜そうだ。〜という。〜ようだ。",
    connection: "終止形に接続。ラ変型には連体形。",
    usage: "音や人から聞いた情報による。「音あり」が語源とされる。",
    example: "例：鐘の鳴るなり。",
    memory: "耳で聞く「なり」。",
  },
  {
    id: "aux-nari-assert",
    category: "auxiliary",
    title: "なり（断定）",
    group: "断定・存在",
    meaning: "〜である。〜にある。",
    connection: "体言・連体形に接続。",
    usage: "名詞や連体形の後につき、断定または存在を示す。",
    example: "例：これは夢なり。",
    memory: "体言・連体形につく断定。",
  },
  {
    id: "aux-tari-assert",
    category: "auxiliary",
    title: "たり（断定）",
    group: "断定",
    meaning: "〜である。",
    connection: "体言に接続。",
    usage: "漢文訓読調でよく使われる。",
    example: "例：堂々たる人物。",
    memory: "「〜たる」の形で残る。",
  },
  {
    id: "aux-gotosi",
    category: "auxiliary",
    title: "ごとし",
    group: "比況・例示・推定",
    meaning: "〜のようだ。〜と同じだ。",
    connection: "体言＋の、連体形、助詞「が」の後など。",
    usage: "何かにたとえる表現。",
    example: "例：月のごとく明らかなり。",
    memory: "現代語の「ごとく」と同じ。",
  },

  // 助詞
  {
    id: "particle-zo",
    category: "particle",
    title: "ぞ",
    group: "係助詞",
    meaning: "強意。文末を連体形で結ぶ。",
    usage: "係り結びを起こし、強く取り立てる。",
    example: "例：花ぞ美しき。",
    memory: "ぞ・なむ・や・か → 連体形。",
  },
  {
    id: "particle-namu",
    category: "particle",
    title: "なむ（係助詞）",
    group: "係助詞",
    meaning: "強意。文末を連体形で結ぶ。",
    usage: "文中に置かれ、内容を強調する。",
    example: "例：これなむ名高き寺なる。",
    memory: "「なむ」は係助詞・終助詞・完了＋推量などを識別。",
  },
  {
    id: "particle-ya-ka",
    category: "particle",
    title: "や・か",
    group: "係助詞",
    meaning: "疑問・反語。文末を連体形で結ぶ。",
    usage: "疑問語がある、答えを求めるなら疑問。否定的な意味を含むなら反語。",
    example: "例：誰か来る。（誰が来るのか）",
    memory: "や・か → 疑問か反語。",
  },
  {
    id: "particle-koso",
    category: "particle",
    title: "こそ",
    group: "係助詞",
    meaning: "強意。文末を已然形で結ぶ。",
    usage: "「こそ〜已然形」で逆接的な余韻を持つ場合もある。",
    example: "例：春こそ花は美しけれ。",
    memory: "こそだけ已然形。",
  },
  {
    id: "particle-ba",
    category: "particle",
    title: "ば",
    group: "接続助詞",
    meaning: "未然形接続なら仮定条件、已然形接続なら確定条件。",
    connection: "未然形・已然形に接続。",
    usage:
      "未然形＋ば＝もし〜なら。已然形＋ば＝〜ので、〜すると、〜ところ。",
    example: "例：風吹けば、花散る。（風が吹くと）",
    memory: "未然＝もし、已然＝ので・すると。",
  },
  {
    id: "particle-domo",
    category: "particle",
    title: "ど・ども",
    group: "接続助詞",
    meaning: "〜けれども。",
    connection: "已然形に接続。",
    usage: "逆接確定条件を表す。",
    example: "例：呼べども、答へず。",
    memory: "已然形＋ど・ども＝逆接。",
  },
  {
    id: "particle-te",
    category: "particle",
    title: "て",
    group: "接続助詞",
    meaning: "単純接続、順接、逆接、並列など。",
    connection: "連用形に接続。",
    usage: "前後関係を文脈から判断する。",
    example: "例：門を開けて、入りぬ。",
    memory: "現代語の「て」と近いが関係は多様。",
  },
  {
    id: "particle-ni",
    category: "particle",
    title: "に",
    group: "格助詞・接続助詞",
    meaning: "場所・時・対象・原因など。〜のに、〜ので。",
    usage: "体言につけば格助詞、活用語の連体形につけば接続助詞の可能性。",
    example: "例：都に上る。／待つに、人来ず。",
    memory: "前が名詞か活用語かを見る。",
  },
  {
    id: "particle-wo",
    category: "particle",
    title: "を",
    group: "格助詞・接続助詞",
    meaning: "対象・起点・経過場所。〜のに。",
    usage: "連体形の後では逆接の接続助詞になることがある。",
    example: "例：道を行く。／呼ぶを、答へず。",
    memory: "目的語だけとは限らない。",
  },
  {
    id: "particle-ga-no",
    category: "particle",
    title: "が・の",
    group: "格助詞",
    meaning: "主格・連体修飾・同格。",
    usage: "「〜が」「〜の」のほか、主語を表すことも多い。",
    example: "例：鳥の鳴く声。",
    memory: "古文では「の」が主語になる。",
  },
  {
    id: "particle-de",
    category: "particle",
    title: "で",
    group: "接続助詞",
    meaning: "〜ないで。〜なくて。",
    connection: "打消の助動詞「ず」の連用形から生じた形。",
    usage: "打消を伴う接続。",
    example: "例：物も言はで去りぬ。",
    memory: "「言わないで」。",
  },
  {
    id: "particle-tutu",
    category: "particle",
    title: "つつ",
    group: "接続助詞",
    meaning: "〜ながら。何度も〜して。",
    connection: "連用形に接続。",
    usage: "動作の同時進行または反復継続。",
    example: "例：月を見つつ語る。",
    memory: "ながら・繰り返し。",
  },
  {
    id: "particle-nagara",
    category: "particle",
    title: "ながら",
    group: "接続助詞",
    meaning: "〜ながら。〜けれども。〜のまま。",
    usage: "同時進行、逆接、状態の継続を表す。",
    example: "例：知りながら言はず。",
    memory: "文脈で「ながら」「けれども」「のまま」。",
  },
  {
    id: "particle-kana",
    category: "particle",
    title: "かな",
    group: "終助詞",
    meaning: "〜だなあ。〜ことよ。",
    usage: "詠嘆を表す。和歌の末尾に多い。",
    example: "例：花の美しきかな。",
    memory: "感動の「かな」。",
  },
  {
    id: "particle-namu-final",
    category: "particle",
    title: "なむ（終助詞）",
    group: "終助詞",
    meaning: "〜てほしい。",
    connection: "未然形に接続。",
    usage: "他者への願望を表す。",
    example: "例：早く帰りなむ。",
    memory: "未然形＋なむ＝願望。",
  },

  // 敬語
  {
    id: "honorific-tamau",
    category: "honorific",
    title: "給ふ（四段）",
    group: "尊敬語",
    meaning: "お〜になる。〜なさる。",
    usage: "動作主を高める。高貴な人物の動作につく。",
    example: "例：帝、御覧じ給ふ。",
    memory: "四段活用の「給ふ」は尊敬。",
  },
  {
    id: "honorific-tamau-lower",
    category: "honorific",
    title: "給ふ（下二段）",
    group: "謙譲語",
    meaning: "〜ております。〜ます。",
    usage: "会話文で話し手が自分の動作をへりくだる補助動詞。",
    example: "例：かく思ひ給ふ。",
    memory: "下二段・会話・自分の動作なら謙譲。",
  },
  {
    id: "honorific-mairu",
    category: "honorific",
    title: "参る",
    group: "謙譲語",
    meaning: "参上する。差し上げる。召し上がる。",
    usage:
      "基本は「行く・来」の謙譲語。飲食物を高貴な人に差し上げる意味や、尊敬語的用法もある。",
    example: "例：宮中へ参る。",
    memory: "誰がどこへ向かうかを見る。",
  },
  {
    id: "honorific-mausu",
    category: "honorific",
    title: "申す",
    group: "謙譲語",
    meaning: "申し上げる。",
    usage: "「言ふ」の謙譲語。言葉を受ける相手を高める。",
    example: "例：帝に申す。",
    memory: "敬意は話を聞く相手へ。",
  },
  {
    id: "honorific-kikoYu",
    category: "honorific",
    title: "聞こゆ",
    group: "謙譲語",
    meaning: "申し上げる。差し上げる。",
    usage: "高貴な相手に言葉や物を届ける。",
    example: "例：御文を聞こゆ。",
    memory: "「聞こえる」だけでなく謙譲語。",
  },
  {
    id: "honorific-tatematuru",
    category: "honorific",
    title: "奉る",
    group: "謙譲語・尊敬語",
    meaning: "差し上げる。申し上げる。お召しになる。",
    usage: "基本は謙譲。衣食乗などに関して尊敬語になる場合がある。",
    example: "例：御衣を奉る。（差し上げる）",
    memory: "まず謙譲、衣食乗なら尊敬も確認。",
  },
  {
    id: "honorific-haberu",
    category: "honorific",
    title: "侍り",
    group: "丁寧語・謙譲語",
    meaning: "あります。おります。お仕えする。",
    usage: "聞き手への丁寧語、または高貴な人のそばに控える謙譲語。",
    example: "例：ここに侍り。",
    memory: "丁寧な「あり」。",
  },
  {
    id: "honorific-sourou",
    category: "honorific",
    title: "候ふ",
    group: "丁寧語・謙譲語",
    meaning: "ございます。おります。お仕えする。",
    usage: "「侍り」とほぼ同じ。中世以降に多い。",
    example: "例：さることに候ふ。",
    memory: "候文の「そうろう」。",
  },
  {
    id: "honorific-obosu",
    category: "honorific",
    title: "おぼす・おぼしめす",
    group: "尊敬語",
    meaning: "お思いになる。",
    usage: "「思ふ」の尊敬語。動作主を高める。",
    example: "例：帝、あはれとおぼす。",
    memory: "思う人が高貴。",
  },
  {
    id: "honorific-notamau",
    category: "honorific",
    title: "のたまふ・仰す",
    group: "尊敬語",
    meaning: "おっしゃる。",
    usage: "「言ふ」の尊敬語。",
    example: "例：院、かくのたまふ。",
    memory: "言う人を高める。",
  },
  {
    id: "honorific-goran",
    category: "honorific",
    title: "御覧ず",
    group: "尊敬語",
    meaning: "御覧になる。",
    usage: "「見る」の尊敬語。",
    example: "例：この絵を御覧ず。",
    memory: "現代語の「ご覧になる」。",
  },
  {
    id: "honorific-mesu",
    category: "honorific",
    title: "召す",
    group: "尊敬語",
    meaning: "お呼びになる。お召しになる。召し上がる。お乗りになる。",
    usage: "「呼ぶ・着る・食う・乗る」など複数動作の尊敬語。",
    example: "例：御車に召す。",
    memory: "何を召すかで意味を決める。",
  },
  {
    id: "honorific-miyu",
    category: "honorific",
    title: "見ゆ",
    group: "尊敬語・受身・自発",
    meaning: "お見えになる。見られる。自然と見える。",
    usage: "主語が高貴なら尊敬語「いらっしゃる」の可能性。",
    example: "例：宮、ここに見え給ふ。",
    memory: "高貴な主語なら「お見えになる」。",
  },

  // 文法
  {
    id: "grammar-kakarimusubi",
    category: "grammar",
    title: "係り結び",
    group: "重要文法",
    meaning: "係助詞により文末の活用形が変化する。",
    usage:
      "ぞ・なむ・や・か → 連体形。こそ → 已然形。係助詞が省略される場合や、結びが流れる場合もある。",
    example: "例：花ぞ美しき。／花こそ美しけれ。",
    memory: "ぞなむやか連体、こそ已然。",
  },
  {
    id: "grammar-subject",
    category: "grammar",
    title: "主語の判定",
    group: "読解",
    meaning: "省略された主語を敬語・接続助詞・会話から判断する。",
    usage:
      "尊敬語の動作主は高貴な人物。謙譲語の敬意は動作の相手へ。「て」「つつ」は主語継続、「を」「に」「が」「ど」「ば」で主語転換を疑う。",
    example: "例：尊敬語が続く人物を中心に主語を追う。",
    memory: "敬語と接続助詞が主語判定の鍵。",
  },
  {
    id: "grammar-ba",
    category: "grammar",
    title: "「ば」の識別",
    group: "識別",
    meaning: "未然形＋ばは仮定、已然形＋ばは確定。",
    usage:
      "未然形なら「もし〜なら」。已然形なら「〜ので」「〜すると」「〜ところ」。",
    example: "例：行かば（もし行くなら）／行けば（行くと）",
    memory: "前の活用形を見る。",
  },
  {
    id: "grammar-nu",
    category: "grammar",
    title: "「ぬ」の識別",
    group: "識別",
    meaning: "打消の助動詞「ず」の連体形、または完了の助動詞「ぬ」の終止形。",
    usage:
      "未然形＋ぬなら打消、連用形＋ぬなら完了。後ろに名詞があれば打消の連体形も考える。",
    example: "例：咲かぬ花（咲かない）／花咲きぬ（咲いた）",
    memory: "未然＋ぬ＝打消、連用＋ぬ＝完了。",
  },
  {
    id: "grammar-nari",
    category: "grammar",
    title: "「なり」の識別",
    group: "識別",
    meaning: "断定の「なり」と、伝聞・推定の「なり」を見分ける。",
    usage:
      "体言・連体形につけば断定。終止形につき、音や伝聞の根拠があれば伝聞・推定。",
    example: "例：夢なり（断定）／鐘鳴るなり（推定）",
    memory: "接続と「音」を確認。",
  },
  {
    id: "grammar-namu",
    category: "grammar",
    title: "「なむ」の識別",
    group: "識別",
    meaning: "係助詞、終助詞、完了「ぬ」未然形＋推量「む」など。",
    usage:
      "文中で係り結びなら係助詞。未然形接続で文末なら願望。連用形接続で「きっと〜だろう」なら完了＋推量。",
    example: "例：これなむ〜なる（係助詞）／帰りなむ（願望）",
    memory: "位置・接続・文末の形を見る。",
  },
  {
    id: "grammar-ni",
    category: "grammar",
    title: "「に」の識別",
    group: "識別",
    meaning: "格助詞、接続助詞、断定「なり」の連用形、完了「ぬ」の連用形。",
    usage:
      "体言の後なら格助詞または断定。連体形の後なら接続助詞。連用形の後で後続助動詞があれば完了の可能性。",
    example: "例：静かにあり（断定）／花散りにけり（完了）",
    memory: "前後の品詞を見る。",
  },
  {
    id: "grammar-rental",
    category: "grammar",
    title: "連体形の用法",
    group: "活用",
    meaning: "名詞を修飾するほか、係り結びや準体法に使う。",
    usage:
      "後ろの名詞が省略され、連体形だけで「〜こと・もの・人」を表す準体法がある。",
    example: "例：昔ありけるは、翁なり。",
    memory: "連体形の後ろに名詞を補ってみる。",
  },
  {
    id: "grammar-rhetoric",
    category: "grammar",
    title: "疑問と反語",
    group: "読解",
    meaning: "「や・か」などが本当の疑問か、反語かを判断する。",
    usage:
      "答えを求めていれば疑問。「どうして〜だろうか、いや〜ない」の意味なら反語。",
    example: "例：誰か知らざらむ。（誰が知らないだろうか、いや皆知っている）",
    memory: "否定を反転させると自然なら反語。",
  },
  {
    id: "grammar-quotation",
    category: "grammar",
    title: "会話文・心内文",
    group: "読解",
    meaning: "「と」「など」の前後や敬語から話者を判断する。",
    usage:
      "会話が終わった後も主語が省略されることがある。誰が誰に話したかを人物関係と敬語で確認する。",
    example: "例：「〜」と申す。→申す人は相手を高めている。",
    memory: "話者・聞き手・敬意の方向を三点セットで。",
  },
  {
    id: "grammar-waka",
    category: "grammar",
    title: "和歌の読み方",
    group: "読解",
    meaning: "景物・心情・掛詞・縁語・序詞などを確認する。",
    usage:
      "まず何を見て、どんな気持ちになったかを取る。技巧は意味を補強するものとして読む。",
    example: "例：景色→連想→心情の順に整理。",
    memory: "技巧探しだけで終わらず、心情まで戻る。",
  },
];

const emptyForm: FormState = {
  title: "",
  group: "",
  meaning: "",
  connection: "",
  usage: "",
  example: "",
  memory: "",
};

const css = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  button, input, textarea, select { font: inherit; }
  .classical-page {
    min-height: 100vh;
    padding: 24px 14px 72px;
    color: #302624;
    background:
      radial-gradient(circle at 0% 0%, rgba(127,29,29,.08), transparent 28%),
      linear-gradient(145deg, #faf7f4 0%, #f6efeb 50%, #efe5e0 100%);
  }
  .classical-container { width: 100%; max-width: 1200px; margin: 0 auto; }
  .classical-topbar {
    display: flex; justify-content: space-between; align-items: center;
    gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
  }
  .classical-brand {
    margin: 0; color: #7f1d1d; font-size: 12px; font-weight: 950;
    letter-spacing: .14em;
  }
  .classical-back {
    text-decoration: none; color: #7f1d1d; background: rgba(255,255,255,.82);
    border: 1px solid #dfcfca; border-radius: 12px; padding: 10px 14px;
    font-size: 13px; font-weight: 900;
  }
  .classical-hero {
    padding: clamp(28px,5vw,52px);
    border-radius: 28px; color: white; margin-bottom: 20px;
    background: linear-gradient(135deg,#6f171d 0%,#8c2430 52%,#542025 100%);
    box-shadow: 0 24px 60px rgba(83,24,28,.18);
  }
  .classical-eyebrow {
    margin: 0 0 10px; color: #fecaca; font-size: 11px;
    font-weight: 950; letter-spacing: .17em;
  }
  .classical-title {
    margin: 0; font-size: clamp(40px,7vw,68px); letter-spacing: -.05em;
  }
  .classical-hero-text {
    max-width: 720px; margin: 15px 0 0; color: #fee2e2;
    font-size: 14px; line-height: 1.9;
  }
  .classical-stats {
    display: grid; grid-template-columns: repeat(4,minmax(0,1fr));
    gap: 10px; margin: 16px 0 20px;
  }
  .classical-stat {
    padding: 15px; border: 1px solid #e2d3ce; border-radius: 17px;
    background: rgba(255,255,255,.86); box-shadow: 0 9px 24px rgba(65,38,34,.06);
  }
  .classical-stat-label { margin: 0; color: #8b6f6b; font-size: 11px; font-weight: 850; }
  .classical-stat-value { margin: 6px 0 0; color: #6d252b; font-size: 24px; font-weight: 950; }
  .classical-toolbar {
    display: grid; grid-template-columns: minmax(0,1fr) auto auto;
    gap: 9px; margin-bottom: 17px;
  }
  .classical-input,.classical-textarea,.classical-select {
    width: 100%; border: 1px solid #ddcfcb; border-radius: 13px;
    padding: 12px 13px; background: white; color: #352a28; outline: none;
  }
  .classical-input:focus,.classical-textarea:focus,.classical-select:focus {
    border-color: #a64b53; box-shadow: 0 0 0 3px rgba(127,29,29,.08);
  }
  .classical-textarea { min-height: 105px; resize: vertical; line-height: 1.75; }
  .classical-btn {
    min-height: 44px; border: none; border-radius: 13px; padding: 0 15px;
    cursor: pointer; background: #861f2a; color: white; font-weight: 900;
  }
  .classical-btn-soft {
    min-height: 44px; border: 1px solid #dbc8c3; border-radius: 13px;
    padding: 0 15px; cursor: pointer; background: white; color: #7f1d1d;
    font-weight: 900;
  }
  .classical-layout {
    display: grid; grid-template-columns: 252px minmax(0,1fr);
    gap: 18px; align-items: start;
  }
  .classical-sidebar {
    position: sticky; top: 16px; padding: 10px;
    border: 1px solid #e1d2cd; border-radius: 20px;
    background: rgba(255,255,255,.9); box-shadow: 0 12px 30px rgba(70,40,35,.07);
  }
  .classical-side-btn {
    width: 100%; border: none; border-radius: 14px; padding: 12px;
    margin: 3px 0; cursor: pointer; text-align: left; background: transparent;
    color: #4d3936;
  }
  .classical-side-btn.active { background: #f8e5e4; color: #7f1d1d; }
  .classical-side-title { display: block; font-size: 14px; font-weight: 950; }
  .classical-side-desc { display: block; margin-top: 4px; color: #8b7470; font-size: 11px; line-height: 1.5; }
  .classical-content { min-width: 0; }
  .classical-card {
    overflow: hidden; border: 1px solid #e1d2cd; border-radius: 22px;
    background: rgba(255,255,255,.91); box-shadow: 0 12px 30px rgba(70,40,35,.07);
  }
  .classical-card-head {
    display: flex; justify-content: space-between; align-items: center;
    gap: 12px; flex-wrap: wrap; padding: 20px; border-bottom: 1px solid #eadeda;
  }
  .classical-card-title { margin: 0; color: #63272c; font-size: 23px; }
  .classical-card-subtitle { margin: 6px 0 0; color: #8c7470; font-size: 12px; }
  .classical-list { display: grid; gap: 10px; padding: 12px; }
  .classical-item {
    overflow: hidden; border: 1px solid #e6d9d5; border-radius: 17px; background: white;
  }
  .classical-item-main {
    width: 100%; padding: 16px; border: none; cursor: pointer;
    text-align: left; background: transparent; color: #352a28;
  }
  .classical-item-top {
    display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
  }
  .classical-item-title { margin: 0; color: #5f272c; font-size: 18px; }
  .classical-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
  .classical-badge {
    display: inline-flex; padding: 4px 8px; border-radius: 999px;
    color: #96333a; background: #fdf0ef; font-size: 10px; font-weight: 900;
  }
  .classical-badge.learned { color: #365314; background: #ecfccb; }
  .classical-meaning {
    margin: 10px 0 0; color: #695754; font-size: 13px; line-height: 1.75;
  }
  .classical-detail { padding: 2px 16px 16px; border-top: 1px solid #f0e6e3; }
  .classical-info-grid { display: grid; gap: 9px; margin-top: 14px; }
  .classical-info {
    padding: 12px; border-radius: 13px; background: #faf4f1;
    color: #533f3c; font-size: 13px; line-height: 1.75;
  }
  .classical-info strong { color: #762b32; }
  .classical-note-title { margin: 17px 0 8px; color: #6c2d33; font-size: 14px; }
  .classical-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .classical-mini {
    padding: 8px 10px; border: 1px solid #dbc9c5; border-radius: 10px;
    background: white; color: #762b32; cursor: pointer; font-size: 12px; font-weight: 900;
  }
  .classical-mini.danger { color: #b42318; background: #fff7f7; border-color: #efcaca; }
  .classical-empty { padding: 45px 20px; color: #917975; text-align: center; }
  .classical-note-list { display: grid; gap: 12px; padding: 14px; }
  .classical-note-card { padding: 14px; border: 1px solid #e4d6d2; border-radius: 16px; background: white; }
  .classical-modal-backdrop {
    position: fixed; inset: 0; z-index: 50; display: grid; place-items: center;
    padding: 16px; background: rgba(38,20,18,.48);
  }
  .classical-modal {
    width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto;
    padding: 20px; border: 1px solid #e2d1cc; border-radius: 22px;
    background: #fffaf8; box-shadow: 0 30px 80px rgba(43,24,21,.26);
  }
  .classical-form { display: grid; gap: 12px; }
  .classical-label { display: grid; gap: 6px; color: #694047; font-size: 12px; font-weight: 900; }
  .classical-modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 16px; }
  .classical-data-buttons { display: grid; gap: 8px; padding: 10px 4px 2px; }
  @media (max-width: 880px) {
    .classical-layout { grid-template-columns: 1fr; }
    .classical-sidebar { position: static; }
    .classical-sidebar-nav { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); }
  }
  @media (max-width: 700px) {
    .classical-toolbar { grid-template-columns: 1fr; }
    .classical-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
    .classical-sidebar-nav { grid-template-columns: 1fr; }
    .classical-btn,.classical-btn-soft { width: 100%; }
  }
`;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ClassicalJapanesePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("word");
  const [showNotebook, setShowNotebook] = useState(false);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const [customItems, setCustomItems] = useState<ClassicalItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [learned, setLearned] = useState<string[]>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [notebook, setNotebook] = useState<NoteBlock[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassicalItem | null>(null);
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
          item.connection ?? "",
          item.usage ?? "",
          item.example ?? "",
          item.memory ?? "",
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

  function openEditModal(item: ClassicalItem) {
    setEditingItem(item);
    setForm({
      title: item.title,
      group: item.group,
      meaning: item.meaning,
      connection: item.connection ?? "",
      usage: item.usage ?? "",
      example: item.example ?? "",
      memory: item.memory ?? "",
    });
    setModalOpen(true);
  }

  function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.meaning.trim()) return;

    if (editingItem) {
      setCustomItems((items) =>
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: form.title.trim(),
                group: form.group.trim() || "自分で追加",
                meaning: form.meaning.trim(),
                connection: form.connection.trim(),
                usage: form.usage.trim(),
                example: form.example.trim(),
                memory: form.memory.trim(),
              }
            : item,
        ),
      );
    } else {
      setCustomItems((items) => [
        ...items,
        {
          id: uid(),
          category: activeCategory,
          title: form.title.trim(),
          group: form.group.trim() || "自分で追加",
          meaning: form.meaning.trim(),
          connection: form.connection.trim(),
          usage: form.usage.trim(),
          example: form.example.trim(),
          memory: form.memory.trim(),
          custom: true,
        },
      ]);
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
      { id: uid(), title: "新しい古文ノート", body: "" },
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
    anchor.download = "study-os-classical-backup.json";
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
        window.alert("古文データを読み込みました。");
      } catch {
        window.alert("読み込みに失敗しました。正しいJSONファイルを選んでください。");
      } finally {
        if (importRef.current) importRef.current.value = "";
      }
    };

    reader.readAsText(file);
  }

  return (
    <>
      <style>{css}</style>

      <main className="classical-page">
        <div className="classical-container">
          <header className="classical-topbar">
            <p className="classical-brand">
              STUDY OS / JAPANESE / CLASSICAL
            </p>

            <Link href="/japanese" className="classical-back">
              ← 国語ホーム
            </Link>
          </header>

          <section className="classical-hero">
            <p className="classical-eyebrow">CLASSICAL JAPANESE</p>
            <h1 className="classical-title">古文</h1>
            <p className="classical-hero-text">
              古文単語・助動詞・助詞・敬語・文法を一つに整理。
              STUDY OSの公式データに、自分の発見や授業メモを追加して、
              自分専用の古文辞典に育てられます。
            </p>
          </section>

          <section className="classical-stats">
            <div className="classical-stat">
              <p className="classical-stat-label">現在の分野</p>
              <p className="classical-stat-value">
                {activeData.icon} {activeData.title}
              </p>
            </div>

            <div className="classical-stat">
              <p className="classical-stat-label">登録項目</p>
              <p className="classical-stat-value">{categoryItems.length}</p>
            </div>

            <div className="classical-stat">
              <p className="classical-stat-label">覚えた</p>
              <p className="classical-stat-value">
                {learnedInCategory}/{categoryItems.length}
              </p>
            </div>

            <div className="classical-stat">
              <p className="classical-stat-label">お気に入り</p>
              <p className="classical-stat-value">{favorites.length}</p>
            </div>
          </section>

          <div className="classical-toolbar">
            <input
              className="classical-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="単語・意味・文法を検索…"
            />

            <button
              type="button"
              className="classical-btn-soft"
              onClick={() => setShowFavoritesOnly((value) => !value)}
            >
              {showFavoritesOnly ? "⭐ お気に入りのみ" : "☆ お気に入り"}
            </button>

            <button
              type="button"
              className="classical-btn"
              onClick={openCreateModal}
            >
              ＋ 項目を追加
            </button>
          </div>

          <div className="classical-layout">
            <aside className="classical-sidebar">
              <div className="classical-sidebar-nav">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`classical-side-btn ${
                      !showNotebook && activeCategory === category.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setShowNotebook(false);
                      setActiveCategory(category.id);
                    }}
                  >
                    <span className="classical-side-title">
                      {category.icon} {category.title}
                    </span>
                    <span className="classical-side-desc">
                      {category.description}
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  className={`classical-side-btn ${
                    showNotebook ? "active" : ""
                  }`}
                  onClick={() => setShowNotebook(true)}
                >
                  <span className="classical-side-title">📒 古文ノート</span>
                  <span className="classical-side-desc">
                    授業・模試・覚え方を自由に保存
                  </span>
                </button>
              </div>

              <div className="classical-data-buttons">
                <button
                  type="button"
                  className="classical-btn-soft"
                  onClick={exportData}
                >
                  データを書き出す
                </button>

                <button
                  type="button"
                  className="classical-btn-soft"
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

            <section className="classical-content">
              {!showNotebook ? (
                <div className="classical-card">
                  <div className="classical-card-head">
                    <div>
                      <h2 className="classical-card-title">
                        {activeData.icon} {activeData.title}
                      </h2>
                      <p className="classical-card-subtitle">
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
                        className="classical-select"
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
                        className="classical-btn"
                        onClick={openCreateModal}
                      >
                        ＋ {activeData.title}を追加
                      </button>
                    </div>
                  </div>

                  <div className="classical-list">
                    {visibleItems.length === 0 ? (
                      <div className="classical-empty">
                        条件に合う項目がありません。
                      </div>
                    ) : (
                      visibleItems.map((item) => {
                        const opened = openItemId === item.id;
                        const favorite = favorites.includes(item.id);
                        const isLearned = learned.includes(item.id);

                        return (
                          <article key={item.id} className="classical-item">
                            <button
                              type="button"
                              className="classical-item-main"
                              onClick={() =>
                                setOpenItemId(opened ? null : item.id)
                              }
                            >
                              <div className="classical-item-top">
                                <div>
                                  <h3 className="classical-item-title">
                                    {item.title}
                                  </h3>

                                  <div className="classical-badges">
                                    <span className="classical-badge">
                                      {item.group}
                                    </span>

                                    {item.custom && (
                                      <span className="classical-badge">
                                        自分で追加
                                      </span>
                                    )}

                                    {isLearned && (
                                      <span className="classical-badge learned">
                                        ✓ 覚えた
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span
                                  style={{
                                    color: "#9a353c",
                                    fontSize: 20,
                                    fontWeight: 900,
                                  }}
                                >
                                  {opened ? "−" : "＋"}
                                </span>
                              </div>

                              <p className="classical-meaning">
                                {item.meaning}
                              </p>
                            </button>

                            {opened && (
                              <div className="classical-detail">
                                <div className="classical-info-grid">
                                  {item.connection && (
                                    <div className="classical-info">
                                      <strong>接続・形：</strong>
                                      {item.connection}
                                    </div>
                                  )}

                                  {item.usage && (
                                    <div className="classical-info">
                                      <strong>使い方・識別：</strong>
                                      {item.usage}
                                    </div>
                                  )}

                                  {item.example && (
                                    <div className="classical-info">
                                      <strong>例：</strong>
                                      {item.example}
                                    </div>
                                  )}

                                  {item.memory && (
                                    <div className="classical-info">
                                      <strong>覚え方：</strong>
                                      {item.memory}
                                    </div>
                                  )}
                                </div>

                                <h4 className="classical-note-title">
                                  📝 自分のメモ
                                </h4>

                                <textarea
                                  className="classical-textarea"
                                  value={itemNotes[item.id] ?? ""}
                                  onChange={(event) =>
                                    setItemNotes((notes) => ({
                                      ...notes,
                                      [item.id]: event.target.value,
                                    }))
                                  }
                                  placeholder="先生の説明、間違えた問題、自分の覚え方など…"
                                />

                                <div className="classical-actions">
                                  <button
                                    type="button"
                                    className="classical-mini"
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
                                    className="classical-mini"
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
                                        className="classical-mini"
                                        onClick={() => openEditModal(item)}
                                      >
                                        編集
                                      </button>

                                      <button
                                        type="button"
                                        className="classical-mini danger"
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
                <div className="classical-card">
                  <div className="classical-card-head">
                    <div>
                      <h2 className="classical-card-title">
                        📒 古文ノート
                      </h2>
                      <p className="classical-card-subtitle">
                        入力内容はこの端末に自動保存されます。
                      </p>
                    </div>

                    <button
                      type="button"
                      className="classical-btn"
                      onClick={addNotebookBlock}
                    >
                      ＋ ノート追加
                    </button>
                  </div>

                  <div className="classical-note-list">
                    {notebook.length === 0 ? (
                      <div className="classical-empty">
                        まだノートがありません。「ノート追加」から作れます。
                      </div>
                    ) : (
                      notebook.map((block) => (
                        <article
                          key={block.id}
                          className="classical-note-card"
                        >
                          <input
                            className="classical-input"
                            style={{ marginBottom: 10, fontWeight: 900 }}
                            value={block.title}
                            onChange={(event) =>
                              setNotebook((blocks) =>
                                blocks.map((item) =>
                                  item.id === block.id
                                    ? {
                                        ...item,
                                        title: event.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                          />

                          <textarea
                            className="classical-textarea"
                            style={{ minHeight: 180 }}
                            value={block.body}
                            onChange={(event) =>
                              setNotebook((blocks) =>
                                blocks.map((item) =>
                                  item.id === block.id
                                    ? {
                                        ...item,
                                        body: event.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                            placeholder="古文単語、助動詞、授業内容、模試の反省など…"
                          />

                          <div className="classical-actions">
                            <button
                              type="button"
                              className="classical-mini danger"
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
            className="classical-modal-backdrop"
            onMouseDown={() => setModalOpen(false)}
          >
            <form
              className="classical-modal"
              onSubmit={saveItem}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 16px", color: "#6e242b" }}>
                {editingItem
                  ? "項目を編集"
                  : `${activeData.title}を追加`}
              </h2>

              <div className="classical-form">
                <label className="classical-label">
                  名前 *
                  <input
                    className="classical-input"
                    value={form.title}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        title: event.target.value,
                      }))
                    }
                    placeholder="例：ありがたし"
                  />
                </label>

                <label className="classical-label">
                  分類
                  <input
                    className="classical-input"
                    value={form.group}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        group: event.target.value,
                      }))
                    }
                    placeholder="例：形容詞"
                  />
                </label>

                <label className="classical-label">
                  意味 *
                  <textarea
                    className="classical-textarea"
                    value={form.meaning}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        meaning: event.target.value,
                      }))
                    }
                    placeholder="意味・現代語訳"
                  />
                </label>

                <label className="classical-label">
                  接続・形
                  <textarea
                    className="classical-textarea"
                    value={form.connection}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        connection: event.target.value,
                      }))
                    }
                    placeholder="助動詞の接続、活用上の注意など"
                  />
                </label>

                <label className="classical-label">
                  使い方・識別
                  <textarea
                    className="classical-textarea"
                    value={form.usage}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        usage: event.target.value,
                      }))
                    }
                    placeholder="文脈での判断方法や注意点"
                  />
                </label>

                <label className="classical-label">
                  例文
                  <textarea
                    className="classical-textarea"
                    value={form.example}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        example: event.target.value,
                      }))
                    }
                    placeholder="例文や現代語訳"
                  />
                </label>

                <label className="classical-label">
                  覚え方
                  <textarea
                    className="classical-textarea"
                    value={form.memory}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        memory: event.target.value,
                      }))
                    }
                    placeholder="語呂合わせ・注意点など"
                  />
                </label>
              </div>

              <div className="classical-modal-actions">
                <button
                  type="button"
                  className="classical-btn-soft"
                  onClick={() => setModalOpen(false)}
                >
                  キャンセル
                </button>

                <button type="submit" className="classical-btn">
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