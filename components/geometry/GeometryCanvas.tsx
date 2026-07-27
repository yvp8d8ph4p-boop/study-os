"use client";

import {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Tool =
  | "select"
  | "point"
  | "line"
  | "circle"
  | "triangle"
  | "quadrilateral"
  | "free"
  | "text"
  | "eraser";

type Point = {
  x: number;
  y: number;
};

type BaseShape = {
  id: string;
  stroke: string;
  fill: string;
  strokeWidth: number;
  createdAt: number;
};

type PointShape = BaseShape & {
  type: "point";
  point: Point;
};

type LineShape = BaseShape & {
  type: "line";
  start: Point;
  end: Point;
};

type CircleShape = BaseShape & {
  type: "circle";
  center: Point;
  edge: Point;
};

type PolygonShape = BaseShape & {
  type: "triangle" | "quadrilateral";
  points: Point[];
};

type FreeShape = BaseShape & {
  type: "free";
  points: Point[];
};

type TextShape = BaseShape & {
  type: "text";
  point: Point;
  text: string;
  fontSize: number;
};

type Shape =
  | PointShape
  | LineShape
  | CircleShape
  | PolygonShape
  | FreeShape
  | TextShape;

type CanvasState = {
  shapes: Shape[];
};

const STORAGE_KEY = "study-os-geometry-canvas-v1";
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 760;
const GRID_SIZE = 25;
const MAX_HISTORY = 100;

const TOOL_ITEMS: Array<{
  id: Tool;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    id: "select",
    label: "選択",
    icon: "🖱️",
    description: "図形を選択・移動",
  },
  {
    id: "point",
    label: "点",
    icon: "•",
    description: "点を配置",
  },
  {
    id: "line",
    label: "線分",
    icon: "╱",
    description: "始点から終点へ線を引く",
  },
  {
    id: "circle",
    label: "円",
    icon: "○",
    description: "中心から半径を指定",
  },
  {
    id: "triangle",
    label: "三角形",
    icon: "△",
    description: "3点を順に指定",
  },
  {
    id: "quadrilateral",
    label: "四角形",
    icon: "◇",
    description: "4点を順に指定",
  },
  {
    id: "free",
    label: "自由線",
    icon: "✎",
    description: "ドラッグして自由に描く",
  },
  {
    id: "text",
    label: "文字",
    icon: "T",
    description: "クリック位置へ文字を追加",
  },
  {
    id: "eraser",
    label: "消しゴム",
    icon: "⌫",
    description: "触れた図形を削除",
  },
];

const COLORS = [
  "#0f172a",
  "#2563eb",
  "#7c3aed",
  "#dc2626",
  "#ea580c",
  "#16a34a",
  "#0891b2",
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function deepCloneShapes(shapes: Shape[]): Shape[] {
  return JSON.parse(JSON.stringify(shapes)) as Shape[];
}

function snapPoint(point: Point, enabled: boolean): Point {
  if (!enabled) {
    return point;
  }

  return {
    x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
  };
}

function pointToSegmentDistance(
  point: Point,
  segmentStart: Point,
  segmentEnd: Point,
) {
  const vx = segmentEnd.x - segmentStart.x;
  const vy = segmentEnd.y - segmentStart.y;
  const wx = point.x - segmentStart.x;
  const wy = point.y - segmentStart.y;

  const lengthSquared = vx * vx + vy * vy;

  if (lengthSquared === 0) {
    return distance(point, segmentStart);
  }

  const t = clamp((wx * vx + wy * vy) / lengthSquared, 0, 1);
  const projection = {
    x: segmentStart.x + t * vx,
    y: segmentStart.y + t * vy,
  };

  return distance(point, projection);
}

function isPointInsidePolygon(point: Point, polygon: Point[]) {
  let inside = false;

  for (
    let currentIndex = 0, previousIndex = polygon.length - 1;
    currentIndex < polygon.length;
    previousIndex = currentIndex++
  ) {
    const current = polygon[currentIndex];
    const previous = polygon[previousIndex];

    const intersects =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) /
          (previous.y - current.y || 1) +
          current.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function shapeContainsPoint(shape: Shape, point: Point) {
  const tolerance = Math.max(10, shape.strokeWidth * 3);

  switch (shape.type) {
    case "point":
      return distance(shape.point, point) <= tolerance + 5;

    case "line":
      return (
        pointToSegmentDistance(point, shape.start, shape.end) <= tolerance
      );

    case "circle": {
      const radius = distance(shape.center, shape.edge);
      const pointRadius = distance(shape.center, point);
      return Math.abs(pointRadius - radius) <= tolerance;
    }

    case "triangle":
    case "quadrilateral": {
      if (isPointInsidePolygon(point, shape.points)) {
        return true;
      }

      return shape.points.some((polygonPoint, index) => {
        const nextPoint = shape.points[(index + 1) % shape.points.length];
        return (
          pointToSegmentDistance(point, polygonPoint, nextPoint) <=
          tolerance
        );
      });
    }

    case "free":
      return shape.points.some((freePoint, index) => {
        if (index === 0) {
          return distance(freePoint, point) <= tolerance;
        }

        return (
          pointToSegmentDistance(
            point,
            shape.points[index - 1],
            freePoint,
          ) <= tolerance
        );
      });

    case "text": {
      const estimatedWidth = shape.text.length * shape.fontSize * 0.62;
      return (
        point.x >= shape.point.x - tolerance &&
        point.x <= shape.point.x + estimatedWidth + tolerance &&
        point.y >= shape.point.y - shape.fontSize - tolerance &&
        point.y <= shape.point.y + tolerance
      );
    }

    default:
      return false;
  }
}

function translateShape(shape: Shape, deltaX: number, deltaY: number): Shape {
  const movePoint = (point: Point): Point => ({
    x: point.x + deltaX,
    y: point.y + deltaY,
  });

  switch (shape.type) {
    case "point":
      return {
        ...shape,
        point: movePoint(shape.point),
      };

    case "line":
      return {
        ...shape,
        start: movePoint(shape.start),
        end: movePoint(shape.end),
      };

    case "circle":
      return {
        ...shape,
        center: movePoint(shape.center),
        edge: movePoint(shape.edge),
      };

    case "triangle":
    case "quadrilateral":
    case "free":
      return {
        ...shape,
        points: shape.points.map(movePoint),
      };

    case "text":
      return {
        ...shape,
        point: movePoint(shape.point),
      };

    default:
      return shape;
  }
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.save();
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += GRID_SIZE) {
    context.beginPath();
    context.strokeStyle =
      x % (GRID_SIZE * 5) === 0 ? "#cbd5e1" : "#e2e8f0";
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += GRID_SIZE) {
    context.beginPath();
    context.strokeStyle =
      y % (GRID_SIZE * 5) === 0 ? "#cbd5e1" : "#e2e8f0";
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.restore();
}

function drawVertex(
  context: CanvasRenderingContext2D,
  point: Point,
  color: string,
) {
  context.beginPath();
  context.fillStyle = color;
  context.arc(point.x, point.y, 4, 0, Math.PI * 2);
  context.fill();
}

function drawShape(
  context: CanvasRenderingContext2D,
  shape: Shape,
  selected = false,
) {
  context.save();
  context.strokeStyle = shape.stroke;
  context.fillStyle = shape.fill;
  context.lineWidth = shape.strokeWidth;
  context.lineCap = "round";
  context.lineJoin = "round";

  if (selected) {
    context.shadowColor = "#38bdf8";
    context.shadowBlur = 12;
  }

  switch (shape.type) {
    case "point":
      context.beginPath();
      context.fillStyle = shape.stroke;
      context.arc(
        shape.point.x,
        shape.point.y,
        Math.max(5, shape.strokeWidth + 3),
        0,
        Math.PI * 2,
      );
      context.fill();
      break;

    case "line":
      context.beginPath();
      context.moveTo(shape.start.x, shape.start.y);
      context.lineTo(shape.end.x, shape.end.y);
      context.stroke();

      if (selected) {
        drawVertex(context, shape.start, "#0284c7");
        drawVertex(context, shape.end, "#0284c7");
      }
      break;

    case "circle": {
      const radius = distance(shape.center, shape.edge);
      context.beginPath();
      context.arc(
        shape.center.x,
        shape.center.y,
        radius,
        0,
        Math.PI * 2,
      );

      if (shape.fill !== "transparent") {
        context.fill();
      }

      context.stroke();

      if (selected) {
        drawVertex(context, shape.center, "#0284c7");
        drawVertex(context, shape.edge, "#0284c7");
      }
      break;
    }

    case "triangle":
    case "quadrilateral":
      if (shape.points.length > 0) {
        context.beginPath();
        context.moveTo(shape.points[0].x, shape.points[0].y);

        shape.points.slice(1).forEach((point) => {
          context.lineTo(point.x, point.y);
        });

        context.closePath();

        if (shape.fill !== "transparent") {
          context.fill();
        }

        context.stroke();

        if (selected) {
          shape.points.forEach((point) => {
            drawVertex(context, point, "#0284c7");
          });
        }
      }
      break;

    case "free":
      if (shape.points.length > 0) {
        context.beginPath();
        context.moveTo(shape.points[0].x, shape.points[0].y);

        shape.points.slice(1).forEach((point) => {
          context.lineTo(point.x, point.y);
        });

        context.stroke();
      }
      break;

    case "text":
      context.fillStyle = shape.stroke;
      context.font = `800 ${shape.fontSize}px ui-sans-serif, system-ui, sans-serif`;
      context.textBaseline = "alphabetic";
      context.fillText(shape.text, shape.point.x, shape.point.y);

      if (selected) {
        const width = context.measureText(shape.text).width;
        context.strokeStyle = "#0284c7";
        context.lineWidth = 1.5;
        context.setLineDash([5, 4]);
        context.strokeRect(
          shape.point.x - 5,
          shape.point.y - shape.fontSize - 5,
          width + 10,
          shape.fontSize + 10,
        );
      }
      break;
  }

  context.restore();
}

function getShapeLabel(shape: Shape) {
  switch (shape.type) {
    case "point":
      return "点";
    case "line":
      return "線分";
    case "circle":
      return "円";
    case "triangle":
      return "三角形";
    case "quadrilateral":
      return "四角形";
    case "free":
      return "自由線";
    case "text":
      return `文字「${shape.text}」`;
    default:
      return "図形";
  }
}

export default function GeometryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<Tool>("select");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
  const [freeDrawingId, setFreeDrawingId] = useState<string | null>(null);

  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [stroke, setStroke] = useState("#0f172a");
  const [fill, setFill] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(28);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<Shape[] | null>(null);

  const [undoStack, setUndoStack] = useState<CanvasState[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasState[]>([]);
  const [status, setStatus] = useState("準備完了");
  const [hasLoaded, setHasLoaded] = useState(false);

  const selectedShape = useMemo(
    () => shapes.find((shape) => shape.id === selectedId) ?? null,
    [selectedId, shapes],
  );

  const toolDescription = useMemo(
    () =>
      TOOL_ITEMS.find((toolItem) => toolItem.id === tool)?.description ??
      "",
    [tool],
  );

  const pushHistory = useCallback((previousShapes: Shape[]) => {
    setUndoStack((current) => [
      ...current.slice(-(MAX_HISTORY - 1)),
      { shapes: deepCloneShapes(previousShapes) },
    ]);
    setRedoStack([]);
  }, []);

  const commitShapes = useCallback(
    (nextShapes: Shape[], previousShapes = shapes) => {
      pushHistory(previousShapes);
      setShapes(nextShapes);
    },
    [pushHistory, shapes],
  );

  const getCanvasPoint = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return { x: 0, y: 0 };
      }

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const rawPoint = {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };

      return snapPoint(rawPoint, snapEnabled && tool !== "free");
    },
    [snapEnabled, tool],
  );

  const resetDraft = useCallback(() => {
    setDraftPoints([]);
    setPreviewPoint(null);
    setFreeDrawingId(null);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as CanvasState;

        if (Array.isArray(parsed.shapes)) {
          setShapes(parsed.shapes);
          setStatus("保存されたノートを読み込みました");
        }
      }
    } catch {
      setStatus("保存データの読み込みに失敗しました");
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ shapes }),
        );
        setStatus("自動保存しました");
      } catch {
        setStatus("自動保存に失敗しました");
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasLoaded, shapes]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      drawGrid(context, canvas.width, canvas.height);
    }

    shapes.forEach((shape) => {
      drawShape(context, shape, shape.id === selectedId);
    });

    if (previewPoint && draftPoints.length > 0) {
      context.save();
      context.strokeStyle = stroke;
      context.fillStyle = fill;
      context.lineWidth = strokeWidth;
      context.setLineDash([8, 7]);
      context.lineCap = "round";
      context.lineJoin = "round";

      if (tool === "line") {
        context.beginPath();
        context.moveTo(draftPoints[0].x, draftPoints[0].y);
        context.lineTo(previewPoint.x, previewPoint.y);
        context.stroke();
      }

      if (tool === "circle") {
        context.beginPath();
        context.arc(
          draftPoints[0].x,
          draftPoints[0].y,
          distance(draftPoints[0], previewPoint),
          0,
          Math.PI * 2,
        );

        if (fill !== "transparent") {
          context.fill();
        }

        context.stroke();
      }

      if (tool === "triangle" || tool === "quadrilateral") {
        context.beginPath();
        context.moveTo(draftPoints[0].x, draftPoints[0].y);

        draftPoints.slice(1).forEach((point) => {
          context.lineTo(point.x, point.y);
        });

        context.lineTo(previewPoint.x, previewPoint.y);
        context.stroke();

        draftPoints.forEach((point) => {
          drawVertex(context, point, "#0284c7");
        });
      }

      context.restore();
    }
  }, [
    draftPoints,
    fill,
    previewPoint,
    selectedId,
    shapes,
    showGrid,
    stroke,
    strokeWidth,
    tool,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (typing) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }

        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (event.key === "Escape") {
        resetDraft();
        setSelectedId(null);
        setStatus("操作をキャンセルしました");
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedId
      ) {
        event.preventDefault();
        deleteSelectedShape();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const addShape = useCallback(
    (shape: Shape) => {
      commitShapes([...shapes, shape]);
      setSelectedId(shape.id);
    },
    [commitShapes, shapes],
  );

  const completePolygonIfReady = useCallback(
    (nextPoints: Point[]) => {
      const requiredPoints = tool === "triangle" ? 3 : 4;

      if (nextPoints.length < requiredPoints) {
        setDraftPoints(nextPoints);
        setStatus(`${requiredPoints - nextPoints.length}点を追加してください`);
        return;
      }

      const shape: PolygonShape = {
        id: createId(),
        type: tool === "triangle" ? "triangle" : "quadrilateral",
        points: nextPoints,
        stroke,
        fill,
        strokeWidth,
        createdAt: Date.now(),
      };

      addShape(shape);
      resetDraft();
      setStatus(
        tool === "triangle" ? "三角形を追加しました" : "四角形を追加しました",
      );
    },
    [addShape, fill, resetDraft, stroke, strokeWidth, tool],
  );

  const findTopShapeAtPoint = useCallback(
    (point: Point) => {
      for (let index = shapes.length - 1; index >= 0; index -= 1) {
        if (shapeContainsPoint(shapes[index], point)) {
          return shapes[index];
        }
      }

      return null;
    },
    [shapes],
  );

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const point = getCanvasPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "select") {
      const hitShape = findTopShapeAtPoint(point);

      setSelectedId(hitShape?.id ?? null);

      if (hitShape) {
        setDragStart(point);
        setDragSnapshot(deepCloneShapes(shapes));
        setStatus(`${getShapeLabel(hitShape)}を選択しました`);
      } else {
        setStatus("選択を解除しました");
      }

      return;
    }

    if (tool === "eraser") {
      const hitShape = findTopShapeAtPoint(point);

      if (hitShape) {
        commitShapes(
          shapes.filter((shape) => shape.id !== hitShape.id),
        );
        setSelectedId(null);
        setStatus(`${getShapeLabel(hitShape)}を削除しました`);
      }

      return;
    }

    if (tool === "point") {
      addShape({
        id: createId(),
        type: "point",
        point,
        stroke,
        fill: "transparent",
        strokeWidth,
        createdAt: Date.now(),
      });
      setStatus("点を追加しました");
      return;
    }

    if (tool === "text") {
      const text = window.prompt("追加する文字を入力してください");

      if (!text?.trim()) {
        setStatus("文字の追加をキャンセルしました");
        return;
      }

      addShape({
        id: createId(),
        type: "text",
        point,
        text: text.trim(),
        fontSize,
        stroke,
        fill: "transparent",
        strokeWidth,
        createdAt: Date.now(),
      });
      setStatus("文字を追加しました");
      return;
    }

    if (tool === "free") {
      const newShape: FreeShape = {
        id: createId(),
        type: "free",
        points: [point],
        stroke,
        fill: "transparent",
        strokeWidth,
        createdAt: Date.now(),
      };

      pushHistory(shapes);
      setShapes([...shapes, newShape]);
      setFreeDrawingId(newShape.id);
      setSelectedId(newShape.id);
      setStatus("自由線を描画中");
      return;
    }

    if (tool === "line" || tool === "circle") {
      if (draftPoints.length === 0) {
        setDraftPoints([point]);
        setPreviewPoint(point);
        setStatus(
          tool === "line"
            ? "終点をクリックしてください"
            : "円周上の点をクリックしてください",
        );
        return;
      }

      const base: BaseShape = {
        id: createId(),
        stroke,
        fill,
        strokeWidth,
        createdAt: Date.now(),
      };

      if (tool === "line") {
        addShape({
          ...base,
          type: "line",
          start: draftPoints[0],
          end: point,
          fill: "transparent",
        });
        setStatus("線分を追加しました");
      } else {
        addShape({
          ...base,
          type: "circle",
          center: draftPoints[0],
          edge: point,
        });
        setStatus("円を追加しました");
      }

      resetDraft();
      return;
    }

    if (tool === "triangle" || tool === "quadrilateral") {
      completePolygonIfReady([...draftPoints, point]);
    }
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const point = getCanvasPoint(event);

    if (tool === "select" && dragStart && selectedId) {
      const deltaX = point.x - dragStart.x;
      const deltaY = point.y - dragStart.y;

      setShapes((current) =>
        current.map((shape) =>
          shape.id === selectedId
            ? translateShape(shape, deltaX, deltaY)
            : shape,
        ),
      );
      setDragStart(point);
      setStatus("図形を移動中");
      return;
    }

    if (tool === "free" && freeDrawingId) {
      setShapes((current) =>
        current.map((shape) => {
          if (shape.id !== freeDrawingId || shape.type !== "free") {
            return shape;
          }

          const lastPoint = shape.points[shape.points.length - 1];

          if (lastPoint && distance(lastPoint, point) < 2) {
            return shape;
          }

          return {
            ...shape,
            points: [...shape.points, point],
          };
        }),
      );
      return;
    }

    if (
      draftPoints.length > 0 &&
      (tool === "line" ||
        tool === "circle" ||
        tool === "triangle" ||
        tool === "quadrilateral")
    ) {
      setPreviewPoint(point);
    }
  };

  const handlePointerUp = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (tool === "select" && dragStart) {
      if (dragSnapshot) {
        const before = JSON.stringify(dragSnapshot);
        const after = JSON.stringify(shapes);

        if (before !== after) {
          setUndoStack((current) => [
            ...current.slice(-(MAX_HISTORY - 1)),
            { shapes: dragSnapshot },
          ]);
          setRedoStack([]);
        }
      }

      setDragStart(null);
      setDragSnapshot(null);
      setStatus("図形を移動しました");
    }

    if (tool === "free" && freeDrawingId) {
      setFreeDrawingId(null);
      setStatus("自由線を追加しました");
    }
  };

  function handleUndo() {
    setUndoStack((current) => {
      if (current.length === 0) {
        setStatus("元に戻せる操作がありません");
        return current;
      }

      const previousState = current[current.length - 1];

      setRedoStack((redoCurrent) => [
        ...redoCurrent.slice(-(MAX_HISTORY - 1)),
        { shapes: deepCloneShapes(shapes) },
      ]);
      setShapes(deepCloneShapes(previousState.shapes));
      setSelectedId(null);
      resetDraft();
      setStatus("操作を元に戻しました");

      return current.slice(0, -1);
    });
  }

  function handleRedo() {
    setRedoStack((current) => {
      if (current.length === 0) {
        setStatus("やり直せる操作がありません");
        return current;
      }

      const nextState = current[current.length - 1];

      setUndoStack((undoCurrent) => [
        ...undoCurrent.slice(-(MAX_HISTORY - 1)),
        { shapes: deepCloneShapes(shapes) },
      ]);
      setShapes(deepCloneShapes(nextState.shapes));
      setSelectedId(null);
      resetDraft();
      setStatus("操作をやり直しました");

      return current.slice(0, -1);
    });
  }

  function deleteSelectedShape() {
    if (!selectedId) {
      setStatus("削除する図形を選択してください");
      return;
    }

    const selected = shapes.find((shape) => shape.id === selectedId);

    commitShapes(
      shapes.filter((shape) => shape.id !== selectedId),
    );
    setSelectedId(null);
    setStatus(
      selected
        ? `${getShapeLabel(selected)}を削除しました`
        : "図形を削除しました",
    );
  }

  function clearCanvas() {
    if (shapes.length === 0) {
      setStatus("キャンバスは空です");
      return;
    }

    const confirmed = window.confirm(
      "キャンバス上の図形をすべて削除しますか？",
    );

    if (!confirmed) {
      return;
    }

    commitShapes([]);
    setSelectedId(null);
    resetDraft();
    setStatus("キャンバスを空にしました");
  }

  function duplicateSelectedShape() {
    if (!selectedShape) {
      setStatus("複製する図形を選択してください");
      return;
    }

    const duplicated = translateShape(
      {
        ...deepCloneShapes([selectedShape])[0],
        id: createId(),
        createdAt: Date.now(),
      },
      GRID_SIZE,
      GRID_SIZE,
    );

    addShape(duplicated);
    setStatus(`${getShapeLabel(selectedShape)}を複製しました`);
  }

  function bringSelectedToFront() {
    if (!selectedShape) {
      setStatus("前面へ移動する図形を選択してください");
      return;
    }

    const nextShapes = [
      ...shapes.filter((shape) => shape.id !== selectedShape.id),
      selectedShape,
    ];

    commitShapes(nextShapes);
    setStatus("選択した図形を前面へ移動しました");
  }

  function sendSelectedToBack() {
    if (!selectedShape) {
      setStatus("背面へ移動する図形を選択してください");
      return;
    }

    const nextShapes = [
      selectedShape,
      ...shapes.filter((shape) => shape.id !== selectedShape.id),
    ];

    commitShapes(nextShapes);
    setStatus("選択した図形を背面へ移動しました");
  }

  function changeSelectedStyle(
    updates: Partial<Pick<BaseShape, "stroke" | "fill" | "strokeWidth">>,
  ) {
    if (!selectedId) {
      return;
    }

    const previous = deepCloneShapes(shapes);
    const next = shapes.map((shape) =>
      shape.id === selectedId ? { ...shape, ...updates } : shape,
    );

    pushHistory(previous);
    setShapes(next);
  }

  function changeSelectedFontSize(nextFontSize: number) {
    if (!selectedId) {
      return;
    }

    const selected = shapes.find((shape) => shape.id === selectedId);

    if (!selected || selected.type !== "text") {
      return;
    }

    const previous = deepCloneShapes(shapes);
    const next = shapes.map((shape) =>
      shape.id === selectedId && shape.type === "text"
        ? { ...shape, fontSize: nextFontSize }
        : shape,
    );

    pushHistory(previous);
    setShapes(next);
  }

  function exportPng() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    setSelectedId(null);

    window.requestAnimationFrame(() => {
      renderCanvas();

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `study-os-geometry-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      link.click();

      setStatus("PNG画像を書き出しました");
    });
  }

  function handleToolChange(nextTool: Tool) {
    setTool(nextTool);
    setSelectedId(null);
    resetDraft();
    setStatus(
      TOOL_ITEMS.find((item) => item.id === nextTool)?.description ??
        "ツールを変更しました",
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[30px] border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#0f172a] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-cyan-700">
              GEOMETRY CANVAS
            </p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              図形ノート
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-600">
              点・線分・円・多角形・自由線・文字を使って、
              問題の図や証明用の補助図を自由に作れます。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionButton
              label="元に戻す"
              icon="↶"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
            />
            <ActionButton
              label="やり直す"
              icon="↷"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
            />
            <ActionButton
              label="PNG保存"
              icon="⬇"
              onClick={exportPng}
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border-2 border-slate-950 bg-cyan-50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-black">
              現在のツール：{" "}
              {TOOL_ITEMS.find((item) => item.id === tool)?.icon}{" "}
              {TOOL_ITEMS.find((item) => item.id === tool)?.label}
            </p>
            <p className="text-xs font-bold text-slate-600">
              {toolDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)_260px]">
        <aside className="space-y-5">
          <Panel title="作図ツール" icon="🧰">
            <div className="grid grid-cols-2 gap-2">
              {TOOL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToolChange(item.id)}
                  title={item.description}
                  className={`rounded-2xl border-2 border-slate-950 px-3 py-3 text-left transition ${
                    tool === item.id
                      ? "bg-cyan-300 shadow-[3px_3px_0_#0f172a]"
                      : "bg-white hover:bg-cyan-50"
                  }`}
                >
                  <span className="block text-xl font-black">{item.icon}</span>
                  <span className="mt-1 block text-xs font-black">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="表示設定" icon="👁️">
            <div className="space-y-3">
              <ToggleRow
                label="グリッド"
                checked={showGrid}
                onChange={setShowGrid}
              />
              <ToggleRow
                label="スナップ"
                checked={snapEnabled}
                onChange={setSnapEnabled}
              />
            </div>
          </Panel>

          <Panel title="操作" icon="⚙️">
            <div className="grid gap-2">
              <SideButton
                label="選択図形を複製"
                onClick={duplicateSelectedShape}
                disabled={!selectedShape}
              />
              <SideButton
                label="前面へ移動"
                onClick={bringSelectedToFront}
                disabled={!selectedShape}
              />
              <SideButton
                label="背面へ移動"
                onClick={sendSelectedToBack}
                disabled={!selectedShape}
              />
              <SideButton
                label="選択図形を削除"
                onClick={deleteSelectedShape}
                disabled={!selectedShape}
              />
              <SideButton
                label="すべて消去"
                onClick={clearCanvas}
                danger
                disabled={shapes.length === 0}
              />
            </div>
          </Panel>
        </aside>

        <div
          ref={wrapperRef}
          className="min-w-0 overflow-hidden rounded-[30px] border-2 border-slate-950 bg-slate-100 p-3 shadow-[6px_6px_0_#0f172a]"
        >
          <div className="overflow-auto rounded-[22px] border-2 border-slate-950 bg-white">
            <canvas
              ref={canvasRef}
              width={DEFAULT_WIDTH}
              height={DEFAULT_HEIGHT}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={() => {
                if (!freeDrawingId && !dragStart) {
                  setPreviewPoint(null);
                }
              }}
              className={`block h-auto min-w-[760px] max-w-none touch-none bg-white ${
                tool === "select"
                  ? "cursor-default"
                  : tool === "eraser"
                    ? "cursor-not-allowed"
                    : tool === "text"
                      ? "cursor-text"
                      : "cursor-crosshair"
              }`}
              style={{ width: "100%" }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-slate-950 bg-white px-4 py-3">
            <p className="text-xs font-black text-slate-700">
              {status}
            </p>
            <p className="text-xs font-bold text-slate-500">
              図形 {shapes.length}個・自動保存ON
            </p>
          </div>
        </div>

        <aside className="space-y-5">
          <Panel title="線の設定" icon="🎨">
            <div>
              <p className="text-xs font-black text-slate-600">線の色</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`線の色 ${color}`}
                    onClick={() => {
                      setStroke(color);
                      changeSelectedStyle({ stroke: color });
                    }}
                    className={`h-9 w-9 rounded-full border-2 border-slate-950 transition ${
                      stroke === color
                        ? "scale-110 shadow-[2px_2px_0_#0f172a]"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <label className="mt-4 block">
              <span className="flex items-center justify-between text-xs font-black text-slate-600">
                <span>線の太さ</span>
                <span>{strokeWidth}px</span>
              </span>
              <input
                type="range"
                min={1}
                max={12}
                value={strokeWidth}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setStrokeWidth(nextValue);
                  changeSelectedStyle({ strokeWidth: nextValue });
                }}
                className="mt-2 w-full accent-cyan-600"
              />
            </label>
          </Panel>

          <Panel title="塗りつぶし" icon="🪣">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFill("transparent");
                  changeSelectedStyle({ fill: "transparent" });
                }}
                className={`rounded-xl border-2 border-slate-950 px-3 py-2 text-xs font-black ${
                  fill === "transparent" ? "bg-cyan-200" : "bg-white"
                }`}
              >
                なし
              </button>

              {["#dbeafe", "#fef3c7", "#dcfce7", "#fce7f3"].map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setFill(color);
                      changeSelectedStyle({ fill: color });
                    }}
                    className={`h-10 rounded-xl border-2 border-slate-950 ${
                      fill === color
                        ? "shadow-[2px_2px_0_#0f172a]"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`塗りつぶし ${color}`}
                  />
                ),
              )}
            </div>
          </Panel>

          <Panel title="文字設定" icon="T">
            <label className="block">
              <span className="flex items-center justify-between text-xs font-black text-slate-600">
                <span>文字サイズ</span>
                <span>{fontSize}px</span>
              </span>
              <input
                type="range"
                min={14}
                max={64}
                step={2}
                value={fontSize}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setFontSize(nextValue);
                  changeSelectedFontSize(nextValue);
                }}
                className="mt-2 w-full accent-cyan-600"
              />
            </label>
          </Panel>

          <Panel title="選択中" icon="🔎">
            {selectedShape ? (
              <div className="space-y-2">
                <p className="text-sm font-black">
                  {getShapeLabel(selectedShape)}
                </p>
                <p className="break-all text-xs font-bold text-slate-500">
                  {selectedShape.id}
                </p>
                <p className="text-xs font-bold text-slate-600">
                  選択ツールでドラッグすると移動できます。
                </p>
              </div>
            ) : (
              <p className="text-sm font-bold leading-6 text-slate-500">
                選択ツールで図形をクリックすると、ここに情報が表示されます。
              </p>
            )}
          </Panel>
        </aside>
      </div>

      <div className="rounded-[28px] border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
        <h3 className="font-black">⌨️ ショートカット</h3>
        <div className="mt-3 grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <Shortcut keys="Ctrl / ⌘ + Z" label="元に戻す" />
          <Shortcut keys="Ctrl / ⌘ + Y" label="やり直す" />
          <Shortcut keys="Delete" label="選択図形を削除" />
          <Shortcut keys="Esc" label="操作をキャンセル" />
        </div>
      </div>
    </section>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border-2 border-slate-950 bg-white p-4 shadow-[4px_4px_0_#0f172a]">
      <h3 className="font-black">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}

function SideButton({
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border-2 border-slate-950 px-3 py-2 text-left text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "bg-rose-100 hover:bg-rose-200"
          : "bg-white hover:bg-cyan-50"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm font-black">{label}</span>
      <span
        className={`relative h-7 w-12 rounded-full border-2 border-slate-950 transition ${
          checked ? "bg-cyan-300" : "bg-slate-200"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span
          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-white transition ${
            checked ? "left-[23px]" : "left-[2px]"
          }`}
        />
      </span>
    </label>
  );
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2">
      <kbd className="font-black text-slate-950">{keys}</kbd>
      <span className="ml-2">{label}</span>
    </div>
  );
}