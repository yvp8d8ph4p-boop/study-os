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
  | "technique"
  | "keyword"
  | "connector"
  | "reference"
  | "writing";

type StudyItem = {
  id: string;
  category: CategoryId;
  title: string;
  group: string;
  summary: string;
  detail: string;
  example?: string;
  custom?: boolean;
};

type CustomForm = {
  title: string;
  group: string;
  summary: string;
  detail: string;
  example: string;
};

type NoteBlock = {
  id: string;
  title: string;
  body: string;
};

const categories: {
  id: CategoryId;
  title: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "technique",
    title: "読解テクニック",
    icon: "📖",
    description: "評論・小説・選択問題の読み方",
  },
  {
    id: "keyword",
    title: "評論キーワード",
    icon: "💬",
    description: "頻出語の意味・対義語・使われ方",
  },
  {
    id: "connector",
    title: "接続語",
    icon: "🔗",
    description: "文章の流れを示す言葉",
  },
  {
    id: "reference",
    title: "指示語",
    icon: "👉",
    description: "「これ」「それ」が指す内容の探し方",
  },
  {
    id: "writing",
    title: "記述問題",
    icon: "✍️",
    description: "理由・心情・要旨をまとめる型",
  },
];

const builtInItems: StudyItem[] = [
  {
    id: "technique-contrast",
    category: "technique",
    title: "対比を見つける",
    group: "評論",
    summary: "筆者の主張は、反対側の考えと比べると見えやすい。",
    detail:
      "「一方で」「しかし」「これに対して」などの前後では、二つの考えが対比されやすい。何と何が比べられているかを短い言葉で整理する。",
    example:
      "例：便利さを重視する社会 ↔ 手間の中に価値を見いだす考え",
  },
  {
    id: "technique-conclusion",
    category: "technique",
    title: "結論の位置を意識する",
    group: "評論",
    summary: "段落の最初と最後には、要点が置かれやすい。",
    detail:
      "各段落を読んだら、最初の一文と最後の一文を確認する。繰り返される語句や、言い換えられた主張にも注目する。",
  },
  {
    id: "technique-choice",
    category: "technique",
    title: "選択肢は部分ごとに判定する",
    group: "選択問題",
    summary: "一文全体を雰囲気で選ばず、前半と後半に分けて確認する。",
    detail:
      "選択肢に一か所でも本文と合わない部分があれば不正解。主語・理由・程度・因果関係を細かく確認する。",
  },
  {
    id: "technique-feeling",
    category: "technique",
    title: "心情は出来事と反応から読む",
    group: "小説",
    summary: "気持ちを直接表す言葉だけでなく、行動や会話を見る。",
    detail:
      "人物の表情、しぐさ、言葉遣い、周囲との距離、直前に起きた出来事をつなげて考える。",
  },
  {
    id: "keyword-abstract",
    category: "keyword",
    title: "抽象",
    group: "基本語",
    summary: "多くの具体例に共通する性質をまとめたもの。",
    detail:
      "個々の出来事から細部を取り除き、共通点を取り出して考えること。",
    example: "対義語：具体",
  },
  {
    id: "keyword-relative",
    category: "keyword",
    title: "相対",
    group: "基本語",
    summary: "他との関係によって価値や意味が決まること。",
    detail:
      "単独で決まるのではなく、立場・時代・文化・比較対象によって変わる考え方。",
    example: "対義語：絶対",
  },
  {
    id: "keyword-objective",
    category: "keyword",
    title: "客観",
    group: "基本語",
    summary: "個人の感情を離れ、事実に基づいて見ること。",
    detail:
      "誰が見ても同じように確認できる事実や資料をもとに判断する。",
    example: "対義語：主観",
  },
  {
    id: "keyword-universal",
    category: "keyword",
    title: "普遍",
    group: "頻出語",
    summary: "時代や場所を超えて広く当てはまること。",
    detail:
      "特定の条件だけに限られず、多くの場合に共通する性質を表す。",
    example: "対義語：特殊・個別",
  },
  {
    id: "connector-but",
    category: "connector",
    title: "しかし",
    group: "逆接",
    summary: "前の内容とは反対方向へ話を進める。",
    detail:
      "逆接の後ろには、筆者が本当に言いたい内容が置かれることが多い。",
  },
  {
    id: "connector-therefore",
    category: "connector",
    title: "したがって",
    group: "結論",
    summary: "前の内容を受けて結論を示す。",
    detail:
      "理由や根拠の後に置かれ、その結果として成り立つ判断を表す。",
  },
  {
    id: "connector-inotherwords",
    category: "connector",
    title: "つまり",
    group: "言い換え",
    summary: "前の内容を分かりやすくまとめ直す。",
    detail:
      "難しい説明の後に、要点を短く示す働きがある。",
  },
  {
    id: "connector-example",
    category: "connector",
    title: "例えば",
    group: "例示",
    summary: "抽象的な説明の具体例を示す。",
    detail:
      "具体例そのものより、その例が何を説明しているのかを確認する。",
  },
  {
    id: "connector-add",
    category: "connector",
    title: "さらに",
    group: "添加",
    summary: "前の内容に情報を付け加える。",
    detail:
      "同じ方向の説明や根拠を追加し、主張を強める。",
  },
  {
    id: "reference-basic",
    category: "reference",
    title: "指示語は基本的に前を見る",
    group: "基本",
    summary: "「これ」「それ」の内容は直前付近にあることが多い。",
    detail:
      "直前の一語だけでなく、文・出来事・考え全体を指す場合もある。指示語に内容を代入して文が自然か確かめる。",
  },
  {
    id: "reference-range",
    category: "reference",
    title: "指す範囲を調整する",
    group: "実践",
    summary: "答えが長すぎたり短すぎたりしないようにする。",
    detail:
      "中心となる名詞だけでなく、必要な修飾語や理由まで含める。逆に具体例の細部は省くこともある。",
  },
  {
    id: "writing-reason",
    category: "writing",
    title: "理由問題の型",
    group: "理由",
    summary: "原因・背景と、傍線部の内容をつなげる。",
    detail:
      "「〜ため。」「〜から。」で終えるだけでなく、何がどう影響したのかを本文の言葉で説明する。",
    example: "型：Aという状況によって、Bと考えたため。",
  },
  {
    id: "writing-feeling",
    category: "writing",
    title: "心情問題の型",
    group: "心情",
    summary: "出来事＋人物の受け止め方＋感情でまとめる。",
    detail:
      "感情語だけを書くのではなく、なぜその気持ちになったかを含める。",
    example: "型：Aという出来事をBと受け止め、Cと感じた。",
  },
  {
    id: "writing-summary",
    category: "writing",
    title: "要旨問題の型",
    group: "要旨",
    summary: "話題・筆者の主張・理由を一つにまとめる。",
    detail:
      "具体例を削り、繰り返される言葉や対比の中心を使って短く整理する。",
  },
];

const emptyForm: CustomForm = {
  title: "",
  group: "",
  summary: "",
  detail: "",
  example: "",
};

const STORAGE_KEY = "study-os-modern-japanese-v1";

type SavedState = {
  customItems: StudyItem[];
  favorites: string[];
  itemNotes: Record<string, string>;
  notebook: NoteBlock[];
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(145deg, #faf7f5 0%, #f6f0ed 48%, #f1e8e5 100%)",
    color: "#2f2624",
    padding: "24px 14px 70px",
  },
  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  brand: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 950,
    letterSpacing: "0.14em",
    color: "#7f1d1d",
  },
  back: {
    textDecoration: "none",
    color: "#7f1d1d",
    fontWeight: 850,
    fontSize: "13px",
    border: "1px solid #dfcfca",
    background: "rgba(255,255,255,.8)",
    borderRadius: "12px",
    padding: "11px 14px",
  },
  hero: {
    borderRadius: "28px",
    padding: "38px clamp(22px, 5vw, 54px)",
    color: "white",
    background:
      "linear-gradient(135deg, #7f1d1d 0%, #8f2731 52%, #642024 100%)",
    boxShadow: "0 24px 60px rgba(90, 25, 25, .18)",
    marginBottom: "24px",
  },
  eyebrow: {
    margin: "0 0 9px",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".16em",
    color: "#fecaca",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(38px, 7vw, 66px)",
    letterSpacing: "-.045em",
  },
  heroText: {
    margin: "16px 0 0",
    maxWidth: "690px",
    lineHeight: 1.9,
    color: "#fee2e2",
    fontSize: "14px",
  },
  toolbar: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: "10px",
    marginBottom: "18px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #ddcfcb",
    borderRadius: "13px",
    padding: "12px 13px",
    background: "#fff",
    color: "#342927",
    outline: "none",
    fontSize: "14px",
  },
  button: {
    border: "none",
    borderRadius: "13px",
    padding: "0 15px",
    minHeight: "44px",
    fontWeight: 900,
    cursor: "pointer",
    background: "#8b1e2d",
    color: "#fff",
  },
  softButton: {
    border: "1px solid #dbc7c2",
    borderRadius: "13px",
    padding: "0 15px",
    minHeight: "44px",
    fontWeight: 850,
    cursor: "pointer",
    background: "#fff",
    color: "#7f1d1d",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "250px minmax(0, 1fr)",
    gap: "18px",
    alignItems: "start",
  },
  sidebar: {
    position: "sticky",
    top: "16px",
    border: "1px solid #e0d2ce",
    borderRadius: "20px",
    background: "rgba(255,255,255,.88)",
    padding: "10px",
    boxShadow: "0 12px 30px rgba(74, 45, 40, .07)",
  },
  sideButton: {
    width: "100%",
    textAlign: "left",
    border: "none",
    borderRadius: "14px",
    padding: "12px",
    margin: "3px 0",
    cursor: "pointer",
    background: "transparent",
    color: "#4b3734",
  },
  sideTitle: {
    display: "block",
    fontWeight: 900,
    fontSize: "14px",
  },
  sideDescription: {
    display: "block",
    color: "#8b7470",
    fontSize: "11px",
    marginTop: "4px",
    lineHeight: 1.5,
  },
  content: {
    minWidth: 0,
  },
  sectionCard: {
    border: "1px solid #e0d2ce",
    borderRadius: "22px",
    background: "rgba(255,255,255,.9)",
    boxShadow: "0 12px 30px rgba(74, 45, 40, .07)",
    overflow: "hidden",
  },
  sectionHeader: {
    padding: "20px",
    borderBottom: "1px solid #eadeda",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "23px",
    color: "#5f2428",
  },
  sectionSubtitle: {
    margin: "6px 0 0",
    color: "#8d7470",
    fontSize: "12px",
  },
  list: {
    padding: "12px",
    display: "grid",
    gap: "10px",
  },
  item: {
    border: "1px solid #e6d9d5",
    borderRadius: "16px",
    background: "#fff",
    overflow: "hidden",
  },
  itemButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    textAlign: "left",
    padding: "16px",
    cursor: "pointer",
    color: "#352b29",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  itemTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#5b272b",
  },
  group: {
    display: "inline-flex",
    marginTop: "7px",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: 900,
    background: "#fef2f2",
    color: "#9f3237",
  },
  summary: {
    margin: "10px 0 0",
    color: "#6f5c58",
    lineHeight: 1.7,
    fontSize: "13px",
  },
  detail: {
    padding: "0 16px 16px",
    borderTop: "1px solid #f0e6e3",
  },
  detailText: {
    lineHeight: 1.9,
    fontSize: "13px",
    color: "#4f403d",
  },
  example: {
    padding: "11px 12px",
    borderRadius: "12px",
    background: "#faf3f1",
    color: "#6e3b3e",
    fontSize: "12px",
    lineHeight: 1.7,
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "105px",
    resize: "vertical",
    border: "1px solid #ddcfcb",
    borderRadius: "12px",
    padding: "12px",
    background: "#fff",
    color: "#342927",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: 1.7,
  },
  miniActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  miniButton: {
    border: "1px solid #dbcac6",
    borderRadius: "10px",
    background: "#fff",
    color: "#7c292f",
    padding: "8px 10px",
    fontWeight: 850,
    cursor: "pointer",
    fontSize: "12px",
  },
  dangerButton: {
    border: "1px solid #efc8c8",
    borderRadius: "10px",
    background: "#fff7f7",
    color: "#b42318",
    padding: "8px 10px",
    fontWeight: 850,
    cursor: "pointer",
    fontSize: "12px",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    background: "rgba(35, 20, 18, .46)",
    display: "grid",
    placeItems: "center",
    padding: "16px",
  },
  modal: {
    width: "100%",
    maxWidth: "620px",
    maxHeight: "88vh",
    overflowY: "auto",
    borderRadius: "22px",
    background: "#fffaf8",
    border: "1px solid #e3d2cd",
    boxShadow: "0 30px 80px rgba(47, 25, 22, .25)",
    padding: "20px",
  },
  formGrid: {
    display: "grid",
    gap: "12px",
  },
  label: {
    display: "grid",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 900,
    color: "#694047",
  },
  empty: {
    padding: "42px 20px",
    textAlign: "center",
    color: "#927b76",
  },
  notebook: {
    display: "grid",
    gap: "12px",
    padding: "14px",
  },
  noteCard: {
    border: "1px solid #e3d5d1",
    borderRadius: "16px",
    background: "#fff",
    padding: "14px",
  },
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ModernJapanesePage() {
  const [activeCategory, setActiveCategory] =
    useState<CategoryId>("technique");
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [customItems, setCustomItems] = useState<StudyItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [notebook, setNotebook] = useState<NoteBlock[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null);
  const [form, setForm] = useState<CustomForm>(emptyForm);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved: SavedState = JSON.parse(raw);
        setCustomItems(saved.customItems ?? []);
        setFavorites(saved.favorites ?? []);
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

    const state: SavedState = {
      customItems,
      favorites,
      itemNotes,
      notebook,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [customItems, favorites, itemNotes, notebook, ready]);

  const allItems = useMemo(
    () => [...builtInItems, ...customItems],
    [customItems],
  );

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return allItems.filter((item) => {
      const inCategory = item.category === activeCategory;
      const favoriteMatch =
        !showOnlyFavorites || favorites.includes(item.id);
      const queryMatch =
        !normalized ||
        [
          item.title,
          item.group,
          item.summary,
          item.detail,
          item.example ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      return inCategory && favoriteMatch && queryMatch;
    });
  }, [
    activeCategory,
    allItems,
    favorites,
    query,
    showOnlyFavorites,
  ]);

  const activeCategoryData =
    categories.find((category) => category.id === activeCategory) ??
    categories[0];

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(item: StudyItem) {
    setEditingItem(item);
    setForm({
      title: item.title,
      group: item.group,
      summary: item.summary,
      detail: item.detail,
      example: item.example ?? "",
    });
    setModalOpen(true);
  }

  function saveItem(event: FormEvent) {
    event.preventDefault();

    if (!form.title.trim() || !form.summary.trim()) return;

    if (editingItem) {
      setCustomItems((items) =>
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: form.title.trim(),
                group: form.group.trim() || "自分で追加",
                summary: form.summary.trim(),
                detail: form.detail.trim(),
                example: form.example.trim(),
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
          summary: form.summary.trim(),
          detail: form.detail.trim(),
          example: form.example.trim(),
          custom: true,
        },
      ]);
    }

    setModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  function deleteItem(id: string) {
    const ok = window.confirm("この追加項目を削除しますか？");
    if (!ok) return;

    setCustomItems((items) => items.filter((item) => item.id !== id));
    setFavorites((items) => items.filter((itemId) => itemId !== id));
    setItemNotes((notes) => {
      const next = { ...notes };
      delete next[id];
      return next;
    });
  }

  function toggleFavorite(id: string) {
    setFavorites((items) =>
      items.includes(id)
        ? items.filter((itemId) => itemId !== id)
        : [...items, id],
    );
  }

  function addNotebookBlock() {
    setNotebook((blocks) => [
      ...blocks,
      {
        id: uid(),
        title: "新しいノート",
        body: "",
      },
    ]);
  }

  function exportData() {
    const data: SavedState = {
      customItems,
      favorites,
      itemNotes,
      notebook,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "study-os-modern-japanese-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importData(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as SavedState;
        setCustomItems(data.customItems ?? []);
        setFavorites(data.favorites ?? []);
        setItemNotes(data.itemNotes ?? {});
        setNotebook(data.notebook ?? []);
        window.alert("バックアップを読み込みました。");
      } catch {
        window.alert("読み込みに失敗しました。JSONファイルを確認してください。");
      }
    };

    reader.readAsText(file);
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.topbar}>
          <p style={styles.brand}>STUDY OS / JAPANESE / MODERN</p>
          <Link href="/japanese" style={styles.back}>
            ← 国語ホーム
          </Link>
        </header>

        <section style={styles.hero}>
          <p style={styles.eyebrow}>MODERN JAPANESE</p>
          <h1 style={styles.heroTitle}>現代文</h1>
          <p style={styles.heroText}>
            常設の読解知識に、自分で見つけた接続語・評論語・解き方を追加。
            使うほど自分専用の現代文参考書に育つページ。
          </p>
        </section>

        <div
          style={{
            ...styles.toolbar,
            gridTemplateColumns:
              typeof window !== "undefined" && window.innerWidth < 720
                ? "1fr"
                : "1fr auto auto",
          }}
        >
          <input
            style={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="項目を検索…"
          />

          <button
            type="button"
            style={styles.softButton}
            onClick={() => setShowOnlyFavorites((value) => !value)}
          >
            {showOnlyFavorites ? "⭐ お気に入りのみ" : "☆ お気に入り"}
          </button>

          <button
            type="button"
            style={styles.button}
            onClick={openCreateModal}
          >
            ＋ 項目を追加
          </button>
        </div>

        <div
          style={{
            ...styles.layout,
            gridTemplateColumns:
              typeof window !== "undefined" && window.innerWidth < 850
                ? "1fr"
                : "250px minmax(0, 1fr)",
          }}
        >
          <aside
            style={{
              ...styles.sidebar,
              position:
                typeof window !== "undefined" && window.innerWidth < 850
                  ? "static"
                  : "sticky",
            }}
          >
            {categories.map((category) => {
              const active =
                !showNotebook && activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  style={{
                    ...styles.sideButton,
                    background: active ? "#fce8e7" : "transparent",
                    color: active ? "#7f1d1d" : "#4b3734",
                  }}
                  onClick={() => {
                    setShowNotebook(false);
                    setActiveCategory(category.id);
                  }}
                >
                  <span style={styles.sideTitle}>
                    {category.icon} {category.title}
                  </span>
                  <span style={styles.sideDescription}>
                    {category.description}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              style={{
                ...styles.sideButton,
                background: showNotebook ? "#fce8e7" : "transparent",
                color: showNotebook ? "#7f1d1d" : "#4b3734",
              }}
              onClick={() => setShowNotebook(true)}
            >
              <span style={styles.sideTitle}>📒 現代文ノート</span>
              <span style={styles.sideDescription}>
                自由に書ける自分専用ノート
              </span>
            </button>

            <div style={{ padding: "10px 4px 2px" }}>
              <button
                type="button"
                style={{ ...styles.softButton, width: "100%" }}
                onClick={exportData}
              >
                データを書き出す
              </button>

              <label
                style={{
                  ...styles.softButton,
                  display: "grid",
                  placeItems: "center",
                  width: "100%",
                  boxSizing: "border-box",
                  marginTop: "8px",
                  cursor: "pointer",
                }}
              >
                データを読み込む
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={(event) =>
                    importData(event.target.files?.[0])
                  }
                />
              </label>
            </div>
          </aside>

          <section style={styles.content}>
            {!showNotebook ? (
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.sectionTitle}>
                      {activeCategoryData.icon} {activeCategoryData.title}
                    </h2>
                    <p style={styles.sectionSubtitle}>
                      {activeCategoryData.description}・
                      {visibleItems.length}件表示
                    </p>
                  </div>

                  <button
                    type="button"
                    style={styles.button}
                    onClick={openCreateModal}
                  >
                    ＋ {activeCategoryData.title}を追加
                  </button>
                </div>

                <div style={styles.list}>
                  {visibleItems.length === 0 ? (
                    <div style={styles.empty}>
                      条件に合う項目がありません。
                    </div>
                  ) : (
                    visibleItems.map((item) => {
                      const opened = openItem === item.id;
                      const favorite = favorites.includes(item.id);

                      return (
                        <article key={item.id} style={styles.item}>
                          <button
                            type="button"
                            style={styles.itemButton}
                            onClick={() =>
                              setOpenItem(opened ? null : item.id)
                            }
                          >
                            <div style={styles.itemTop}>
                              <div>
                                <h3 style={styles.itemTitle}>
                                  {item.title}
                                </h3>
                                <span style={styles.group}>
                                  {item.group}
                                  {item.custom ? "・自分で追加" : ""}
                                </span>
                              </div>

                              <span
                                style={{
                                  fontSize: "19px",
                                  color: "#9f3237",
                                }}
                              >
                                {opened ? "−" : "＋"}
                              </span>
                            </div>

                            <p style={styles.summary}>
                              {item.summary}
                            </p>
                          </button>

                          {opened && (
                            <div style={styles.detail}>
                              <p style={styles.detailText}>
                                {item.detail || "詳しい説明は未入力です。"}
                              </p>

                              {item.example && (
                                <div style={styles.example}>
                                  {item.example}
                                </div>
                              )}

                              <h4
                                style={{
                                  margin: "17px 0 8px",
                                  color: "#6d3035",
                                }}
                              >
                                📝 自分のメモ
                              </h4>

                              <textarea
                                style={styles.textarea}
                                value={itemNotes[item.id] ?? ""}
                                onChange={(event) =>
                                  setItemNotes((notes) => ({
                                    ...notes,
                                    [item.id]: event.target.value,
                                  }))
                                }
                                placeholder="授業で聞いたこと、覚え方、模試で出た内容など…"
                              />

                              <div style={styles.miniActions}>
                                <button
                                  type="button"
                                  style={styles.miniButton}
                                  onClick={() => toggleFavorite(item.id)}
                                >
                                  {favorite
                                    ? "★ お気に入り解除"
                                    : "☆ お気に入り"}
                                </button>

                                {item.custom && (
                                  <>
                                    <button
                                      type="button"
                                      style={styles.miniButton}
                                      onClick={() => openEditModal(item)}
                                    >
                                      編集
                                    </button>

                                    <button
                                      type="button"
                                      style={styles.dangerButton}
                                      onClick={() => deleteItem(item.id)}
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
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.sectionTitle}>📒 現代文ノート</h2>
                    <p style={styles.sectionSubtitle}>
                      内容は自動で端末に保存されます。
                    </p>
                  </div>

                  <button
                    type="button"
                    style={styles.button}
                    onClick={addNotebookBlock}
                  >
                    ＋ ノート追加
                  </button>
                </div>

                <div style={styles.notebook}>
                  {notebook.length === 0 ? (
                    <div style={styles.empty}>
                      まだノートがありません。「ノート追加」から作れます。
                    </div>
                  ) : (
                    notebook.map((block) => (
                      <div key={block.id} style={styles.noteCard}>
                        <input
                          style={{
                            ...styles.input,
                            fontWeight: 900,
                            marginBottom: "10px",
                          }}
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
                          style={{ ...styles.textarea, minHeight: "150px" }}
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
                          placeholder="自由に書き込んでください。"
                        />

                        <div style={styles.miniActions}>
                          <button
                            type="button"
                            style={styles.dangerButton}
                            onClick={() =>
                              setNotebook((blocks) =>
                                blocks.filter(
                                  (item) => item.id !== block.id,
                                ),
                              )
                            }
                          >
                            ノートを削除
                          </button>
                        </div>
                      </div>
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
          style={styles.modalBackdrop}
          onMouseDown={() => setModalOpen(false)}
        >
          <form
            style={styles.modal}
            onSubmit={saveItem}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px", color: "#6e242b" }}>
              {editingItem
                ? "項目を編集"
                : `${activeCategoryData.title}を追加`}
            </h2>

            <div style={styles.formGrid}>
              <label style={styles.label}>
                名前 *
                <input
                  style={styles.input}
                  value={form.title}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      title: event.target.value,
                    }))
                  }
                  placeholder="例：にもかかわらず"
                />
              </label>

              <label style={styles.label}>
                分類
                <input
                  style={styles.input}
                  value={form.group}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      group: event.target.value,
                    }))
                  }
                  placeholder="例：逆接"
                />
              </label>

              <label style={styles.label}>
                短い説明 *
                <input
                  style={styles.input}
                  value={form.summary}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      summary: event.target.value,
                    }))
                  }
                  placeholder="一覧に表示する説明"
                />
              </label>

              <label style={styles.label}>
                詳しい説明
                <textarea
                  style={styles.textarea}
                  value={form.detail}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      detail: event.target.value,
                    }))
                  }
                  placeholder="意味・使い方・解き方など"
                />
              </label>

              <label style={styles.label}>
                例・対義語・型
                <textarea
                  style={{ ...styles.textarea, minHeight: "80px" }}
                  value={form.example}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      example: event.target.value,
                    }))
                  }
                  placeholder="例文や覚え方など"
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "9px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                style={styles.softButton}
                onClick={() => setModalOpen(false)}
              >
                キャンセル
              </button>

              <button type="submit" style={styles.button}>
                保存
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}