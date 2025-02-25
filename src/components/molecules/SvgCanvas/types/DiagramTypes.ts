// 図形に関する型定義

// SvgCanvas関連型定義をインポート
import type { Point } from "./CoordinateTypes";
import type {
	DiagramClickEvent,
	DiagramDragEvent,
	DiagramResizeEvent,
	DiagramSelectEvent,
	GroupDragEvent,
	GroupResizeEvent,
} from "./EventTypes";

// SvgCanvas関連コンポーネントをインポート
import Ellipse from "../components/diagram/Ellipse";
import Group from "../components/diagram/Group";
import Line from "../components/diagram/Line";
import Rectangle from "../components/diagram/Rectangle";

/**
 * 図形の種類
 */
export type DiagramType = "ellipse" | "group" | "line" | "rectangle";

export type DiagramBaseData = {
	id: string;
	point: Point;
	width: number;
	height: number;
	keepProportion: boolean;
	isSelected: boolean;
};

export type EllipseData = DiagramBaseData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};
export type LineData = DiagramBaseData & {
	startPoint: Point;
	endPoint: Point;
	stroke: string;
	strokeWidth: string;
};
export type GroupData = DiagramBaseData & {
	items: Diagram[];
};
export type RectangleData = DiagramBaseData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};

type DiagramCombined = EllipseData | GroupData | LineData | RectangleData;

export type Diagram = DiagramCombined & {
	type: DiagramType;
};

export type DiagramBaseProps = DiagramBaseData & {
	onDiagramClick?: (e: DiagramClickEvent) => void;
	onDiagramDragStart?: (e: DiagramDragEvent) => void;
	onDiagramDrag?: (e: DiagramDragEvent) => void;
	onDiagramDragEnd?: (e: DiagramDragEvent) => void;
	onDiagramDragEndByGroup?: (e: DiagramDragEvent) => void;
	onDiagramResizeStart?: (e: DiagramResizeEvent) => void;
	onDiagramResizing?: (e: DiagramResizeEvent) => void;
	onDiagramResizeEnd?: (e: DiagramResizeEvent) => void;
	onDiagramSelect?: (e: DiagramSelectEvent) => void;
	ref?: React.Ref<DiagramRef>;
};

/**
 * グループ内の図形への参照
 */
export type DiagramRef = {
	onGroupDrag?: (e: GroupDragEvent) => void;
	onGroupDragEnd?: (e: GroupDragEvent) => void;
	onGroupResize?: (e: GroupResizeEvent) => void;
	onGroupResizeEnd?: (e: GroupResizeEvent) => void;
};

/**
 * 図形の種類とコンポーネントのマッピング
 */
export const DiagramTypeComponentMap: {
	// biome-ignore lint/suspicious/noExplicitAny: 種々の図形の共通の型を作るのは困難なため
	[key in DiagramType]: React.FC<any>;
} = {
	ellipse: Ellipse,
	group: Group,
	line: Line,
	rectangle: Rectangle,
};
