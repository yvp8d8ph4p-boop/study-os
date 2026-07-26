"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useMemo, useState } from "react";

type TextBlock = {
  id: string;
  type: "text";
  title: string;
  content: string;
};

type TableBlock = {
  id: string;
  type: "table";
  title: string;
  headers: string[];
  rows: string[][];
};

type NoteBlock = TextBlock | TableBlock;

type GrammarTopic = {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  emoji: string;
  blocks: NoteBlock[];
};

const STORAGE_KEY = "study-os-grammar-notebook-v3";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const initialTopics: GrammarTopic[] = [
  {
    id: "tenses",
    title: "時制",
    englishTitle: "Tenses",
    description: "現在・過去・未来・進行・完了を整理する。",
    emoji: "🕒",
    blocks: [
      {
        id: "tenses-summary",
        type: "text",
        title: "基本まとめ",
        content:
          "英語の時制では、「いつの話か」と「動作がどのような状態か」を考えます。\n\n現在形：習慣・事実・普段のこと\n過去形：過去に起こったこと\n未来表現：これから起こること\n進行形：動作の途中\n完了形：過去と現在のつながり",
      },
      {
        id: "tenses-table",
        type: "table",
        title: "時制の基本表",
        headers: ["文法", "基本形", "主な意味", "例文"],
        rows: [
          [
            "現在形",
            "動詞の現在形",
            "習慣・事実",
            "I play soccer every day.",
          ],
          [
            "過去形",
            "動詞の過去形",
            "過去の出来事",
            "I played soccer yesterday.",
          ],
          [
            "未来",
            "will + 動詞の原形",
            "未来の予測・意思",
            "I will play soccer tomorrow.",
          ],
          [
            "現在進行形",
            "am / is / are + ing",
            "今している途中",
            "I am playing soccer now.",
          ],
          [
            "現在完了",
            "have / has + 過去分詞",
            "継続・経験・完了",
            "I have lived here for five years.",
          ],
        ],
      },
      {
        id: "tenses-point",
        type: "text",
        title: "見分けるポイント",
        content:
          "yesterday・last week・agoなど、明確な過去を表す語がある場合は過去形を使います。\n\n現在完了は、単なる過去ではなく「現在とのつながり」を意識します。",
      },
    ],
  },
  {
    id: "modals",
    title: "助動詞",
    englishTitle: "Modal Verbs",
    description: "can・must・shouldなどの意味と形を整理する。",
    emoji: "⚙️",
    blocks: [
      {
        id: "modals-summary",
        type: "text",
        title: "基本まとめ",
        content:
          "助動詞は動詞の前に置き、能力・義務・推量・意思などを表します。\n\n基本形：助動詞 + 動詞の原形\n\n主語が三人称単数でも、助動詞の後ろの動詞にsは付けません。",
      },
      {
        id: "modals-table",
        type: "table",
        title: "主な助動詞",
        headers: ["助動詞", "意味", "例文", "日本語"],
        rows: [
          ["can", "能力・可能", "I can swim.", "私は泳げます。"],
          [
            "must",
            "強い義務",
            "You must study.",
            "あなたは勉強しなければなりません。",
          ],
          [
            "should",
            "助言・当然",
            "You should rest.",
            "あなたは休むべきです。",
          ],
          [
            "may",
            "許可・推量",
            "It may rain.",
            "雨が降るかもしれません。",
          ],
          [
            "will",
            "未来・意思",
            "I will help you.",
            "私があなたを手伝います。",
          ],
        ],
      },
      {
        id: "modals-point",
        type: "text",
        title: "重要ポイント",
        content:
          "must notは「してはいけない」という禁止です。\n\ndo not have toは「する必要がない」です。\n\n意味が全く違うので注意します。",
      },
    ],
  },
  {
    id: "infinitives",
    title: "不定詞・動名詞",
    englishTitle: "Infinitives & Gerunds",
    description: "to doとdoingの使い分けを整理する。",
    emoji: "✏️",
    blocks: [
      {
        id: "infinitives-summary",
        type: "text",
        title: "基本まとめ",
        content:
          "不定詞の基本形は「to + 動詞の原形」です。\n動名詞の基本形は「動詞のing形」です。\n\nどちらも「〜すること」と訳せる場合がありますが、使う場所や一緒に使う動詞が異なります。",
      },
      {
        id: "infinitives-table",
        type: "table",
        title: "不定詞の3用法",
        headers: ["用法", "意味", "例文", "日本語"],
        rows: [
          [
            "名詞的用法",
            "〜すること",
            "I like to read.",
            "私は読むことが好きです。",
          ],
          [
            "形容詞的用法",
            "〜するための・〜すべき",
            "I have homework to do.",
            "私にはするべき宿題があります。",
          ],
          [
            "副詞的用法",
            "〜するために",
            "I went there to study.",
            "私は勉強するためにそこへ行きました。",
          ],
        ],
      },
      {
        id: "gerunds-table",
        type: "table",
        title: "不定詞と動名詞",
        headers: ["表現", "形", "例文", "ポイント"],
        rows: [
          [
            "不定詞",
            "to + 動詞の原形",
            "I want to play.",
            "wantの後ろは不定詞",
          ],
          [
            "動名詞",
            "動詞のing形",
            "I enjoy playing.",
            "enjoyの後ろは動名詞",
          ],
          [
            "前置詞の後ろ",
            "動詞のing形",
            "I am good at playing soccer.",
            "前置詞の後ろは動名詞",
          ],
        ],
      },
    ],
  },
  {
    id: "passive",
    title: "受動態",
    englishTitle: "Passive Voice",
    description: "「〜される」を表す文法を整理する。",
    emoji: "🔁",
    blocks: [
      {
        id: "passive-summary",
        type: "text",
        title: "基本まとめ",
        content:
          "受動態の基本形は「be動詞 + 過去分詞」です。\n\n能動態：Tom uses this computer.\n受動態：This computer is used by Tom.\n\n時制はbe動詞を変えて表します。",
      },
      {
        id: "passive-table",
        type: "table",
        title: "受動態の時制",
        headers: ["時制", "基本形", "例文", "日本語"],
        rows: [
          [
            "現在",
            "am / is / are + 過去分詞",
            "English is spoken here.",
            "ここでは英語が話されます。",
          ],
          [
            "過去",
            "was / were + 過去分詞",
            "The temple was built in 1600.",
            "その寺は1600年に建てられました。",
          ],
          [
            "未来",
            "will be + 過去分詞",
            "It will be finished soon.",
            "それはすぐに完成するでしょう。",
          ],
        ],
      },
    ],
  },
  {
    id: "comparison",
    title: "比較",
    englishTitle: "Comparison",
    description: "原級・比較級・最上級を整理する。",
    emoji: "📊",
    blocks: [
      {
        id: "comparison-summary",
        type: "text",
        title: "基本まとめ",
        content:
          "比較には、原級・比較級・最上級があります。\n\n原級：同じくらい〜\n比較級：より〜\n最上級：最も〜",
      },
      {
        id: "comparison-table",
        type: "table",
        title: "比較表現",
        headers: ["種類", "基本形", "例文", "日本語"],
        rows: [
          [
            "原級",
            "as + 原級 + as",
            "Tom is as tall as Ken.",
            "トムはケンと同じくらい背が高い。",
          ],
          [
            "比較級",
            "比較級 + than",
            "Tom is taller than Ken.",
            "トムはケンより背が高い。",
          ],
          [
            "最上級",
            "the + 最上級",
            "Tom is the tallest in his class.",
            "トムはクラスで最も背が高い。",
          ],
        ],
      },
      {
        id: "comparison-change",
        type: "text",
        title: "変化の例",
        content:
          "tall → taller → tallest\nlarge → larger → largest\nbig → bigger → biggest\nbeautiful → more beautiful → most beautiful\ngood → better → best",
      },
    ],
  },
  {
    id: "relative",
    title: "関係詞",
    englishTitle: "Relative Clauses",
    description: "名詞を後ろから説明する文法を整理する。",
    emoji: "🔗",
    blocks: [
      {
        id: "relative-summary",
        type: "text",
        title: "基本まとめ",
        content:
          "関係詞は、前にある名詞を後ろから詳しく説明します。\n\n前にある説明される名詞を「先行詞」と呼びます。",
      },
      {
        id: "relative-table",
        type: "table",
        title: "関係詞の使い分け",
        headers: ["関係詞", "先行詞", "働き", "例"],
        rows: [
          ["who", "人", "主語", "the boy who plays soccer"],
          ["which", "物・動物", "主語・目的語", "the book which I bought"],
          ["that", "人・物", "主語・目的語", "the dog that runs fast"],
          ["where", "場所", "場所を表す副詞", "the town where I live"],
          ["when", "時", "時を表す副詞", "the day when we met"],
        ],
      },
      {
        id: "relative-point",
        type: "text",
        title: "見分けるポイント",
        content:
          "関係詞の後ろに主語がない場合は、主格の関係代名詞である可能性が高いです。\n\n関係詞の後ろに主語がある場合は、目的格の関係代名詞や関係副詞を考えます。",
      },
    ],
  },
  {
    id: "conditional",
    title: "仮定法",
    englishTitle: "Conditional",
    description: "現実と異なる想像を表す文法を整理する。",
    emoji: "💭",
    blocks: [
      {
        id: "conditional-summary",
        type: "text",
        title: "基本まとめ",
        content:
          "仮定法過去は、現在の事実とは異なる想像を表します。\n\n基本形：If + 主語 + 過去形, 主語 + would / could + 動詞の原形",
      },
      {
        id: "conditional-table",
        type: "table",
        title: "仮定法の基本",
        headers: ["種類", "基本形", "例文", "意味"],
        rows: [
          [
            "仮定法過去",
            "If + 過去形, would + 原形",
            "If I were you, I would study.",
            "もし私があなたなら、勉強するのに。",
          ],
          [
            "I wish",
            "I wish + 過去形",
            "I wish I could fly.",
            "飛べたらいいのに。",
          ],
          [
            "仮定法過去完了",
            "If + had + 過去分詞",
            "If I had studied, I would have passed.",
            "勉強していたら、合格していただろう。",
          ],
        ],
      },
    ],
  },
  {
    id: "prepositions",
    title: "前置詞",
    englishTitle: "Prepositions",
    description: "時・場所・方向などの関係を整理する。",
    emoji: "📍",
    blocks: [
      {
        id: "prepositions-summary",
        type: "text",
        title: "基本まとめ",
        content:
          "前置詞は名詞や代名詞の前に置きます。\n\n前置詞の後ろに動詞を置く場合は、基本的に動名詞の形にします。\n\n例：I am good at playing soccer.",
      },
      {
        id: "prepositions-time",
        type: "table",
        title: "時を表す前置詞",
        headers: ["前置詞", "使う場面", "例"],
        rows: [
          ["at", "時刻・一点", "at seven"],
          ["on", "曜日・日付", "on Monday"],
          ["in", "月・年・季節", "in July"],
          ["for", "期間", "for three years"],
          ["since", "開始時点", "since 2020"],
        ],
      },
      {
        id: "prepositions-place",
        type: "table",
        title: "場所を表す前置詞",
        headers: ["前置詞", "イメージ", "例"],
        rows: [
          ["at", "地点", "at the station"],
          ["in", "空間の中", "in the room"],
          ["on", "面の上", "on the desk"],
          ["under", "下", "under the table"],
          ["between", "2つの間", "between A and B"],
        ],
      },
    ],
  },
];

function cloneInitialTopics(): GrammarTopic[] {
  return JSON.parse(JSON.stringify(initialTopics)) as GrammarTopic[];
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "28px 16px 70px",
    background:
      "linear-gradient(135deg, #eff6ff 0%, #f8fafc 48%, #eef2ff 100%)",
    color: "#172033",
  },
  container: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: "0 0 7px",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.13em",
  },
  title: {
    margin: 0,
    color: "#1d4ed8",
    fontSize: "clamp(38px, 7vw, 58px)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  subtitle: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.8,
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  button: {
    minHeight: "42px",
    padding: "0 15px",
    border: "1px solid #d7e0ee",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
  },
  resetButton: {
    minHeight: "42px",
    padding: "0 15px",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    background: "#fff7f7",
    color: "#b91c1c",
    fontWeight: 800,
    cursor: "pointer",
  },
  homeLink: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "42px",
    padding: "0 15px",
    border: "1px solid #d7e0ee",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#2563eb",
    fontWeight: 800,
    textDecoration: "none",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "250px minmax(0, 1fr)",
    gap: "20px",
    alignItems: "start",
  },
  sidebar: {
    padding: "16px",
    border: "1px solid #dbe4f0",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 16px 42px rgba(44, 68, 120, 0.10)",
  },
  sidebarTitle: {
    margin: "0 0 12px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 900,
  },
  topicList: {
    display: "grid",
    gap: "8px",
  },
  notebookArea: {
    minWidth: 0,
  },
  notebookHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "16px",
    marginBottom: "14px",
    padding: "0 4px",
    flexWrap: "wrap",
  },
  englishTitle: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  topicTitle: {
    margin: 0,
    color: "#172033",
    fontSize: "32px",
  },
  topicDescription: {
    display: "block",
    marginTop: "6px",
    color: "#64748b",
    fontSize: "14px",
  },
  saveStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 800,
  },
  saveDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#22c55e",
  },
  paper: {
    minHeight: "720px",
    padding: "clamp(16px, 4vw, 34px)",
    border: "1px solid #dbe2ea",
    borderRadius: "24px",
    backgroundColor: "#fffefa",
    backgroundImage:
      "linear-gradient(to bottom, transparent 35px, rgba(70, 108, 170, 0.09) 36px)",
    backgroundSize: "100% 36px",
    boxShadow: "0 22px 52px rgba(44, 65, 110, 0.12)",
  },
  noteBlock: {
    marginBottom: "20px",
    padding: "18px",
    border: "1px solid #dbe3ed",
    borderRadius: "17px",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 8px 22px rgba(51, 70, 105, 0.07)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  noteNumber: {
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.12em",
  },
  toolbarActions: {
    display: "flex",
    gap: "5px",
  },
  smallButton: {
    minWidth: "32px",
    height: "31px",
    border: "1px solid #d8e0eb",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 900,
    cursor: "pointer",
  },
  deleteButton: {
    height: "31px",
    padding: "0 10px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    background: "#fff7f7",
    color: "#b91c1c",
    fontWeight: 900,
    cursor: "pointer",
  },
  titleInput: {
    width: "100%",
    marginBottom: "8px",
    padding: "4px 2px 9px",
    border: "none",
    borderBottom: "2px solid #e2e8f0",
    outline: "none",
    background: "transparent",
    color: "#1e293b",
    fontSize: "19px",
    fontWeight: 900,
  },
  textArea: {
    width: "100%",
    minHeight: "135px",
    padding: "12px",
    resize: "vertical",
    border: "1px solid #e2e8f0",
    borderRadius: "11px",
    outline: "none",
    background: "#ffffff",
    color: "#334155",
    fontFamily: "inherit",
    fontSize: "15px",
    lineHeight: 1.85,
    boxSizing: "border-box",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #dbe2ea",
    borderRadius: "12px",
    background: "#ffffff",
  },
  table: {
    width: "100%",
    minWidth: "680px",
    borderCollapse: "collapse",
  },
  th: {
    position: "relative",
    minWidth: "150px",
    padding: "7px",
    borderRight: "1px solid #dbe2ea",
    borderBottom: "1px solid #dbe2ea",
    background: "#eaf2ff",
  },
  td: {
    minWidth: "150px",
    padding: "6px",
    borderRight: "1px solid #dbe2ea",
    borderBottom: "1px solid #dbe2ea",
    verticalAlign: "top",
  },
  tableInput: {
    width: "100%",
    padding: "8px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#334155",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 900,
    boxSizing: "border-box",
  },
  cellInput: {
    width: "100%",
    minHeight: "70px",
    padding: "8px",
    resize: "vertical",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#334155",
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: 1.55,
    boxSizing: "border-box",
  },
  removeCell: {
    width: "42px",
    minWidth: "42px",
    padding: "6px",
    borderBottom: "1px solid #dbe2ea",
    textAlign: "center",
    verticalAlign: "middle",
  },
  removeButton: {
    width: "27px",
    height: "27px",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    background: "#fff7f7",
    color: "#b91c1c",
    cursor: "pointer",
  },
  tableActions: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  tableActionButton: {
    minHeight: "36px",
    padding: "0 12px",
    border: "1px solid #bfdbfe",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 850,
    cursor: "pointer",
  },
  addArea: {
    display: "grid",
    placeItems: "center",
    paddingTop: "10px",
  },
  addButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  addButton: {
    minHeight: "46px",
    padding: "0 18px",
    border: "none",
    borderRadius: "13px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 900,
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.24)",
    cursor: "pointer",
  },
  addTableButton: {
    minHeight: "46px",
    padding: "0 18px",
    border: "1px solid #c7d2fe",
    borderRadius: "13px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
  },
};

export default function GrammarNotebookPage() {
  const [topics, setTopics] = useState<GrammarTopic[]>(
    cloneInitialTopics(),
  );
  const [selectedId, setSelectedId] = useState(initialTopics[0].id);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 820);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => {
      window.removeEventListener("resize", checkWidth);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as GrammarTopic[];

        if (Array.isArray(parsed) && parsed.length > 0) {
          setTopics(parsed);
        }
      }
    } catch (error) {
      console.error("文法ノートの読み込みに失敗しました。", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics, loaded]);

  const selectedTopic = useMemo(() => {
    return (
      topics.find((topic) => topic.id === selectedId) ??
      topics[0]
    );
  }, [topics, selectedId]);

  function updateBlocks(blocks: NoteBlock[]) {
    setTopics((currentTopics) =>
      currentTopics.map((topic) =>
        topic.id === selectedTopic.id
          ? { ...topic, blocks }
          : topic,
      ),
    );
  }

  function updateTextBlock(
    blockId: string,
    field: "title" | "content",
    value: string,
  ) {
    const blocks = selectedTopic.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "text") {
        return block;
      }

      return {
        ...block,
        [field]: value,
      };
    });

    updateBlocks(blocks);
  }

  function updateTableTitle(blockId: string, value: string) {
    const blocks = selectedTopic.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "table") {
        return block;
      }

      return {
        ...block,
        title: value,
      };
    });

    updateBlocks(blocks);
  }

  function updateHeader(
    blockId: string,
    columnIndex: number,
    value: string,
  ) {
    const blocks = selectedTopic.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "table") {
        return block;
      }

      const headers = [...block.headers];
      headers[columnIndex] = value;

      return {
        ...block,
        headers,
      };
    });

    updateBlocks(blocks);
  }

  function updateCell(
    blockId: string,
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) {
    const blocks = selectedTopic.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "table") {
        return block;
      }

      const rows = block.rows.map((row, currentRowIndex) => {
        if (currentRowIndex !== rowIndex) {
          return row;
        }

        const newRow = [...row];
        newRow[columnIndex] = value;
        return newRow;
      });

      return {
        ...block,
        rows,
      };
    });

    updateBlocks(blocks);
  }

  function addTextBlock() {
    const newBlock: TextBlock = {
      id: createId(),
      type: "text",
      title: "自分のメモ",
      content: "ここに覚えたいことや注意点を書いてください。",
    };

    updateBlocks([...selectedTopic.blocks, newBlock]);
  }

  function addTableBlock() {
    const newBlock: TableBlock = {
      id: createId(),
      type: "table",
      title: "新しい表",
      headers: ["項目", "内容", "例"],
      rows: [
        ["", "", ""],
        ["", "", ""],
      ],
    };

    updateBlocks([...selectedTopic.blocks, newBlock]);
  }

  function addRow(blockId: string) {
    const blocks = selectedTopic.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "table") {
        return block;
      }

      return {
        ...block,
        rows: [
          ...block.rows,
          Array.from({ length: block.headers.length }, () => ""),
        ],
      };
    });

    updateBlocks(blocks);
  }

  function addColumn(blockId: string) {
    const blocks = selectedTopic.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "table") {
        return block;
      }

      return {
        ...block,
        headers: [...block.headers, "新しい項目"],
        rows: block.rows.map((row) => [...row, ""]),
      };
    });

    updateBlocks(blocks);
  }

  function removeRow(blockId: string, rowIndex: number) {
    const blocks = selectedTopic.blocks.map((block) => {
      if (block.id !== blockId || block.type !== "table") {
        return block;
      }

      return {
        ...block,
        rows: block.rows.filter(
          (_, currentIndex) => currentIndex !== rowIndex,
        ),
      };
    });

    updateBlocks(blocks);
  }

  function deleteBlock(blockId: string) {
    const shouldDelete = window.confirm(
      "このノートを削除しますか？",
    );

    if (!shouldDelete) {
      return;
    }

    updateBlocks(
      selectedTopic.blocks.filter(
        (block) => block.id !== blockId,
      ),
    );
  }

  function moveBlock(
    blockId: string,
    direction: "up" | "down",
  ) {
    const currentIndex = selectedTopic.blocks.findIndex(
      (block) => block.id === blockId,
    );

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (
      currentIndex === -1 ||
      targetIndex < 0 ||
      targetIndex >= selectedTopic.blocks.length
    ) {
      return;
    }

    const blocks = [...selectedTopic.blocks];
    const [movedBlock] = blocks.splice(currentIndex, 1);
    blocks.splice(targetIndex, 0, movedBlock);

    updateBlocks(blocks);
  }

  function resetAll() {
    const shouldReset = window.confirm(
      "書き足した内容を消して、最初の文法まとめに戻しますか？",
    );

    if (!shouldReset) {
      return;
    }

    const resetTopics = cloneInitialTopics();
    setTopics(resetTopics);
    setSelectedId(resetTopics[0].id);
    localStorage.removeItem(STORAGE_KEY);
  }

  if (!selectedTopic) {
    return null;
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>STUDY OS / ENGLISH</p>

            <h1 style={styles.title}>Grammar Notebook</h1>

            <p style={styles.subtitle}>
              基本文法のまとめに、自分のメモや表を書き足せるノート。
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.resetButton}
              onClick={resetAll}
            >
              初期状態に戻す
            </button>

            <Link href="/english" style={styles.homeLink}>
              ← 英語ホーム
            </Link>
          </div>
        </header>

        <div
          style={{
            ...styles.layout,
            gridTemplateColumns: isMobile
              ? "1fr"
              : "250px minmax(0, 1fr)",
          }}
        >
          <aside style={styles.sidebar}>
            <p style={styles.sidebarTitle}>文法ノート</p>

            <div
              style={{
                ...styles.topicList,
                display: isMobile ? "flex" : "grid",
                overflowX: isMobile ? "auto" : "visible",
                paddingBottom: isMobile ? "5px" : 0,
              }}
            >
              {topics.map((topic) => {
                const active = topic.id === selectedTopic.id;

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedId(topic.id)}
                    style={{
                      width: isMobile ? "165px" : "100%",
                      flex: isMobile ? "0 0 auto" : undefined,
                      padding: "12px",
                      border: active
                        ? "1px solid #93c5fd"
                        : "1px solid transparent",
                      borderRadius: "13px",
                      background: active
                        ? "#eaf2ff"
                        : "transparent",
                      color: active ? "#1d4ed8" : "#475569",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "21px",
                      }}
                    >
                      {topic.emoji}
                    </span>

                    <strong
                      style={{
                        display: "block",
                        fontSize: "14px",
                      }}
                    >
                      {topic.title}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: "3px",
                        fontSize: "10px",
                        opacity: 0.7,
                      }}
                    >
                      {topic.englishTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section style={styles.notebookArea}>
            <div style={styles.notebookHeader}>
              <div>
                <p style={styles.englishTitle}>
                  {selectedTopic.englishTitle}
                </p>

                <h2 style={styles.topicTitle}>
                  {selectedTopic.emoji} {selectedTopic.title}
                </h2>

                <span style={styles.topicDescription}>
                  {selectedTopic.description}
                </span>
              </div>

              <div style={styles.saveStatus}>
                <span style={styles.saveDot} />
                自動保存
              </div>
            </div>

            <div style={styles.paper}>
              {selectedTopic.blocks.map((block, index) => (
                <article key={block.id} style={styles.noteBlock}>
                  <div style={styles.toolbar}>
                    <span style={styles.noteNumber}>
                      NOTE {String(index + 1).padStart(2, "0")}
                    </span>

                    <div style={styles.toolbarActions}>
                      <button
                        type="button"
                        style={{
                          ...styles.smallButton,
                          opacity: index === 0 ? 0.35 : 1,
                        }}
                        disabled={index === 0}
                        onClick={() =>
                          moveBlock(block.id, "up")
                        }
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        style={{
                          ...styles.smallButton,
                          opacity:
                            index ===
                            selectedTopic.blocks.length - 1
                              ? 0.35
                              : 1,
                        }}
                        disabled={
                          index ===
                          selectedTopic.blocks.length - 1
                        }
                        onClick={() =>
                          moveBlock(block.id, "down")
                        }
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        style={styles.deleteButton}
                        onClick={() => deleteBlock(block.id)}
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  {block.type === "text" ? (
                    <>
                      <input
                        value={block.title}
                        style={styles.titleInput}
                        onChange={(event) =>
                          updateTextBlock(
                            block.id,
                            "title",
                            event.target.value,
                          )
                        }
                      />

                      <textarea
                        value={block.content}
                        rows={Math.max(
                          6,
                          block.content.split("\n").length + 2,
                        )}
                        style={styles.textArea}
                        onChange={(event) =>
                          updateTextBlock(
                            block.id,
                            "content",
                            event.target.value,
                          )
                        }
                      />
                    </>
                  ) : (
                    <>
                      <input
                        value={block.title}
                        style={styles.titleInput}
                        onChange={(event) =>
                          updateTableTitle(
                            block.id,
                            event.target.value,
                          )
                        }
                      />

                      <div style={styles.tableWrap}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              {block.headers.map(
                                (header, columnIndex) => (
                                  <th
                                    key={`${block.id}-header-${columnIndex}`}
                                    style={styles.th}
                                  >
                                    <input
                                      value={header}
                                      style={styles.tableInput}
                                      onChange={(event) =>
                                        updateHeader(
                                          block.id,
                                          columnIndex,
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </th>
                                ),
                              )}

                              <th
                                style={{
                                  ...styles.th,
                                  width: "42px",
                                  minWidth: "42px",
                                }}
                              />
                            </tr>
                          </thead>

                          <tbody>
                            {block.rows.map((row, rowIndex) => (
                              <tr
                                key={`${block.id}-row-${rowIndex}`}
                              >
                                {row.map(
                                  (cell, columnIndex) => (
                                    <td
                                      key={`${block.id}-${rowIndex}-${columnIndex}`}
                                      style={styles.td}
                                    >
                                      <textarea
                                        value={cell}
                                        rows={2}
                                        style={styles.cellInput}
                                        onChange={(event) =>
                                          updateCell(
                                            block.id,
                                            rowIndex,
                                            columnIndex,
                                            event.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                  ),
                                )}

                                <td style={styles.removeCell}>
                                  <button
                                    type="button"
                                    style={styles.removeButton}
                                    onClick={() =>
                                      removeRow(
                                        block.id,
                                        rowIndex,
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={styles.tableActions}>
                        <button
                          type="button"
                          style={styles.tableActionButton}
                          onClick={() => addRow(block.id)}
                        >
                          ＋ 行を追加
                        </button>

                        <button
                          type="button"
                          style={styles.tableActionButton}
                          onClick={() => addColumn(block.id)}
                        >
                          ＋ 列を追加
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}

              <div style={styles.addArea}>
                <div style={styles.addButtons}>
                  <button
                    type="button"
                    style={styles.addButton}
                    onClick={addTextBlock}
                  >
                    ＋ テキストを追加
                  </button>

                  <button
                    type="button"
                    style={styles.addTableButton}
                    onClick={addTableBlock}
                  >
                    ＋ 表を追加
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}