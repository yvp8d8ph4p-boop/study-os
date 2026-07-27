"use client";

import Link from "next/link";
import {
  CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";

type GrammarTopic = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type GrammarDetailItem = {
  name: string;
  explanation: string;
  examples: string[];
  point: string;
};

type GrammarDetail = {
  title: string;
  introduction: string;
  items: GrammarDetailItem[];
};

type ConjugationRow = {
  form: string;
  continuation: string;
  value: string;
  example: string;
};

type ConjugationTable = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  background: string;
  rows: ConjugationRow[];
  note: string;
};

type QuizQuestion = {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
};

type SavedData = {
  learnedTopics: string[];
  memo: string;
  topicNotes: Record<string, string>;
};

const grammarTopics: GrammarTopic[] = [
  {
    id: "sentence",
    title: "文・文節・単語",
    description:
      "文を文節や単語に区切る方法を学ぶ",
    icon: "✂️",
  },
  {
    id: "components",
    title: "文の成分",
    description:
      "主語・述語・修飾語・接続語・独立語",
    icon: "🧩",
  },
  {
    id: "parts",
    title: "品詞",
    description:
      "名詞・動詞・形容詞などの見分け方",
    icon: "🏷️",
  },
  {
    id: "verb",
    title: "動詞",
    description:
      "活用形と活用の種類を整理する",
    icon: "🏃",
  },
  {
    id: "adjective",
    title: "形容詞・形容動詞",
    description:
      "二つの品詞の活用と見分け方",
    icon: "🎨",
  },
  {
    id: "particle",
    title: "助詞",
    description:
      "格助詞・接続助詞・副助詞・終助詞",
    icon: "🔗",
  },
  {
    id: "auxiliary",
    title: "助動詞",
    description:
      "意味・接続・活用を整理する",
    icon: "➕",
  },
  {
    id: "honorific",
    title: "敬語",
    description:
      "尊敬語・謙譲語・丁寧語の見分け方",
    icon: "🙇",
  },
];


const grammarDetails: Record<string, GrammarDetail> = {
  sentence: {
    title: "文・文節・単語",
    introduction:
      "文を、意味と働きに注目しながら文節・単語へ分けて考えます。",
    items: [
      {
        name: "文",
        explanation:
          "一つのまとまった内容を表し、句点（。）などで終わる言葉のまとまりです。",
        examples: ["私は本を読む。", "今日はとても暑い。"],
        point: "文末の句点までを一つの文として考えます。",
      },
      {
        name: "文節",
        explanation:
          "文を、意味や発音の上で不自然にならない程度に区切ったまとまりです。",
        examples: [
          "私は／学校へ／行きます。",
          "「ね」を入れる：私はね／学校へね／行きますね",
        ],
        point: "「ね」や「さ」を入れて自然に区切れる場所を探します。",
      },
      {
        name: "単語",
        explanation:
          "意味や働きを持つ、最も小さい言葉の単位です。",
        examples: ["私／は／学校／へ／行き／ます"],
        point: "助詞や助動詞も、それぞれ一つの単語として数えます。",
      },
    ],
  },
  components: {
    title: "文の成分",
    introduction:
      "文節が文の中でどのような働きをしているかを整理します。",
    items: [
      {
        name: "主語",
        explanation: "「何が・誰が」に当たる文節です。",
        examples: ["鳥が飛ぶ。→ 鳥が"],
        point: "まず述語を探し、「何が・誰が」と問いかけます。",
      },
      {
        name: "述語",
        explanation:
          "主語の動作・状態・性質などを表す文節です。",
        examples: ["鳥が飛ぶ。→ 飛ぶ", "空が青い。→ 青い"],
        point: "文の最後に置かれることが多いです。",
      },
      {
        name: "修飾語",
        explanation:
          "ほかの文節の意味を詳しく説明する文節です。",
        examples: ["とても速く走る。→ とても、速く"],
        point: "「どんな・どのように・いつ・どこで」などを表します。",
      },
      {
        name: "接続語",
        explanation:
          "前後の文や文節を結び、関係を示す文節です。",
        examples: ["雨だった。しかし、試合は行われた。"],
        point: "順接・逆接・並列・説明などの関係を確認します。",
      },
      {
        name: "独立語",
        explanation:
          "ほかの文節と直接関係せず、独立している文節です。",
        examples: ["はい、分かりました。", "太郎、こちらへ来なさい。"],
        point: "呼びかけ・応答・感動などを表すことが多いです。",
      },
    ],
  },
  parts: {
    title: "品詞辞典",
    introduction:
      "単語を、意味・働き・活用の有無によって十種類の品詞に分類します。副詞などもここで確認できます。",
    items: [
      {
        name: "名詞",
        explanation:
          "人・物・場所・事柄などの名前を表す自立語です。活用しません。",
        examples: ["学校", "太郎", "机", "考え"],
        point: "「が・は」を付けて主語になれる語が多いです。",
      },
      {
        name: "動詞",
        explanation:
          "動作・作用・存在を表す自立語です。活用します。",
        examples: ["走る", "読む", "ある", "いる"],
        point: "言い切りの形は基本的にウ段の音で終わります。",
      },
      {
        name: "形容詞",
        explanation:
          "性質や状態を表す自立語です。活用し、言い切りが「い」で終わります。",
        examples: ["高い", "美しい", "楽しい"],
        point: "「きれい」は「きれいだ」と言えるので形容動詞です。",
      },
      {
        name: "形容動詞",
        explanation:
          "性質や状態を表す自立語です。活用し、言い切りが「だ」になります。",
        examples: ["静かだ", "元気だ", "きれいだ"],
        point: "名詞を修飾するときは「静かな町」のように「な」になります。",
      },
      {
        name: "副詞",
        explanation:
          "主に動詞・形容詞・形容動詞を修飾する自立語です。活用しません。",
        examples: ["ゆっくり歩く", "とても美しい", "決して行かない"],
        point:
          "状態・程度・呼応の副詞があります。「決して」は「ない」と呼応します。",
      },
      {
        name: "連体詞",
        explanation:
          "名詞だけを修飾する自立語です。活用しません。",
        examples: ["この本", "大きな家", "ある日", "あらゆる方法"],
        point: "「大きな」は連体詞、「大きい」は形容詞です。",
      },
      {
        name: "接続詞",
        explanation:
          "文と文、語句と語句をつなぐ自立語です。活用しません。",
        examples: ["しかし", "だから", "また", "つまり"],
        point: "前後が順接・逆接・並列・説明のどれかを考えます。",
      },
      {
        name: "感動詞",
        explanation:
          "感動・呼びかけ・応答・あいさつなどを表す自立語です。",
        examples: ["まあ", "はい", "こんにちは", "おい"],
        point: "ほかの語を修飾せず、独立語になることが多いです。",
      },
      {
        name: "助詞",
        explanation:
          "語に付き、語と語の関係や意味を示す付属語です。活用しません。",
        examples: ["私は学校へ行く。", "本だけ読む。", "きれいだね。"],
        point: "格助詞・接続助詞・副助詞・終助詞などがあります。",
      },
      {
        name: "助動詞",
        explanation:
          "動詞などに付き、否定・過去・推量などの意味を加える付属語です。活用します。",
        examples: ["読まない", "読んだ", "読みます"],
        point: "助詞には活用がなく、助動詞には活用があります。",
      },
    ],
  },
  verb: {
    title: "動詞",
    introduction:
      "動詞の意味、活用形、活用の種類を整理します。下の活用表と合わせて学習できます。",
    items: [
      {
        name: "動詞とは",
        explanation:
          "動作・作用・存在を表し、主に述語になる自立語です。",
        examples: ["走る", "考える", "ある", "いる"],
        point: "言い切りの形がウ段で終わり、活用します。",
      },
      {
        name: "活用形",
        explanation:
          "未然形・連用形・終止形・連体形・仮定形・命令形があります。",
        examples: ["書かない", "書きます", "書く。", "書く人", "書けば", "書け"],
        point: "後ろに続く言葉から活用形を判断します。",
      },
      {
        name: "活用の種類",
        explanation:
          "五段・上一段・下一段・カ行変格・サ行変格に分かれます。",
        examples: ["書く", "起きる", "食べる", "来る", "する"],
        point: "「ない」を付けた形を使うと見分けやすいです。",
      },
    ],
  },
  adjective: {
    title: "形容詞・形容動詞",
    introduction:
      "どちらも性質や状態を表しますが、言い切り方と活用が異なります。",
    items: [
      {
        name: "形容詞",
        explanation:
          "言い切りが「い」で終わり、未然・連用・終止・連体・仮定に活用します。",
        examples: ["高い", "高くない", "高ければ"],
        point: "命令形はありません。",
      },
      {
        name: "形容動詞",
        explanation:
          "言い切りが「だ」で終わり、「な」で名詞を修飾します。",
        examples: ["静かだ", "静かな町", "静かならば"],
        point: "こちらも命令形はありません。",
      },
    ],
  },
  particle: {
    title: "助詞",
    introduction:
      "助詞は付属語で、活用しません。語と語の関係や話し手の気持ちを表します。",
    items: [
      {
        name: "格助詞",
        explanation: "名詞などに付き、ほかの語との関係を示します。",
        examples: ["が・の・を・に・へ・と・より・で・から"],
        point: "主語・目的語・場所・方向などを表します。",
      },
      {
        name: "接続助詞",
        explanation:
          "活用する語に付き、前後の文節や文をつなぎます。",
        examples: ["ので", "から", "けれど", "ても", "ば"],
        point: "原因・理由・逆接・条件などを表します。",
      },
      {
        name: "副助詞",
        explanation:
          "語に特別な意味を添え、副詞のような働きをさせます。",
        examples: ["だけ", "まで", "しか", "さえ", "ほど"],
        point: "限定・程度・強調などを表します。",
      },
      {
        name: "終助詞",
        explanation:
          "文末に付き、話し手の気持ちや判断を表します。",
        examples: ["ね", "よ", "な", "か", "ぞ"],
        point: "疑問・念押し・禁止・感動などを表します。",
      },
    ],
  },
  auxiliary: {
    title: "助動詞",
    introduction:
      "助動詞は付属語で活用し、前の語にさまざまな意味を加えます。",
    items: [
      {
        name: "ない",
        explanation: "打ち消しを表します。",
        examples: ["行かない", "美しくない"],
        point: "動詞には未然形から付きます。",
      },
      {
        name: "た",
        explanation: "過去・完了・存続・確認を表します。",
        examples: ["昨日読んだ。", "窓が開いていた。"],
        point: "動詞などの連用形に付きます。",
      },
      {
        name: "れる・られる",
        explanation: "受け身・可能・自発・尊敬を表します。",
        examples: ["先生に褒められる。", "この本は読める。"],
        point: "文脈から意味を判断します。",
      },
      {
        name: "せる・させる",
        explanation: "使役を表します。",
        examples: ["弟に掃除をさせる。"],
        point: "誰が誰に動作をさせるのかを確認します。",
      },
      {
        name: "そうだ・ようだ・らしい",
        explanation:
          "様態・伝聞・比況・推定などを表します。",
        examples: ["雨が降りそうだ。", "雨が降るそうだ。", "春らしい天気だ。"],
        point: "接続と文の意味から区別します。",
      },
    ],
  },
  honorific: {
    title: "敬語",
    introduction:
      "誰の動作を高めるか、誰の動作を低めるかに注目して見分けます。",
    items: [
      {
        name: "尊敬語",
        explanation:
          "相手や話題の人物の動作を高めて敬意を表します。",
        examples: ["先生がおっしゃる。", "校長先生がいらっしゃる。"],
        point: "動作をする人が敬う相手です。",
      },
      {
        name: "謙譲語",
        explanation:
          "自分側の動作を低め、動作の向かう相手を高めます。",
        examples: ["先生に申し上げる。", "資料を拝見する。"],
        point: "自分側が行う動作に使います。",
      },
      {
        name: "丁寧語",
        explanation:
          "話し方を丁寧にします。",
        examples: ["です", "ます", "ございます"],
        point: "聞き手に対して丁寧な表現になります。",
      },
    ],
  },
};

const conjugationTables: ConjugationTable[] = [
  {
    id: "godan",
    title: "五段活用",
    subtitle: "書く",
    color: "#1D4ED8",
    background: "#DBEAFE",
    rows: [
      {
        form: "未然形",
        continuation: "ない・う・れる・せる",
        value: "書か・書こ",
        example: "書かない／書こう",
      },
      {
        form: "連用形",
        continuation: "ます・た・て",
        value: "書き・書い",
        example: "書きます／書いた",
      },
      {
        form: "終止形",
        continuation: "言い切る",
        value: "書く",
        example: "手紙を書く。",
      },
      {
        form: "連体形",
        continuation: "とき・こと・人",
        value: "書く",
        example: "手紙を書く人",
      },
      {
        form: "仮定形",
        continuation: "ば",
        value: "書け",
        example: "書けば",
      },
      {
        form: "命令形",
        continuation: "命令",
        value: "書け",
        example: "早く書け。",
      },
    ],
    note:
      "「ない」を付けたとき、直前の音がア段になる動詞は五段活用です。例：書かない、読まない、話さない。",
  },
  {
    id: "kamiichidan",
    title: "上一段活用",
    subtitle: "起きる",
    color: "#15803D",
    background: "#DCFCE7",
    rows: [
      {
        form: "未然形",
        continuation: "ない・よう・られる・させる",
        value: "起き",
        example: "起きない／起きよう",
      },
      {
        form: "連用形",
        continuation: "ます・た・て",
        value: "起き",
        example: "起きます／起きた",
      },
      {
        form: "終止形",
        continuation: "言い切る",
        value: "起きる",
        example: "毎朝起きる。",
      },
      {
        form: "連体形",
        continuation: "とき・こと・人",
        value: "起きる",
        example: "早く起きる人",
      },
      {
        form: "仮定形",
        continuation: "ば",
        value: "起きれ",
        example: "起きれば",
      },
      {
        form: "命令形",
        continuation: "命令",
        value: "起きろ・起きよ",
        example: "早く起きろ。",
      },
    ],
    note:
      "「ない」を付けたとき、直前がイ段になり、語尾の「る」を取って活用する動詞です。例：起きる、見る、落ちる。",
  },
  {
    id: "shimoichidan",
    title: "下一段活用",
    subtitle: "食べる",
    color: "#7C3AED",
    background: "#EDE9FE",
    rows: [
      {
        form: "未然形",
        continuation: "ない・よう・られる・させる",
        value: "食べ",
        example: "食べない／食べよう",
      },
      {
        form: "連用形",
        continuation: "ます・た・て",
        value: "食べ",
        example: "食べます／食べた",
      },
      {
        form: "終止形",
        continuation: "言い切る",
        value: "食べる",
        example: "朝食を食べる。",
      },
      {
        form: "連体形",
        continuation: "とき・こと・人",
        value: "食べる",
        example: "朝食を食べる人",
      },
      {
        form: "仮定形",
        continuation: "ば",
        value: "食べれ",
        example: "食べれば",
      },
      {
        form: "命令形",
        continuation: "命令",
        value: "食べろ・食べよ",
        example: "野菜を食べろ。",
      },
    ],
    note:
      "「ない」を付けたとき、直前がエ段になり、語尾の「る」を取って活用する動詞です。例：食べる、受ける、考える。",
  },
  {
    id: "kahen",
    title: "カ行変格活用",
    subtitle: "来る",
    color: "#B45309",
    background: "#FEF3C7",
    rows: [
      {
        form: "未然形",
        continuation: "ない・よう・られる・させる",
        value: "来（こ）",
        example: "来ない／来よう",
      },
      {
        form: "連用形",
        continuation: "ます・た・て",
        value: "来（き）",
        example: "来ます／来た",
      },
      {
        form: "終止形",
        continuation: "言い切る",
        value: "来る（くる）",
        example: "友達が来る。",
      },
      {
        form: "連体形",
        continuation: "とき・こと・人",
        value: "来る（くる）",
        example: "学校へ来る人",
      },
      {
        form: "仮定形",
        continuation: "ば",
        value: "来（く）れ",
        example: "来れば",
      },
      {
        form: "命令形",
        continuation: "命令",
        value: "来（こ）い",
        example: "こちらへ来い。",
      },
    ],
    note:
      "カ行変格活用の動詞は、現代語では「来る」一語だけです。読み方の変化にも注意します。",
  },
  {
    id: "sahen",
    title: "サ行変格活用",
    subtitle: "する",
    color: "#BE123C",
    background: "#FFE4E6",
    rows: [
      {
        form: "未然形",
        continuation: "ない・よう・れる・せる",
        value: "し・せ・さ",
        example: "しない／しよう／される",
      },
      {
        form: "連用形",
        continuation: "ます・た・て",
        value: "し",
        example: "します／した",
      },
      {
        form: "終止形",
        continuation: "言い切る",
        value: "する",
        example: "勉強する。",
      },
      {
        form: "連体形",
        continuation: "とき・こと・人",
        value: "する",
        example: "勉強する人",
      },
      {
        form: "仮定形",
        continuation: "ば",
        value: "すれ",
        example: "勉強すれば",
      },
      {
        form: "命令形",
        continuation: "命令",
        value: "しろ・せよ",
        example: "早く勉強しろ。",
      },
    ],
    note:
      "「する」と、「勉強する」「運動する」のように「する」が付いた動詞はサ行変格活用です。",
  },
  {
    id: "adjective",
    title: "形容詞",
    subtitle: "高い",
    color: "#0369A1",
    background: "#E0F2FE",
    rows: [
      {
        form: "未然形",
        continuation: "う",
        value: "高かろ",
        example: "高かろう",
      },
      {
        form: "連用形",
        continuation: "ない・なる・た",
        value: "高く・高かっ",
        example: "高くない／高かった",
      },
      {
        form: "終止形",
        continuation: "言い切る",
        value: "高い",
        example: "この山は高い。",
      },
      {
        form: "連体形",
        continuation: "とき・山・物",
        value: "高い",
        example: "高い山",
      },
      {
        form: "仮定形",
        continuation: "ば",
        value: "高けれ",
        example: "高ければ",
      },
      {
        form: "命令形",
        continuation: "なし",
        value: "—",
        example: "命令形はない",
      },
    ],
    note:
      "形容詞は言い切りの形が「い」で終わります。ただし「きれいだ」は形容動詞です。",
  },
  {
    id: "adjectival-verb",
    title: "形容動詞",
    subtitle: "静かだ",
    color: "#A21CAF",
    background: "#FAE8FF",
    rows: [
      {
        form: "未然形",
        continuation: "う",
        value: "静かだろ",
        example: "静かだろう",
      },
      {
        form: "連用形",
        continuation: "ない・なる・ある・た",
        value: "静かだっ・静かで・静かに",
        example: "静かだった／静かになる",
      },
      {
        form: "終止形",
        continuation: "言い切る",
        value: "静かだ",
        example: "教室は静かだ。",
      },
      {
        form: "連体形",
        continuation: "とき・町・人",
        value: "静かな",
        example: "静かな町",
      },
      {
        form: "仮定形",
        continuation: "ば",
        value: "静かなら",
        example: "静かならば",
      },
      {
        form: "命令形",
        continuation: "なし",
        value: "—",
        example: "命令形はない",
      },
    ],
    note:
      "形容動詞は言い切りの形が「だ」です。名詞を修飾するときは「静かな町」のように「な」になります。",
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    question:
      "「書かない」の「書か」は何形ですか。",
    choices: ["未然形", "連用形", "終止形", "仮定形"],
    answer: "未然形",
    explanation:
      "後ろに「ない」が続いているので未然形です。",
  },
  {
    question:
      "「読みます」の「読み」は何形ですか。",
    choices: ["未然形", "連用形", "連体形", "命令形"],
    answer: "連用形",
    explanation:
      "「ます」は動詞の連用形に付きます。",
  },
  {
    question:
      "「走る人」の「走る」は何形ですか。",
    choices: ["終止形", "連体形", "仮定形", "命令形"],
    answer: "連体形",
    explanation:
      "後ろの名詞「人」を修飾しているので連体形です。",
  },
  {
    question:
      "「話せば」の「話せ」は何形ですか。",
    choices: ["未然形", "連用形", "仮定形", "命令形"],
    answer: "仮定形",
    explanation:
      "後ろに「ば」が続いているので仮定形です。",
  },
  {
    question:
      "「食べる」の活用の種類はどれですか。",
    choices: [
      "五段活用",
      "上一段活用",
      "下一段活用",
      "サ行変格活用",
    ],
    answer: "下一段活用",
    explanation:
      "「食べない」としたとき、「る」の直前がエ段になるため下一段活用です。",
  },
  {
    question:
      "カ行変格活用の動詞はどれですか。",
    choices: ["書く", "見る", "来る", "する"],
    answer: "来る",
    explanation:
      "現代語のカ行変格活用は「来る」一語です。",
  },
];

const continuationButtons = [
  "ない",
  "ます",
  "た",
  "。",
  "人・とき",
  "ば",
  "命令",
];

const continuationToForm: Record<string, string> = {
  ない: "未然形",
  ます: "連用形",
  た: "連用形",
  "。": "終止形",
  "人・とき": "連体形",
  ば: "仮定形",
  命令: "命令形",
};

const storageKey = "study-os-japanese-grammar-v2";

const defaultSavedData: SavedData = {
  learnedTopics: [],
  memo: "",
  topicNotes: {},
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "38px 18px 64px",
    background:
      "linear-gradient(180deg, #F0FDF4 0%, #F8FAFC 48%, #FFFFFF 100%)",
    color: "#0F172A",
  },
  container: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
  },
  whiteCard: {
    border: "1px solid #E2E8F0",
    borderRadius: "22px",
    background: "#FFFFFF",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.07)",
  },
  sectionTitle: {
    margin: 0,
    color: "#0F172A",
    fontSize: "clamp(25px, 5vw, 34px)",
  },
  sectionText: {
    margin: "8px 0 0",
    color: "#64748B",
    fontSize: "16px",
    lineHeight: 1.7,
  },
  button: {
    border: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
};

export default function JapaneseGrammarPage() {
  const [selectedTopicId, setSelectedTopicId] =
    useState("parts");
  const [selectedTableId, setSelectedTableId] =
    useState("godan");
  const [highlightedForm, setHighlightedForm] =
    useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [savedData, setSavedData] =
    useState<SavedData>(defaultSavedData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SavedData>;

        setSavedData({
          learnedTopics: parsed.learnedTopics ?? [],
          memo: parsed.memo ?? "",
          topicNotes: parsed.topicNotes ?? {},
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

    localStorage.setItem(
      storageKey,
      JSON.stringify(savedData),
    );
  }, [savedData, loaded]);

  const selectedTable = useMemo(
    () =>
      conjugationTables.find(
        (table) => table.id === selectedTableId,
      ) ?? conjugationTables[0],
    [selectedTableId],
  );

  const selectedDetail =
    grammarDetails[selectedTopicId] ?? grammarDetails.parts;

  const selectedTopic =
    grammarTopics.find((topic) => topic.id === selectedTopicId) ??
    grammarTopics[0];

  const currentQuestion = quizQuestions[quizIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect =
    selectedAnswer === currentQuestion.answer;

  const toggleLearnedTopic = (topicId: string) => {
    setSavedData((current) => ({
      ...current,
      learnedTopics: current.learnedTopics.includes(topicId)
        ? current.learnedTopics.filter(
            (id) => id !== topicId,
          )
        : [...current.learnedTopics, topicId],
    }));
  };

  const selectAnswer = (choice: string) => {
    if (isAnswered) {
      return;
    }

    setSelectedAnswer(choice);
    setAnsweredCount((current) => current + 1);

    if (choice === currentQuestion.answer) {
      setScore((current) => current + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setQuizIndex(
      (current) => (current + 1) % quizQuestions.length,
    );
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnsweredCount(0);
  };

  const progress = Math.round(
    (savedData.learnedTopics.length /
      grammarTopics.length) *
      100,
  );

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
                "0 12px 30px rgba(21, 128, 61, 0.14)",
              fontSize: "48px",
            }}
          >
            📝
          </div>

          <h1
            style={{
              margin: 0,
              color: "#15803D",
              fontSize: "clamp(42px, 8vw, 64px)",
            }}
          >
            国文法
          </h1>

          <p
            style={{
              maxWidth: "680px",
              margin: "12px auto 0",
              color: "#64748B",
              fontSize: "18px",
              lineHeight: 1.8,
            }}
          >
            品詞・活用・助詞・助動詞を、活用表と問題で整理するページ
          </p>
        </header>

        <section
          style={{
            ...styles.whiteCard,
            marginBottom: "26px",
            padding: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#64748B",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                学習進捗
              </p>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "25px",
                }}
              >
                {savedData.learnedTopics.length} /{" "}
                {grammarTopics.length} 単元
              </strong>
            </div>

            <strong
              style={{
                color: "#15803D",
                fontSize: "27px",
              }}
            >
              {progress}%
            </strong>
          </div>

          <div
            style={{
              height: "12px",
              marginTop: "16px",
              overflow: "hidden",
              borderRadius: "999px",
              background: "#E2E8F0",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg, #22C55E, #15803D)",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </section>

        <section style={{ marginBottom: "34px" }}>
          <h2 style={styles.sectionTitle}>文法単元</h2>

          <p style={styles.sectionText}>
            勉強した単元は、カードのボタンから学習済みにできます。
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "15px",
              marginTop: "18px",
            }}
          >
            {grammarTopics.map((topic) => {
              const learned =
                savedData.learnedTopics.includes(topic.id);

              return (
                <article
                  key={topic.id}
                  style={{
                    ...styles.whiteCard,
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: "54px",
                      height: "54px",
                      borderRadius: "16px",
                      background: "#DCFCE7",
                      fontSize: "28px",
                    }}
                  >
                    {topic.icon}
                  </div>

                  <h3
                    style={{
                      margin: "15px 0 0",
                      color: "#15803D",
                      fontSize: "21px",
                    }}
                  >
                    {topic.title}
                  </h3>

                  <p
                    style={{
                      minHeight: "50px",
                      margin: "8px 0 0",
                      color: "#64748B",
                      lineHeight: 1.65,
                    }}
                  >
                    {topic.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "9px",
                      marginTop: "15px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTopicId(topic.id)}
                      style={{
                        ...styles.button,
                        width: "100%",
                        padding: "11px 13px",
                        border:
                          selectedTopicId === topic.id
                            ? "1px solid #15803D"
                            : "1px solid #86EFAC",
                        borderRadius: "12px",
                        background:
                          selectedTopicId === topic.id
                            ? "#15803D"
                            : "#F0FDF4",
                        color:
                          selectedTopicId === topic.id
                            ? "#FFFFFF"
                            : "#166534",
                        fontWeight: 800,
                      }}
                    >
                      {selectedTopicId === topic.id
                        ? "表示中"
                        : "内容を見る →"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleLearnedTopic(topic.id)
                      }
                      style={{
                        ...styles.button,
                        width: "100%",
                        padding: "11px 13px",
                        border: learned
                          ? "1px solid #22C55E"
                          : "1px solid #CBD5E1",
                        borderRadius: "12px",
                        background: learned
                          ? "#DCFCE7"
                          : "#F8FAFC",
                        color: learned
                          ? "#166534"
                          : "#475569",
                        fontWeight: 800,
                      }}
                    >
                      {learned
                        ? "✓ 学習済み"
                        : "学習済みにする"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          style={{
            ...styles.whiteCard,
            marginBottom: "34px",
            padding: "24px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "7px 11px",
              borderRadius: "999px",
              background: "#DCFCE7",
              color: "#15803D",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            文法辞典
          </span>

          <h2
            style={{
              margin: "12px 0 0",
              color: "#15803D",
              fontSize: "clamp(27px, 5vw, 38px)",
            }}
          >
            {selectedDetail.title}
          </h2>

          <p
            style={{
              margin: "10px 0 0",
              color: "#64748B",
              fontSize: "16px",
              lineHeight: 1.8,
            }}
          >
            {selectedDetail.introduction}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            {selectedDetail.items.map((item) => (
              <article
                key={item.name}
                style={{
                  padding: "19px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "17px",
                  background: "#F8FAFC",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#166534",
                    fontSize: "21px",
                  }}
                >
                  {item.name}
                </h3>

                <p
                  style={{
                    margin: "9px 0 0",
                    color: "#334155",
                    lineHeight: 1.75,
                  }}
                >
                  {item.explanation}
                </p>

                <div
                  style={{
                    marginTop: "13px",
                    padding: "13px",
                    borderRadius: "13px",
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <strong
                    style={{
                      color: "#0F172A",
                      fontSize: "14px",
                    }}
                  >
                    例
                  </strong>

                  {item.examples.map((example) => (
                    <p
                      key={example}
                      style={{
                        margin: "7px 0 0",
                        color: "#475569",
                        lineHeight: 1.6,
                      }}
                    >
                      ・{example}
                    </p>
                  ))}
                </div>

                <p
                  style={{
                    margin: "13px 0 0",
                    color: "#166534",
                    lineHeight: 1.7,
                    fontWeight: 700,
                  }}
                >
                  💡 {item.point}
                </p>
              </article>
            ))}
          </div>

          <div
            style={{
              marginTop: "22px",
              padding: "20px",
              border: "1px solid #BBF7D0",
              borderRadius: "18px",
              background: "#F0FDF4",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#166534",
                    fontSize: "22px",
                  }}
                >
                  📝 {selectedTopic.title}ノート
                </h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#4B5563",
                    lineHeight: 1.7,
                  }}
                >
                  覚え方・授業のポイント・間違えた問題を自由に記録できます。
                </p>
              </div>

              <span
                style={{
                  padding: "7px 11px",
                  borderRadius: "999px",
                  background: "#DCFCE7",
                  color: "#166534",
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                自動保存
              </span>
            </div>

            <textarea
              value={savedData.topicNotes[selectedTopicId] ?? ""}
              onChange={(event) =>
                setSavedData((current) => ({
                  ...current,
                  topicNotes: {
                    ...current.topicNotes,
                    [selectedTopicId]: event.target.value,
                  },
                }))
              }
              placeholder={`${selectedTopic.title}について、自分の言葉でまとめよう`}
              rows={8}
              style={{
                width: "100%",
                marginTop: "15px",
                padding: "15px",
                boxSizing: "border-box",
                resize: "vertical",
                border: "1px solid #86EFAC",
                borderRadius: "15px",
                outline: "none",
                background: "#FFFFFF",
                color: "#0F172A",
                fontFamily: "inherit",
                fontSize: "16px",
                lineHeight: 1.8,
              }}
            />
          </div>
        </section>

        <section style={{ marginBottom: "34px" }}>
          <h2 style={styles.sectionTitle}>活用表</h2>

          <p style={styles.sectionText}>
            活用の種類を選び、後ろに続く言葉から活用形を確認できます。
          </p>

          <div
            style={{
              display: "flex",
              gap: "9px",
              marginTop: "18px",
              paddingBottom: "5px",
              overflowX: "auto",
            }}
          >
            {conjugationTables.map((table) => {
              const selected =
                table.id === selectedTable.id;

              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => {
                    setSelectedTableId(table.id);
                    setHighlightedForm(null);
                  }}
                  style={{
                    ...styles.button,
                    flexShrink: 0,
                    padding: "10px 15px",
                    border: selected
                      ? `2px solid ${table.color}`
                      : "1px solid #CBD5E1",
                    borderRadius: "999px",
                    background: selected
                      ? table.background
                      : "#FFFFFF",
                    color: selected
                      ? table.color
                      : "#475569",
                    fontWeight: 800,
                  }}
                >
                  {table.title}
                </button>
              );
            })}
          </div>

          <div
            style={{
              ...styles.whiteCard,
              marginTop: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "22px",
                background: selectedTable.background,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: selectedTable.color,
                  fontSize: "14px",
                  fontWeight: 800,
                }}
              >
                活用の種類
              </p>

              <h3
                style={{
                  margin: "5px 0 0",
                  color: selectedTable.color,
                  fontSize: "30px",
                }}
              >
                {selectedTable.title}
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: selectedTable.color,
                  fontSize: "19px",
                  fontWeight: 700,
                }}
              >
                例：{selectedTable.subtitle}
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#475569",
                  fontWeight: 800,
                }}
              >
                後ろに続く言葉を選ぶ
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {continuationButtons.map((button) => {
                  const form =
                    continuationToForm[button];
                  const active =
                    highlightedForm === form;

                  return (
                    <button
                      key={button}
                      type="button"
                      onClick={() =>
                        setHighlightedForm(
                          active ? null : form,
                        )
                      }
                      style={{
                        ...styles.button,
                        flexShrink: 0,
                        padding: "9px 14px",
                        border: active
                          ? `2px solid ${selectedTable.color}`
                          : "1px solid #CBD5E1",
                        borderRadius: "11px",
                        background: active
                          ? selectedTable.background
                          : "#F8FAFC",
                        color: active
                          ? selectedTable.color
                          : "#475569",
                        fontWeight: 800,
                      }}
                    >
                      {button}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: "720px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#F8FAFC",
                    }}
                  >
                    {[
                      "活用形",
                      "後ろに続く言葉",
                      "活用した形",
                      "例",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "15px",
                          borderBottom:
                            "1px solid #E2E8F0",
                          color: "#334155",
                          textAlign: "left",
                          fontSize: "14px",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {selectedTable.rows.map((row) => {
                    const highlighted =
                      highlightedForm === row.form;

                    return (
                      <tr
                        key={row.form}
                        style={{
                          background: highlighted
                            ? selectedTable.background
                            : "#FFFFFF",
                          transition:
                            "background 0.2s ease",
                        }}
                      >
                        <td
                          style={{
                            padding: "16px",
                            borderBottom:
                              "1px solid #E2E8F0",
                            color: highlighted
                              ? selectedTable.color
                              : "#0F172A",
                            fontWeight: 900,
                          }}
                        >
                          {row.form}
                        </td>

                        <td
                          style={{
                            padding: "16px",
                            borderBottom:
                              "1px solid #E2E8F0",
                            color: "#475569",
                          }}
                        >
                          {row.continuation}
                        </td>

                        <td
                          style={{
                            padding: "16px",
                            borderBottom:
                              "1px solid #E2E8F0",
                            color: selectedTable.color,
                            fontSize: "18px",
                            fontWeight: 900,
                          }}
                        >
                          {row.value}
                        </td>

                        <td
                          style={{
                            padding: "16px",
                            borderBottom:
                              "1px solid #E2E8F0",
                            color: "#475569",
                          }}
                        >
                          {row.example}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                margin: "20px",
                padding: "17px",
                border: `1px solid ${selectedTable.color}33`,
                borderRadius: "15px",
                background: selectedTable.background,
                color: selectedTable.color,
                lineHeight: 1.75,
                fontWeight: 700,
              }}
            >
              💡 {selectedTable.note}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: "34px" }}>
          <h2 style={styles.sectionTitle}>
            活用形ミニクイズ
          </h2>

          <p style={styles.sectionText}>
            活用形や活用の種類を問題で確認します。
          </p>

          <div
            style={{
              ...styles.whiteCard,
              marginTop: "18px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  padding: "7px 11px",
                  borderRadius: "999px",
                  background: "#DCFCE7",
                  color: "#15803D",
                  fontWeight: 800,
                }}
              >
                問題 {quizIndex + 1} /{" "}
                {quizQuestions.length}
              </span>

              <strong
                style={{
                  color: "#15803D",
                }}
              >
                正解 {score} / {answeredCount}
              </strong>
            </div>

            <h3
              style={{
                margin: "22px 0 0",
                fontSize: "clamp(20px, 4vw, 27px)",
                lineHeight: 1.6,
              }}
            >
              {currentQuestion.question}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "11px",
                marginTop: "20px",
              }}
            >
              {currentQuestion.choices.map((choice) => {
                const selected =
                  selectedAnswer === choice;
                const correctChoice =
                  isAnswered &&
                  choice === currentQuestion.answer;
                const wrongChoice =
                  selected && !isCorrect;

                let background = "#F8FAFC";
                let border = "1px solid #CBD5E1";
                let color = "#334155";

                if (correctChoice) {
                  background = "#DCFCE7";
                  border = "2px solid #22C55E";
                  color = "#166534";
                } else if (wrongChoice) {
                  background = "#FFE4E6";
                  border = "2px solid #FB7185";
                  color = "#9F1239";
                }

                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => selectAnswer(choice)}
                    style={{
                      ...styles.button,
                      minHeight: "56px",
                      padding: "13px",
                      border,
                      borderRadius: "14px",
                      background,
                      color,
                      fontSize: "16px",
                      fontWeight: 800,
                    }}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "17px",
                  borderRadius: "15px",
                  background: isCorrect
                    ? "#F0FDF4"
                    : "#FFF1F2",
                  color: isCorrect
                    ? "#166534"
                    : "#9F1239",
                  lineHeight: 1.7,
                  fontWeight: 700,
                }}
              >
                <strong>
                  {isCorrect
                    ? "正解！"
                    : `不正解。正解は「${currentQuestion.answer}」`}
                </strong>

                <p
                  style={{
                    margin: "6px 0 0",
                  }}
                >
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "18px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={nextQuestion}
                disabled={!isAnswered}
                style={{
                  ...styles.button,
                  padding: "12px 18px",
                  borderRadius: "13px",
                  background: isAnswered
                    ? "#15803D"
                    : "#CBD5E1",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  cursor: isAnswered
                    ? "pointer"
                    : "not-allowed",
                }}
              >
                次の問題 →
              </button>

              <button
                type="button"
                onClick={resetQuiz}
                style={{
                  ...styles.button,
                  padding: "12px 18px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "13px",
                  background: "#FFFFFF",
                  color: "#475569",
                  fontWeight: 800,
                }}
              >
                最初から
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            ...styles.whiteCard,
            padding: "22px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "25px",
            }}
          >
            国文法 全体ノート
          </h2>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748B",
              lineHeight: 1.7,
            }}
          >
            単元をまたいで覚えておきたいことを自由に記録できます。入力内容は自動保存されます。
          </p>

          <textarea
            value={savedData.memo}
            onChange={(event) =>
              setSavedData((current) => ({
                ...current,
                memo: event.target.value,
              }))
            }
            placeholder="例：『ない』を付けて、直前がア段なら五段活用"
            rows={7}
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
              color: "#15803D",
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
    </main>
  );
}