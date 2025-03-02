// 図形に関する型定義

// Reactのインポート
import type React from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "./CoordinateTypes";
import type {
	DiagramClickEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramResizeEvent,
	DiagramRotateEvent,
	DiagramSelectEvent,
	GroupDragEvent,
	GroupResizeEvent,
	ConnectPointMoveEvent,
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
	| "ConnectPoint"
	| "Ellipse"
	| "Group"
	| "Line"
	| "LinePoint"
	| "Rectangle";

export type DiagramBaseData = {
	id: string;
	type?: DiagramType;
	point: Point;
	width: number; // TODO: 場所
	height: number; // TODO: 場所
	rotation?: number; // TODO: 場所
	keepProportion: boolean;
	isSelected: boolean;
	items?: Diagram[];
};

export type ConnectPointData = DiagramBaseData & {
	name: string;
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
	items: Diagram[]; // TODO いらない？
};
export type RectangleData = DiagramBaseData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};

export type RectangleBaseData = DiagramBaseData & {
	scaleX: number;
	scaleY: number;
	rotation: number; // in radians
	translation: Point;
};

const DummyComponent: React.FC<DiagramBaseData> = () => null;

type DiagramCombined =
	| ConnectPointData
	| EllipseData
	| GroupData
	| LineData
	| LinePointData
	| RectangleData
	| RectangleBaseData;

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
	onDiagramRotating?: (e: DiagramRotateEvent) => void;
	onDiagramRotateEnd?: (e: DiagramRotateEvent) => void;
	onDiagramSelect?: (e: DiagramSelectEvent) => void;
	onDiagramHoverChange?: (e: DiagramHoverEvent) => void;
	onDiagramConnect?: (e: DiagramConnectEvent) => void;
	onConnectPointMove?: (e: ConnectPointMoveEvent) => void;
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
	ConnectPoint: DummyComponent,
	Ellipse: Ellipse,
	Group: Group,
	Line: Line,
	LinePoint: DummyComponent,
	Rectangle: Rectangle,
};
