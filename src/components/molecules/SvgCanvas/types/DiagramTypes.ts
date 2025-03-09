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
	DiagramTransformStartEvent,
	DiagramTransformEvent,
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
	isSelected: boolean;
	items?: Diagram[];
};

export type TransformativeData = DiagramBaseData & {
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	keepProportion: boolean;
};

export type ConnectPointData = DiagramBaseData & {
	name: string;
};

export type EllipseData = TransformativeData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};
export type LinePointData = DiagramBaseData;
export type LineData = DiagramBaseData & {
	fill?: string;
	stroke: string;
	strokeWidth: string;
	items: Diagram[];
};
export type GroupData = TransformativeData & {
	items: Diagram[];
};
export type RectangleData = TransformativeData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};

const DummyComponent: React.FC<DiagramBaseData> = () => null;

type DiagramCombined =
	| ConnectPointData
	| EllipseData
	| GroupData
	| LineData
	| LinePointData
	| RectangleData;

export type Diagram = DiagramCombined & {
	type: DiagramType;
};

// TODO: 整理
export type DiagramBaseProps = DiagramBaseData & {
	onTransformStart?: (e: DiagramTransformStartEvent) => void;
	onTransform?: (e: DiagramTransformEvent) => void;
	onTransformEnd?: (e: DiagramTransformEvent) => void;
	// --------------------------------------------------
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

export type TransformativeProps = TransformativeData & {
	onTransformStart?: (e: DiagramTransformStartEvent) => void; // TODO: 必須にする
	onTransform: (e: DiagramTransformEvent) => void;
	onTransformEnd?: (e: DiagramTransformEvent) => void; // TODO: 必須にする
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
