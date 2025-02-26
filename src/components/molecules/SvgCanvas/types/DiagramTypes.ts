// 図形に関する型定義

// Reactのインポート
import type React from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "./CoordinateTypes";
import type {
	DiagramClickEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
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
export type DiagramType =
	| "connectPoint"
	| "ellipse"
	| "group"
	| "line"
	| "linePoint"
	| "rectangle";

export type DiagramBaseData = {
	id: string;
	type?: DiagramType;
	point: Point;
	width: number;
	height: number;
	keepProportion: boolean;
	isSelected: boolean;
	connectPoints?: ConnectPointData[];
};

export type ConnectPointData = {
	id: string;
	diagramId: string;
	point: Point;
	connectLineId?: string;
};

export type EllipseData = DiagramBaseData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};
export type LinePointData = DiagramBaseData;
export type LineData = GroupData & {
	fill?: string;
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
const DummyComponent: React.FC<DiagramBaseData> = () => null;

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
	onDiagramDrop?: (e: DiagramDragDropEvent) => void;
	onDiagramResizeStart?: (e: DiagramResizeEvent) => void;
	onDiagramResizing?: (e: DiagramResizeEvent) => void;
	onDiagramResizeEnd?: (e: DiagramResizeEvent) => void;
	onDiagramSelect?: (e: DiagramSelectEvent) => void;
	onDiagramHoverChange?: (e: DiagramHoverEvent) => void;
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
	connectPoint: DummyComponent,
	ellipse: Ellipse,
	group: Group,
	line: Line,
	linePoint: DummyComponent,
	rectangle: Rectangle,
};
