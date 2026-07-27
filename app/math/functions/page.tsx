"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type TabType =
  | "guide"
  | "formulas"
  | "graph"
  | "graphNotes"
  | "calculator"
  | "notes";

type FunctionCategory = "比例" | "反比例" | "一次関数" | "二次関数";

type GuideItem = {
  id: number;
  category: FunctionCategory;
  icon: string;
  title: string;
  formula: string;
  explanation: string;
  features: string[];
  example: string;
  method: string[];
  tip: string;
  mistake: string;
};

type FormulaItem = {
  id: number;
  category: FunctionCategory | "共通";
  title: string;
  formula: string;
  explanation: string;
};

type GraphType = "linear" | "quadratic" | "inverse";

type GraphItem = {
  id: string;
  name: string;
  expression: string;
  type: GraphType;
  a: number;
  b: number;
  visible: boolean;
  lineStyle: number;
};

type SavedGraphNote = {
  id: string;
  title: string;
  memo: string;
  graphs: GraphItem[];
  createdAt: string;
};

type CalculatorMode =
  | "value"
  | "linear"
  | "twoPoints"
  | "rate"
  | "inverse"
  | "quadratic";

const STORAGE_KEYS = {
  favorites: "study-os-function-favorites",
  learned: "study-os-function-learned",
  graphs: "study-os-function-graphs",
  graphNotes: "study-os-function-graph-notes",
  note: "study-os-function-note",
};

const guideItems: GuideItem[] = [
  {
    id: 1,
    category: "比例",
    icon: "📏",
    title: "比例",
    formula: "y = ax",
    explanation:
      "xが2倍、3倍になると、yも同じように2倍、3倍になる関係です。aを比例定数といいます。",
    features: [
      "グラフは原点を通る直線",
      "aが正なら右上がり",
      "aが負なら右下がり",
      "y÷xの値が常にaになる",
    ],
    example: "y=3xでx=4なら、y=3×4=12",
    method: [
      "比例定数aを確認する",
      "xの値を式へ代入する",
      "かけ算をしてyを求める",
      "必要なら座標をグラフに取る",
    ],
    tip: "比例は必ず原点を通る。切片は0。",
    mistake: "y=ax+bのbがある式を比例だと思わないようにする。",
  },
  {
    id: 2,
    category: "反比例",
    icon: "🔄",
    title: "反比例",
    formula: "y = a / x",
    explanation:
      "xが2倍、3倍になると、yは1/2倍、1/3倍になる関係です。xyの値が常に一定になります。",
    features: [
      "グラフは双曲線",
      "x=0では値を持たない",
      "aが正なら第1・第3象限",
      "aが負なら第2・第4象限",
    ],
    example: "y=12/xでx=3なら、y=12÷3=4",
    method: [
      "比例定数aを確認する",
      "xの値を分母へ代入する",
      "a÷xを計算する",
      "x=0は使えないことを確認する",
    ],
    tip: "反比例ではxy=a。かけ算すると一定になる。",
    mistake: "x=0を代入しない。0では割れない。",
  },
  {
    id: 3,
    category: "一次関数",
    icon: "📈",
    title: "一次関数",
    formula: "y = ax + b",
    explanation:
      "xが増えたとき、yが一定の割合で増減する関数です。aが傾き、bが切片です。",
    features: [
      "グラフは直線",
      "aは変化の割合",
      "bはy軸との交点",
      "aが0でなければ比例を上下に移動した形",
    ],
    example: "y=2x+1でx=3なら、y=2×3+1=7",
    method: [
      "傾きaと切片bを確認する",
      "切片(0,b)を取る",
      "傾きを使ってもう1点を取る",
      "2点を通る直線を引く",
    ],
    tip: "傾きは『yの増加量÷xの増加量』。",
    mistake: "切片をx軸との交点だと思わない。bはy軸との交点。",
  },
  {
    id: 4,
    category: "二次関数",
    icon: "🪂",
    title: "二次関数",
    formula: "y = ax²",
    explanation:
      "xの2乗に比例する関数です。グラフは原点を頂点とする放物線になります。",
    features: [
      "グラフは放物線",
      "y軸について対称",
      "aが正なら上に開く",
      "aが負なら下に開く",
    ],
    example: "y=2x²でx=-3なら、y=2×9=18",
    method: [
      "xの値を2乗する",
      "その値にaをかける",
      "正負両方のxについて座標を取る",
      "点を滑らかな曲線で結ぶ",
    ],
    tip: "xと-xでは、x²が同じなのでyも同じ。",
    mistake: "負の数を2乗するとき、かっこを付け忘れない。",
  },
];

const formulaItems: FormulaItem[] = [
  {
    id: 1,
    category: "比例",
    title: "比例の式",
    formula: "y = ax",
    explanation: "aは比例定数。xとyの比y/xは一定になります。",
  },
  {
    id: 2,
    category: "比例",
    title: "比例定数",
    formula: "a = y / x",
    explanation: "対応するxとyが分かれば、yをxで割って求めます。",
  },
  {
    id: 3,
    category: "反比例",
    title: "反比例の式",
    formula: "y = a / x",
    explanation: "aは比例定数。x=0では定義されません。",
  },
  {
    id: 4,
    category: "反比例",
    title: "反比例の比例定数",
    formula: "a = xy",
    explanation: "対応するxとyをかけると、比例定数になります。",
  },
  {
    id: 5,
    category: "一次関数",
    title: "一次関数の式",
    formula: "y = ax + b",
    explanation: "aは傾き、bは切片です。",
  },
  {
    id: 6,
    category: "一次関数",
    title: "傾き・変化の割合",
    formula: "a = yの増加量 / xの増加量",
    explanation: "xが増加した量に対して、yがどれだけ増減したかを表します。",
  },
  {
    id: 7,
    category: "一次関数",
    title: "二点から傾きを求める",
    formula: "a = (y₂ - y₁) / (x₂ - x₁)",
    explanation: "異なる二点の座標を使って、直線の傾きを求めます。",
  },
  {
    id: 8,
    category: "一次関数",
    title: "切片を求める",
    formula: "b = y - ax",
    explanation: "傾きaと直線上の一点を式へ代入して求めます。",
  },
  {
    id: 9,
    category: "二次関数",
    title: "二次関数の式",
    formula: "y = ax²",
    explanation: "aの絶対値が大きいほど、放物線の幅が狭くなります。",
  },
  {
    id: 10,
    category: "二次関数",
    title: "二次関数の変化の割合",
    formula: "a(p + q)",
    explanation:
      "y=ax²でxがpからqまで変化するときの変化の割合です。",
  },
  {
    id: 11,
    category: "共通",
    title: "変化の割合",
    formula: "yの増加量 / xの増加量",
    explanation: "xの変化に対して、yがどの程度変化したかを表します。",
  },
  {
    id: 12,
    category: "共通",
    title: "xの増加量",
    formula: "後のx - 前のx",
    explanation: "変化後の値から変化前の値を引きます。",
  },
  {
    id: 13,
    category: "共通",
    title: "yの増加量",
    formula: "後のy - 前のy",
    explanation: "減少する場合は負の数になります。",
  },
  {
    id: 14,
    category: "共通",
    title: "変域",
    formula: "最小値 ≦ x ≦ 最大値",
    explanation: "xやyが取る値の範囲を、不等号を使って表します。",
  },
];

const initialGraphs: GraphItem[] = [
  {
    id: "graph-1",
    name: "グラフ1",
    expression: "y = x",
    type: "linear",
    a: 1,
    b: 0,
    visible: true,
    lineStyle: 0,
  },
];

const graphLineClasses = [
  "stroke-sky-500",
  "stroke-rose-500",
  "stroke-emerald-500",
  "stroke-violet-500",
  "stroke-amber-500",
  "stroke-cyan-600",
];

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatNumber(value: number): string {
  if (Math.abs(value) < 1e-10) return "0";
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(8)));
}

function parseFiniteNumber(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanExpression(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("　", "")
    .replaceAll("×", "*")
    .replaceAll("−", "-")
    .replaceAll("＋", "+")
    .replaceAll("²", "^2");
}

function parseGraphExpression(
  input: string,
): Omit<GraphItem, "id" | "name" | "visible" | "lineStyle"> | null {
  let expression = cleanExpression(input);

  if (expression.startsWith("y=")) {
    expression = expression.slice(2);
  }

  expression = expression.replaceAll("*", "");

  const inverseMatch = expression.match(/^([+-]?\d*\.?\d*)\/x$/);

  if (inverseMatch) {
    const rawA = inverseMatch[1];

    let a = 1;

    if (rawA === "-") a = -1;
    else if (rawA !== "" && rawA !== "+") a = Number(rawA);

    if (!Number.isFinite(a)) return null;

    return {
      expression: `y = ${formatNumber(a)} / x`,
      type: "inverse",
      a,
      b: 0,
    };
  }

  const quadraticMatch = expression.match(
    /^([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d+)?$/,
  );

  if (quadraticMatch) {
    const rawA = quadraticMatch[1];
    const rawB = quadraticMatch[2];

    let a = 1;

    if (rawA === "-") a = -1;
    else if (rawA !== "" && rawA !== "+") a = Number(rawA);

    const b = rawB ? Number(rawB) : 0;

    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

    return {
      expression:
        b === 0
          ? `y = ${formatNumber(a)}x²`
          : `y = ${formatNumber(a)}x² ${b >= 0 ? "+" : "-"} ${formatNumber(
              Math.abs(b),
            )}`,
      type: "quadratic",
      a,
      b,
    };
  }

  if (/^[+-]?\d*\.?\d+$/.test(expression)) {
    const b = Number(expression);

    if (!Number.isFinite(b)) return null;

    return {
      expression: `y = ${formatNumber(b)}`,
      type: "linear",
      a: 0,
      b,
    };
  }

  const linearMatch = expression.match(
    /^([+-]?\d*\.?\d*)x([+-]\d*\.?\d+)?$/,
  );

  if (linearMatch) {
    const rawA = linearMatch[1];
    const rawB = linearMatch[2];

    let a = 1;

    if (rawA === "-") a = -1;
    else if (rawA !== "" && rawA !== "+") a = Number(rawA);

    const b = rawB ? Number(rawB) : 0;

    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

    const formattedB =
      b === 0
        ? ""
        : ` ${b >= 0 ? "+" : "-"} ${formatNumber(Math.abs(b))}`;

    return {
      expression: `y = ${formatNumber(a)}x${formattedB}`,
      type: "linear",
      a,
      b,
    };
  }

  return null;
}

function getGraphY(graph: GraphItem, x: number): number | null {
  if (graph.type === "linear") {
    return graph.a * x + graph.b;
  }

  if (graph.type === "quadratic") {
    return graph.a * x * x + graph.b;
  }

  if (Math.abs(x) < 0.0001) {
    return null;
  }

  return graph.a / x;
}

function makeGraphPath(
  graph: GraphItem,
  width: number,
  height: number,
  scale: number,
  offsetX: number,
  offsetY: number,
): string {
  const parts: string[] = [];
  const step = 2;

  let drawing = false;
  let previousY: number | null = null;

  for (let screenX = 0; screenX <= width; screenX += step) {
    const x = (screenX - width / 2 - offsetX) / scale;
    const y = getGraphY(graph, x);

    if (y === null || !Number.isFinite(y)) {
      drawing = false;
      previousY = null;
      continue;
    }

    const screenY = height / 2 + offsetY - y * scale;

    if (screenY < -height * 3 || screenY > height * 4) {
      drawing = false;
      previousY = null;
      continue;
    }

    const hasLargeJump =
      previousY !== null && Math.abs(screenY - previousY) > height / 2;

    if (!drawing || hasLargeJump) {
      parts.push(`M ${screenX.toFixed(2)} ${screenY.toFixed(2)}`);
      drawing = true;
    } else {
      parts.push(`L ${screenX.toFixed(2)} ${screenY.toFixed(2)}`);
    }

    previousY = screenY;
  }

  return parts.join(" ");
}

function cloneGraphs(graphs: GraphItem[]): GraphItem[] {
  return graphs.map((graph) => ({ ...graph }));
}

export default function FunctionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("guide");

  const [favorites, setFavorites] = useState<number[]>([]);
  const [learned, setLearned] = useState<number[]>([]);

  const [guideFilter, setGuideFilter] = useState<
    "すべて" | FunctionCategory
  >("すべて");

  const [formulaFilter, setFormulaFilter] = useState<
    "すべて" | FunctionCategory | "共通"
  >("すべて");

  const [graphs, setGraphs] = useState<GraphItem[]>(initialGraphs);
  const [graphInput, setGraphInput] = useState("y = 2x + 1");
  const [graphError, setGraphError] = useState("");

  const [graphScale, setGraphScale] = useState(35);
  const [graphOffsetX, setGraphOffsetX] = useState(0);
  const [graphOffsetY, setGraphOffsetY] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);

  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [savedGraphNotes, setSavedGraphNotes] = useState<
    SavedGraphNote[]
  >([]);

  const [graphNoteTitle, setGraphNoteTitle] =
    useState("関数グラフメモ");
  const [graphNoteMemo, setGraphNoteMemo] = useState("");

  const [calculatorMode, setCalculatorMode] =
    useState<CalculatorMode>("value");

  const [calcA, setCalcA] = useState("2");
  const [calcB, setCalcB] = useState("1");
  const [calcX, setCalcX] = useState("3");

  const [pointX1, setPointX1] = useState("1");
  const [pointY1, setPointY1] = useState("3");
  const [pointX2, setPointX2] = useState("4");
  const [pointY2, setPointY2] = useState("9");

  const [calculatorResult, setCalculatorResult] = useState<string[]>([]);

  const [note, setNote] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const graphAreaRef = useRef<SVGSVGElement | null>(null);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const graphWidth = 760;
  const graphHeight = 500;

  useEffect(() => {
    const storedFavorites = localStorage.getItem(STORAGE_KEYS.favorites);
    const storedLearned = localStorage.getItem(STORAGE_KEYS.learned);
    const storedGraphs = localStorage.getItem(STORAGE_KEYS.graphs);
    const storedGraphNotes = localStorage.getItem(
      STORAGE_KEYS.graphNotes,
    );
    const storedNote = localStorage.getItem(STORAGE_KEYS.note);

    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch {
        setFavorites([]);
      }
    }

    if (storedLearned) {
      try {
        setLearned(JSON.parse(storedLearned));
      } catch {
        setLearned([]);
      }
    }

    if (storedGraphs) {
      try {
        const parsed = JSON.parse(storedGraphs) as GraphItem[];

        if (Array.isArray(parsed) && parsed.length > 0) {
          setGraphs(parsed);
        }
      } catch {
        setGraphs(initialGraphs);
      }
    }

    if (storedGraphNotes) {
      try {
        setSavedGraphNotes(JSON.parse(storedGraphNotes));
      } catch {
        setSavedGraphNotes([]);
      }
    }

    if (storedNote) {
      setNote(storedNote);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.favorites,
      JSON.stringify(favorites),
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.learned, JSON.stringify(learned));
  }, [learned]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.graphs, JSON.stringify(graphs));
  }, [graphs]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.graphNotes,
      JSON.stringify(savedGraphNotes),
    );
  }, [savedGraphNotes]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.note, note);

      if (note.trim()) {
        setSaveMessage("保存しました");

        window.setTimeout(() => {
          setSaveMessage("");
        }, 1200);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [note]);

  const filteredGuides = useMemo(() => {
    if (guideFilter === "すべて") return guideItems;

    return guideItems.filter((item) => item.category === guideFilter);
  }, [guideFilter]);

  const filteredFormulas = useMemo(() => {
    if (formulaFilter === "すべて") return formulaItems;

    return formulaItems.filter(
      (item) => item.category === formulaFilter,
    );
  }, [formulaFilter]);

  const graphPaths = useMemo(() => {
    return graphs
      .filter((graph) => graph.visible)
      .map((graph) => ({
        graph,
        path: makeGraphPath(
          graph,
          graphWidth,
          graphHeight,
          graphScale,
          graphOffsetX,
          graphOffsetY,
        ),
      }));
  }, [graphs, graphScale, graphOffsetX, graphOffsetY]);

  const gridLines = useMemo(() => {
    const vertical: number[] = [];
    const horizontal: number[] = [];

    const originX = graphWidth / 2 + graphOffsetX;
    const originY = graphHeight / 2 + graphOffsetY;

    for (
      let x = originX % graphScale;
      x <= graphWidth;
      x += graphScale
    ) {
      vertical.push(x);
    }

    for (
      let y = originY % graphScale;
      y <= graphHeight;
      y += graphScale
    ) {
      horizontal.push(y);
    }

    return { vertical, horizontal };
  }, [graphScale, graphOffsetX, graphOffsetY]);

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function toggleLearned(id: number) {
    setLearned((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function addGraph() {
    const parsed = parseGraphExpression(graphInput);

    if (!parsed) {
      setGraphError(
        "式を読み取れませんでした。例：y=2x+1、y=-x、y=3x²、y=6/x",
      );
      return;
    }

    const nextGraph: GraphItem = {
      ...parsed,
      id: createId("graph"),
      name: `グラフ${graphs.length + 1}`,
      visible: true,
      lineStyle: graphs.length % graphLineClasses.length,
    };

    setGraphs((current) => [...current, nextGraph]);
    setGraphError("");
  }

  function deleteGraph(id: string) {
    setGraphs((current) => current.filter((graph) => graph.id !== id));
  }

  function toggleGraphVisible(id: string) {
    setGraphs((current) =>
      current.map((graph) =>
        graph.id === id
          ? { ...graph, visible: !graph.visible }
          : graph,
      ),
    );
  }

  function resetGraphView() {
    setGraphScale(35);
    setGraphOffsetX(0);
    setGraphOffsetY(0);
    setSelectedPoint(null);
  }

  function handleGraphPointerDown(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    const element = graphAreaRef.current;

    if (!element) return;

    element.setPointerCapture(event.pointerId);

    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: graphOffsetX,
      offsetY: graphOffsetY,
    };
  }

  function handleGraphPointerMove(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    const pointerStart = pointerStartRef.current;

    if (!pointerStart) return;

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;

    setGraphOffsetX(pointerStart.offsetX + deltaX);
    setGraphOffsetY(pointerStart.offsetY + deltaY);
  }

  function handleGraphPointerUp(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    const element = graphAreaRef.current;

    if (element?.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }

    pointerStartRef.current = null;
  }

  function handleGraphClick(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    if (pointerStartRef.current) return;

    const element = graphAreaRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    const ratioX = graphWidth / rect.width;
    const ratioY = graphHeight / rect.height;

    const screenX = (event.clientX - rect.left) * ratioX;
    const screenY = (event.clientY - rect.top) * ratioY;

    const x =
      (screenX - graphWidth / 2 - graphOffsetX) / graphScale;
    const y =
      (graphHeight / 2 + graphOffsetY - screenY) / graphScale;

    setSelectedPoint({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    });
  }

  function saveCurrentGraphNote() {
    const title =
      graphNoteTitle.trim() || `グラフメモ${savedGraphNotes.length + 1}`;

    const newNote: SavedGraphNote = {
      id: createId("graph-note"),
      title,
      memo: graphNoteMemo,
      graphs: cloneGraphs(graphs),
      createdAt: new Date().toLocaleString("ja-JP"),
    };

    setSavedGraphNotes((current) => [newNote, ...current]);
    setGraphNoteMemo("");
  }

  function loadGraphNote(item: SavedGraphNote) {
    setGraphs(cloneGraphs(item.graphs));
    setGraphNoteTitle(item.title);
    setGraphNoteMemo(item.memo);
    setActiveTab("graph");
  }

  function deleteGraphNote(id: string) {
    const shouldDelete = window.confirm(
      "保存したグラフノートを削除しますか？",
    );

    if (!shouldDelete) return;

    setSavedGraphNotes((current) =>
      current.filter((item) => item.id !== id),
    );
  }

  function runCalculator() {
    const a = parseFiniteNumber(calcA);
    const b = parseFiniteNumber(calcB);
    const x = parseFiniteNumber(calcX);

    if (calculatorMode === "value") {
      if (a === null || b === null || x === null) {
        setCalculatorResult(["数字を正しく入力してください。"]);
        return;
      }

      const y = a * x + b;

      setCalculatorResult([
        `y = ${formatNumber(a)}x + ${formatNumber(b)}`,
        `x = ${formatNumber(x)} を代入`,
        `y = ${formatNumber(a)} × ${formatNumber(x)} + ${formatNumber(
          b,
        )}`,
        `答え：y = ${formatNumber(y)}`,
      ]);

      return;
    }

    if (calculatorMode === "linear") {
      if (a === null || b === null) {
        setCalculatorResult(["数字を正しく入力してください。"]);
        return;
      }

      setCalculatorResult([
        `一次関数：y = ${formatNumber(a)}x ${
          b >= 0 ? "+" : "-"
        } ${formatNumber(Math.abs(b))}`,
        `傾き：${formatNumber(a)}`,
        `切片：${formatNumber(b)}`,
        `y軸との交点：(0, ${formatNumber(b)})`,
      ]);

      return;
    }

    if (calculatorMode === "twoPoints") {
      const x1 = parseFiniteNumber(pointX1);
      const y1 = parseFiniteNumber(pointY1);
      const x2 = parseFiniteNumber(pointX2);
      const y2 = parseFiniteNumber(pointY2);

      if (x1 === null || y1 === null || x2 === null || y2 === null) {
        setCalculatorResult(["座標を正しく入力してください。"]);
        return;
      }

      if (x1 === x2) {
        setCalculatorResult([
          "2点のx座標が同じため、y=ax+bの形では表せません。",
        ]);
        return;
      }

      const slope = (y2 - y1) / (x2 - x1);
      const intercept = y1 - slope * x1;

      setCalculatorResult([
        `傾き = (${formatNumber(y2)} - ${formatNumber(
          y1,
        )}) ÷ (${formatNumber(x2)} - ${formatNumber(x1)})`,
        `傾き a = ${formatNumber(slope)}`,
        `切片 b = ${formatNumber(y1)} - ${formatNumber(
          slope,
        )} × ${formatNumber(x1)}`,
        `切片 b = ${formatNumber(intercept)}`,
        `答え：y = ${formatNumber(slope)}x ${
          intercept >= 0 ? "+" : "-"
        } ${formatNumber(Math.abs(intercept))}`,
      ]);

      return;
    }

    if (calculatorMode === "rate") {
      const x1 = parseFiniteNumber(pointX1);
      const y1 = parseFiniteNumber(pointY1);
      const x2 = parseFiniteNumber(pointX2);
      const y2 = parseFiniteNumber(pointY2);

      if (x1 === null || y1 === null || x2 === null || y2 === null) {
        setCalculatorResult(["座標を正しく入力してください。"]);
        return;
      }

      const changeX = x2 - x1;
      const changeY = y2 - y1;

      if (changeX === 0) {
        setCalculatorResult([
          "xの増加量が0なので、変化の割合を求められません。",
        ]);
        return;
      }

      const rate = changeY / changeX;

      setCalculatorResult([
        `xの増加量：${formatNumber(x2)} - ${formatNumber(
          x1,
        )} = ${formatNumber(changeX)}`,
        `yの増加量：${formatNumber(y2)} - ${formatNumber(
          y1,
        )} = ${formatNumber(changeY)}`,
        `変化の割合：${formatNumber(changeY)} ÷ ${formatNumber(
          changeX,
        )}`,
        `答え：${formatNumber(rate)}`,
      ]);

      return;
    }

    if (calculatorMode === "inverse") {
      if (a === null || x === null) {
        setCalculatorResult(["数字を正しく入力してください。"]);
        return;
      }

      if (x === 0) {
        setCalculatorResult(["反比例ではx=0を使えません。"]);
        return;
      }

      const y = a / x;

      setCalculatorResult([
        `y = ${formatNumber(a)} / x`,
        `x = ${formatNumber(x)} を代入`,
        `y = ${formatNumber(a)} ÷ ${formatNumber(x)}`,
        `答え：y = ${formatNumber(y)}`,
      ]);

      return;
    }

    if (a === null || x === null) {
      setCalculatorResult(["数字を正しく入力してください。"]);
      return;
    }

    const y = a * x * x;

    setCalculatorResult([
      `y = ${formatNumber(a)}x²`,
      `x = ${formatNumber(x)} を代入`,
      `y = ${formatNumber(a)} × (${formatNumber(x)})²`,
      `答え：y = ${formatNumber(y)}`,
    ]);
  }

  const tabs: {
    id: TabType;
    label: string;
    icon: string;
  }[] = [
    { id: "guide", label: "解説", icon: "📖" },
    { id: "formulas", label: "公式", icon: "📋" },
    { id: "graph", label: "グラフ", icon: "📈" },
    { id: "graphNotes", label: "グラフノート", icon: "✏️" },
    { id: "calculator", label: "電卓", icon: "🧮" },
    { id: "notes", label: "ノート", icon: "📝" },
  ];

  const categoryButtons: Array<"すべて" | FunctionCategory> = [
    "すべて",
    "比例",
    "反比例",
    "一次関数",
    "二次関数",
  ];

  const formulaCategoryButtons: Array<
    "すべて" | FunctionCategory | "共通"
  > = ["すべて", "比例", "反比例", "一次関数", "二次関数", "共通"];

  return (
    <main className="min-h-screen bg-[#f4fbff] px-4 pb-28 pt-6 text-slate-950">
      <div className="mx-auto w-full max-w-6xl">
        <header className="relative overflow-hidden rounded-[32px] border-2 border-slate-950 bg-white p-6 shadow-[6px_6px_0_#0f172a] sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-200/80" />
          <div className="absolute -bottom-16 left-16 h-36 w-36 rounded-full bg-cyan-100" />

          <div className="relative">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/math"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-sky-100 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-sky-200"
              >
                ← 数学へ
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black transition hover:bg-slate-100"
              >
                🏠 ホーム
              </Link>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-300 text-3xl shadow-[4px_4px_0_#0f172a]">
                📈
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.2em] text-sky-600">
                  MATHEMATICS
                </p>

                <h1 className="text-3xl font-black sm:text-4xl">関数</h1>

                <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-600 sm:text-base">
                  比例・反比例・一次関数・二次関数を、公式とグラフを使って整理できます。
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-[20px] border-2 border-slate-950 p-3 transition ${
                  isActive
                    ? "-translate-y-1 bg-sky-300 shadow-[5px_5px_0_#0f172a]"
                    : "bg-white shadow-[3px_3px_0_#0f172a] hover:-translate-y-1 hover:bg-sky-50"
                }`}
              >
                <span className="block text-2xl">{tab.icon}</span>

                <span className="mt-2 block text-xs font-black sm:text-sm">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </section>

        {activeTab === "guide" && (
          <section className="mt-8">
            <div className="rounded-[26px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
              <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                GUIDE
              </p>

              <h2 className="text-2xl font-black">関数の解説</h2>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                {categoryButtons.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setGuideFilter(category)}
                    className={`shrink-0 rounded-full border-2 border-slate-950 px-4 py-2 text-sm font-black ${
                      guideFilter === category
                        ? "bg-slate-950 text-white"
                        : "bg-white hover:bg-sky-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {filteredGuides.map((item) => {
                const isFavorite = favorites.includes(item.id);
                const isLearned = learned.includes(item.id);

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[28px] border-2 border-slate-950 bg-white shadow-[5px_5px_0_#0f172a]"
                  >
                    <div className="flex items-start justify-between gap-3 border-b-2 border-slate-950 bg-sky-100 p-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.icon}</span>

                        <div>
                          <p className="text-xs font-black text-sky-700">
                            {item.category}
                          </p>

                          <h3 className="text-xl font-black">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(item.id)}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-950 text-xl ${
                          isFavorite ? "bg-yellow-200" : "bg-white"
                        }`}
                      >
                        {isFavorite ? "★" : "☆"}
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="rounded-2xl border-2 border-slate-950 bg-slate-950 p-4 text-center text-xl font-black text-white">
                        {item.formula}
                      </div>

                      <p className="mt-4 text-sm font-bold leading-6 text-slate-700">
                        {item.explanation}
                      </p>

                      <div className="mt-5 rounded-2xl border-2 border-slate-950 bg-[#f4fbff] p-4">
                        <p className="text-xs font-black text-sky-700">
                          主な特徴
                        </p>

                        <div className="mt-3 space-y-2">
                          {item.features.map((feature) => (
                            <p
                              key={feature}
                              className="flex gap-2 text-sm font-bold"
                            >
                              <span>・</span>
                              <span>{feature}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs font-black text-emerald-700">
                          例
                        </p>

                        <p className="mt-1 font-black">{item.example}</p>
                      </div>

                      <div className="mt-5">
                        <p className="text-sm font-black text-sky-700">
                          解き方
                        </p>

                        <div className="mt-3 space-y-3">
                          {item.method.map((step, index) => (
                            <div
                              key={step}
                              className="flex items-start gap-3"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-950 bg-sky-200 text-xs font-black">
                                {index + 1}
                              </span>

                              <p className="pt-0.5 text-sm font-bold">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl bg-yellow-50 p-4">
                        <p className="text-xs font-black text-amber-700">
                          💡 覚え方
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {item.tip}
                        </p>
                      </div>

                      <div className="mt-3 rounded-2xl bg-rose-50 p-4">
                        <p className="text-xs font-black text-rose-700">
                          ⚠️ よくあるミス
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {item.mistake}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleLearned(item.id)}
                        className={`mt-4 w-full rounded-2xl border-2 border-slate-950 px-4 py-3 font-black transition ${
                          isLearned
                            ? "bg-emerald-200"
                            : "bg-white shadow-[3px_3px_0_#0f172a] hover:-translate-y-0.5 hover:bg-emerald-50"
                        }`}
                      >
                        {isLearned ? "✓ 確認済み" : "確認したらチェック"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "formulas" && (
          <section className="mt-8">
            <div className="rounded-[26px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
              <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                FORMULAS
              </p>

              <h2 className="text-2xl font-black">公式・性質</h2>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                {formulaCategoryButtons.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFormulaFilter(category)}
                    className={`shrink-0 rounded-full border-2 border-slate-950 px-4 py-2 text-sm font-black ${
                      formulaFilter === category
                        ? "bg-slate-950 text-white"
                        : "bg-white hover:bg-sky-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFormulas.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[24px] border-2 border-slate-950 bg-white p-5 shadow-[4px_4px_0_#0f172a]"
                >
                  <span className="inline-flex rounded-full border-2 border-slate-950 bg-sky-100 px-3 py-1 text-xs font-black">
                    {item.category}
                  </span>

                  <h3 className="mt-4 text-lg font-black">{item.title}</h3>

                  <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-slate-950 bg-slate-950 p-4 text-center font-black text-white">
                    {item.formula}
                  </div>

                  <p className="mt-4 text-sm font-bold leading-6 text-slate-700">
                    {item.explanation}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "graph" && (
          <section className="mt-8">
            <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
              <div className="space-y-5">
                <div className="rounded-[26px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
                  <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                    GRAPH EDITOR
                  </p>

                  <h2 className="text-2xl font-black">グラフを追加</h2>

                  <label className="mt-5 block">
                    <span className="mb-2 block text-sm font-black">
                      関数の式
                    </span>

                    <input
                      value={graphInput}
                      onChange={(event) => {
                        setGraphInput(event.target.value);
                        setGraphError("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          addGraph();
                        }
                      }}
                      placeholder="y = 2x + 1"
                      className="w-full rounded-2xl border-2 border-slate-950 bg-sky-50 p-4 font-black outline-none"
                    />
                  </label>

                  {graphError && (
                    <p className="mt-3 rounded-xl bg-rose-100 p-3 text-sm font-bold text-rose-700">
                      {graphError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={addGraph}
                    className="mt-4 w-full rounded-2xl border-2 border-slate-950 bg-sky-300 px-4 py-3 font-black shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-1"
                  >
                    ＋ グラフを追加
                  </button>

                  <div className="mt-5 rounded-2xl bg-yellow-50 p-4 text-sm font-bold leading-6">
                    <p className="font-black text-amber-700">入力例</p>
                    <p>・y=x</p>
                    <p>・y=-2x+3</p>
                    <p>・y=0.5x-1</p>
                    <p>・y=2x²</p>
                    <p>・y=6/x</p>
                  </div>
                </div>

                <div className="rounded-[26px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">表示中の式</h3>

                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black">
                      {graphs.length}個
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {graphs.length === 0 && (
                      <p className="rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-500">
                        グラフがありません。
                      </p>
                    )}

                    {graphs.map((graph) => (
                      <div
                        key={graph.id}
                        className="rounded-2xl border-2 border-slate-950 bg-[#f8fcff] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-4 w-4 shrink-0 rounded-full ${
                              [
                                "bg-sky-500",
                                "bg-rose-500",
                                "bg-emerald-500",
                                "bg-violet-500",
                                "bg-amber-500",
                                "bg-cyan-600",
                              ][graph.lineStyle]
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-500">
                              {graph.name}
                            </p>

                            <p className="truncate font-black">
                              {graph.expression}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleGraphVisible(graph.id)}
                            className={`rounded-xl border-2 border-slate-950 px-3 py-2 text-xs font-black ${
                              graph.visible
                                ? "bg-emerald-200"
                                : "bg-slate-200"
                            }`}
                          >
                            {graph.visible ? "表示" : "非表示"}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteGraph(graph.id)}
                            className="rounded-xl border-2 border-slate-950 bg-rose-100 px-3 py-2 text-xs font-black"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border-2 border-slate-950 bg-white p-4 shadow-[6px_6px_0_#0f172a] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                      GRAPH
                    </p>

                    <h2 className="text-2xl font-black">関数グラフ</h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setGraphScale((current) =>
                          Math.min(current + 5, 80),
                        )
                      }
                      className="rounded-xl border-2 border-slate-950 bg-sky-100 px-3 py-2 font-black"
                    >
                      ＋ 拡大
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setGraphScale((current) =>
                          Math.max(current - 5, 15),
                        )
                      }
                      className="rounded-xl border-2 border-slate-950 bg-sky-100 px-3 py-2 font-black"
                    >
                      － 縮小
                    </button>

                    <button
                      type="button"
                      onClick={resetGraphView}
                      className="rounded-xl border-2 border-slate-950 bg-white px-3 py-2 font-black"
                    >
                      リセット
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 rounded-xl border-2 border-slate-950 bg-white px-3 py-2 text-sm font-black">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(event) => setShowGrid(event.target.checked)}
                    />
                    方眼
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border-2 border-slate-950 bg-white px-3 py-2 text-sm font-black">
                    <input
                      type="checkbox"
                      checked={showCoordinates}
                      onChange={(event) =>
                        setShowCoordinates(event.target.checked)
                      }
                    />
                    座標表示
                  </label>

                  <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">
                    ドラッグで移動・タップで座標
                  </p>
                </div>

                <div className="mt-5 overflow-hidden rounded-[22px] border-2 border-slate-950 bg-white">
                  <svg
                    ref={graphAreaRef}
                    viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                    className="aspect-[760/500] w-full touch-none select-none"
                    onPointerDown={handleGraphPointerDown}
                    onPointerMove={handleGraphPointerMove}
                    onPointerUp={handleGraphPointerUp}
                    onPointerCancel={handleGraphPointerUp}
                    onClick={handleGraphClick}
                  >
                    <rect
                      width={graphWidth}
                      height={graphHeight}
                      className="fill-white"
                    />

                    {showGrid &&
                      gridLines.vertical.map((x) => (
                        <line
                          key={`vertical-${x}`}
                          x1={x}
                          y1={0}
                          x2={x}
                          y2={graphHeight}
                          className="stroke-slate-200"
                          strokeWidth={1}
                        />
                      ))}

                    {showGrid &&
                      gridLines.horizontal.map((y) => (
                        <line
                          key={`horizontal-${y}`}
                          x1={0}
                          y1={y}
                          x2={graphWidth}
                          y2={y}
                          className="stroke-slate-200"
                          strokeWidth={1}
                        />
                      ))}

                    <line
                      x1={0}
                      y1={graphHeight / 2 + graphOffsetY}
                      x2={graphWidth}
                      y2={graphHeight / 2 + graphOffsetY}
                      className="stroke-slate-950"
                      strokeWidth={2}
                    />

                    <line
                      x1={graphWidth / 2 + graphOffsetX}
                      y1={0}
                      x2={graphWidth / 2 + graphOffsetX}
                      y2={graphHeight}
                      className="stroke-slate-950"
                      strokeWidth={2}
                    />

                    <text
                      x={graphWidth - 24}
                      y={graphHeight / 2 + graphOffsetY - 10}
                      className="fill-slate-950 text-sm font-black"
                    >
                      x
                    </text>

                    <text
                      x={graphWidth / 2 + graphOffsetX + 10}
                      y={20}
                      className="fill-slate-950 text-sm font-black"
                    >
                      y
                    </text>

                    {showCoordinates &&
                      Array.from({ length: 21 }, (_, index) => index - 10).map(
                        (value) => {
                          if (value === 0) return null;

                          const x =
                            graphWidth / 2 +
                            graphOffsetX +
                            value * graphScale;

                          if (x < 0 || x > graphWidth) return null;

                          return (
                            <g key={`x-label-${value}`}>
                              <line
                                x1={x}
                                y1={graphHeight / 2 + graphOffsetY - 4}
                                x2={x}
                                y2={graphHeight / 2 + graphOffsetY + 4}
                                className="stroke-slate-950"
                              />

                              <text
                                x={x}
                                y={
                                  graphHeight / 2 +
                                  graphOffsetY +
                                  18
                                }
                                textAnchor="middle"
                                className="fill-slate-600 text-[10px] font-bold"
                              >
                                {value}
                              </text>
                            </g>
                          );
                        },
                      )}

                    {showCoordinates &&
                      Array.from({ length: 15 }, (_, index) => index - 7).map(
                        (value) => {
                          if (value === 0) return null;

                          const y =
                            graphHeight / 2 +
                            graphOffsetY -
                            value * graphScale;

                          if (y < 0 || y > graphHeight) return null;

                          return (
                            <g key={`y-label-${value}`}>
                              <line
                                x1={graphWidth / 2 + graphOffsetX - 4}
                                y1={y}
                                x2={graphWidth / 2 + graphOffsetX + 4}
                                y2={y}
                                className="stroke-slate-950"
                              />

                              <text
                                x={
                                  graphWidth / 2 +
                                  graphOffsetX -
                                  10
                                }
                                y={y + 4}
                                textAnchor="end"
                                className="fill-slate-600 text-[10px] font-bold"
                              >
                                {value}
                              </text>
                            </g>
                          );
                        },
                      )}

                    {graphPaths.map(({ graph, path }) => (
                      <path
                        key={graph.id}
                        d={path}
                        fill="none"
                        className={graphLineClasses[graph.lineStyle]}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}

                    {selectedPoint && (
                      <g>
                        <circle
                          cx={
                            graphWidth / 2 +
                            graphOffsetX +
                            selectedPoint.x * graphScale
                          }
                          cy={
                            graphHeight / 2 +
                            graphOffsetY -
                            selectedPoint.y * graphScale
                          }
                          r={6}
                          className="fill-slate-950"
                        />

                        <rect
                          x={
                            graphWidth / 2 +
                            graphOffsetX +
                            selectedPoint.x * graphScale +
                            10
                          }
                          y={
                            graphHeight / 2 +
                            graphOffsetY -
                            selectedPoint.y * graphScale -
                            35
                          }
                          width={105}
                          height={28}
                          rx={8}
                          className="fill-slate-950"
                        />

                        <text
                          x={
                            graphWidth / 2 +
                            graphOffsetX +
                            selectedPoint.x * graphScale +
                            62
                          }
                          y={
                            graphHeight / 2 +
                            graphOffsetY -
                            selectedPoint.y * graphScale -
                            16
                          }
                          textAnchor="middle"
                          className="fill-white text-xs font-black"
                        >
                          ({selectedPoint.x}, {selectedPoint.y})
                        </text>
                      </g>
                    )}
                  </svg>
                </div>

                {selectedPoint && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-slate-950 bg-sky-100 p-4">
                    <p className="font-black">
                      選択した座標：({selectedPoint.x},{" "}
                      {selectedPoint.y})
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedPoint(null)}
                      className="rounded-xl border-2 border-slate-950 bg-white px-3 py-2 text-sm font-black"
                    >
                      座標を消す
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "graphNotes" && (
          <section className="mt-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-[28px] border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#0f172a] sm:p-7">
                <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                  GRAPH NOTE
                </p>

                <h2 className="text-2xl font-black">
                  現在のグラフを保存
                </h2>

                <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                  グラフ一覧とメモをセットで端末に保存します。
                </p>

                <label className="mt-6 block">
                  <span className="mb-2 block text-sm font-black">
                    タイトル
                  </span>

                  <input
                    value={graphNoteTitle}
                    onChange={(event) =>
                      setGraphNoteTitle(event.target.value)
                    }
                    className="w-full rounded-2xl border-2 border-slate-950 bg-sky-50 p-4 font-black outline-none"
                    placeholder="例：一次関数の比較"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-black">
                    メモ
                  </span>

                  <textarea
                    value={graphNoteMemo}
                    onChange={(event) =>
                      setGraphNoteMemo(event.target.value)
                    }
                    className="min-h-64 w-full resize-y rounded-2xl border-2 border-slate-950 bg-[#fbfdff] p-4 font-bold leading-7 outline-none"
                    placeholder={`例：
・y=2x+1はy=xより傾きが大きい
・切片が1なので(0,1)を通る
・2本の直線の交点を確認する`}
                  />
                </label>

                <div className="mt-4 rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm font-black">
                    保存するグラフ：{graphs.length}個
                  </p>

                  <div className="mt-2 space-y-1">
                    {graphs.map((graph) => (
                      <p
                        key={graph.id}
                        className="text-sm font-bold text-slate-600"
                      >
                        ・{graph.expression}
                      </p>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveCurrentGraphNote}
                  disabled={graphs.length === 0}
                  className="mt-5 w-full rounded-2xl border-2 border-slate-950 bg-sky-300 px-5 py-4 text-lg font-black shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  グラフノートを保存
                </button>
              </div>

              <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                      SAVED NOTES
                    </p>

                    <h2 className="text-2xl font-black">
                      保存したグラフノート
                    </h2>
                  </div>

                  <span className="rounded-full border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black">
                    {savedGraphNotes.length}件
                  </span>
                </div>

                <div className="mt-5 space-y-5">
                  {savedGraphNotes.length === 0 && (
                    <div className="rounded-[26px] border-2 border-dashed border-slate-400 bg-white p-10 text-center">
                      <p className="text-4xl">✏️</p>

                      <h3 className="mt-3 text-xl font-black">
                        保存したノートはありません
                      </h3>

                      <p className="mt-2 text-sm font-bold text-slate-600">
                        現在のグラフとメモを保存すると、ここに表示されます。
                      </p>
                    </div>
                  )}

                  {savedGraphNotes.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[26px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black text-slate-500">
                            {item.createdAt}
                          </p>

                          <h3 className="mt-1 text-xl font-black">
                            {item.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteGraphNote(item.id)}
                          className="rounded-xl border-2 border-slate-950 bg-rose-100 px-3 py-2 text-sm font-black"
                        >
                          削除
                        </button>
                      </div>

                      <div className="mt-4 rounded-2xl bg-sky-50 p-4">
                        <p className="text-xs font-black text-sky-700">
                          保存された式
                        </p>

                        <div className="mt-2 space-y-1">
                          {item.graphs.map((graph) => (
                            <p
                              key={graph.id}
                              className="font-black"
                            >
                              {graph.expression}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-100 p-4 text-sm font-bold leading-7 text-slate-700">
                        {item.memo || "メモはありません。"}
                      </div>

                      <button
                        type="button"
                        onClick={() => loadGraphNote(item)}
                        className="mt-4 w-full rounded-2xl border-2 border-slate-950 bg-white px-4 py-3 font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-sky-100"
                      >
                        このグラフを開く
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "calculator" && (
          <section className="mt-8">
            <div className="mx-auto max-w-3xl rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[7px_7px_0_#0f172a] sm:p-7">
              <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                FUNCTION CALCULATOR
              </p>

              <h2 className="text-2xl font-black">関数電卓</h2>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["value", "y値"],
                  ["linear", "傾き・切片"],
                  ["twoPoints", "二点から式"],
                  ["rate", "変化の割合"],
                  ["inverse", "反比例"],
                  ["quadratic", "二次関数"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setCalculatorMode(id as CalculatorMode);
                      setCalculatorResult([]);
                    }}
                    className={`rounded-2xl border-2 border-slate-950 p-3 text-sm font-black ${
                      calculatorMode === id
                        ? "bg-sky-300 shadow-[4px_4px_0_#0f172a]"
                        : "bg-white hover:bg-sky-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {(calculatorMode === "value" ||
                calculatorMode === "linear") && (
                <div className="mt-6">
                  <p className="font-black">一次関数 y=ax+b</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <NumberInput
                      label="傾き a"
                      value={calcA}
                      onChange={setCalcA}
                    />

                    <NumberInput
                      label="切片 b"
                      value={calcB}
                      onChange={setCalcB}
                    />

                    {calculatorMode === "value" && (
                      <NumberInput
                        label="xの値"
                        value={calcX}
                        onChange={setCalcX}
                      />
                    )}
                  </div>
                </div>
              )}

              {(calculatorMode === "twoPoints" ||
                calculatorMode === "rate") && (
                <div className="mt-6">
                  <p className="font-black">二点の座標</p>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <NumberInput
                      label="x₁"
                      value={pointX1}
                      onChange={setPointX1}
                    />

                    <NumberInput
                      label="y₁"
                      value={pointY1}
                      onChange={setPointY1}
                    />

                    <NumberInput
                      label="x₂"
                      value={pointX2}
                      onChange={setPointX2}
                    />

                    <NumberInput
                      label="y₂"
                      value={pointY2}
                      onChange={setPointY2}
                    />
                  </div>
                </div>
              )}

              {calculatorMode === "inverse" && (
                <div className="mt-6">
                  <p className="font-black">反比例 y=a/x</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <NumberInput
                      label="比例定数 a"
                      value={calcA}
                      onChange={setCalcA}
                    />

                    <NumberInput
                      label="xの値"
                      value={calcX}
                      onChange={setCalcX}
                    />
                  </div>
                </div>
              )}

              {calculatorMode === "quadratic" && (
                <div className="mt-6">
                  <p className="font-black">二次関数 y=ax²</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <NumberInput
                      label="係数 a"
                      value={calcA}
                      onChange={setCalcA}
                    />

                    <NumberInput
                      label="xの値"
                      value={calcX}
                      onChange={setCalcX}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={runCalculator}
                className="mt-6 w-full rounded-2xl border-2 border-slate-950 bg-sky-300 px-5 py-4 text-lg font-black shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-1"
              >
                計算する
              </button>

              <div className="mt-6 min-h-40 rounded-[24px] border-2 border-slate-950 bg-slate-950 p-5 text-white">
                {calculatorResult.length === 0 ? (
                  <p className="font-bold text-slate-400">
                    数値を入力して「計算する」を押してください。
                  </p>
                ) : (
                  <div className="space-y-2">
                    {calculatorResult.map((line, index) => (
                      <p
                        key={`${line}-${index}`}
                        className={
                          index === calculatorResult.length - 1
                            ? "text-xl font-black text-sky-300"
                            : "font-bold"
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "notes" && (
          <section className="mt-8">
            <div className="rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#0f172a] sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-black tracking-[0.16em] text-sky-600">
                    NOTEBOOK
                  </p>

                  <h2 className="text-2xl font-black">関数ノート</h2>

                  <p className="mt-2 text-sm font-bold text-slate-600">
                    公式・グラフの特徴・間違えた原因を自由に記録できます。
                  </p>
                </div>

                <p className="text-sm font-black text-emerald-600">
                  {saveMessage && `✓ ${saveMessage}`}
                </p>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={`例：
・比例は原点を通る
・一次関数の傾き＝yの増加量÷xの増加量
・反比例ではx=0を使えない
・y=ax²はy軸について対称`}
                className="mt-6 min-h-[430px] w-full resize-y rounded-[24px] border-2 border-slate-950 bg-[#fbfdff] p-5 font-bold leading-8 outline-none focus:bg-sky-50"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-500">
                  入力内容はこの端末に自動保存されます。
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const shouldDelete = window.confirm(
                      "関数ノートをすべて消しますか？",
                    );

                    if (shouldDelete) {
                      setNote("");
                      localStorage.removeItem(STORAGE_KEYS.note);
                    }
                  }}
                  className="rounded-xl border-2 border-slate-950 bg-rose-100 px-4 py-2 text-sm font-black hover:bg-rose-200"
                >
                  ノートを消去
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-[28px] border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[6px_6px_0_#7dd3fc]">
          <p className="text-sm font-black tracking-[0.18em] text-sky-300">
            STUDY POINT
          </p>

          <h2 className="mt-2 text-xl font-black">
            関数は、式・表・グラフを同じものとして見る。
          </h2>

          <p className="mt-2 text-sm font-bold leading-6 text-slate-300">
            式だけで覚えず、xとyの対応、グラフの形、傾きや切片をセットで確認すると理解しやすくなります。
          </p>
        </section>
      </div>
    </main>
  );
}

type NumberInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function NumberInput({
  label,
  value,
  onChange,
}: NumberInputProps) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black">{label}</span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        className="w-full rounded-2xl border-2 border-slate-950 bg-sky-50 p-3 text-center font-black outline-none"
      />
    </label>
  );
}