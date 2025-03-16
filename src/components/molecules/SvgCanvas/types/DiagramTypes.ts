// 図形に関する型定義

// Reactのインポート
import type React from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "./CoordinateTypes";
import type {
	ConnectPointMoveEvent,
	DiagramClickEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramSelectEvent,
	DiagramTransformEvent,
	DiagramTransformStartEvent,
} from "./EventTypes";

// SvgCanvas関連コンポーネントをインポート
import ConnectLine from "../components/connector/ConnectLine";
import Ellipse from "../components/diagram/Ellipse";
import Group from "../components/diagram/Group";
import Path, { PathPoint } from "../components/diagram/Path";
import Rectangle from "../components/diagram/Rectangle";
import Triangle from "../components/diagram/Triangle";

/**
 * 図形の形状
 */
export type Shape = {
	point: Point;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
};

/**
 * 図形の種類
 */
export type DiagramType =
	| "ConnectLine"
	| "ConnectPoint"
	| "Ellipse"
	| "Group"
	| "Path"
	| "PathPoint"
	| "Rectangle"
	| "Triangle";

/**
 * 図形の基本データ
 */
export type DiagramBaseData = {
	id: string;
	type?: DiagramType;
	point: Point;
	isSelected: boolean;
	items?: Diagram[];
};

/**
 * 変形可能な図形のデータ
 */
export type TransformativeData = DiagramBaseData & {
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	keepProportion: boolean;
};

/**
 * 接続線のデータ
 */
export type ConnectLineData = PathData & {};

/**
 * 接続ポイントのデータ
 */
export type ConnectPointData = DiagramBaseData & {
	name: string; // TODO: 今んとこ使ってない
};

/**
 * 楕円のデータ
 */
export type EllipseData = TransformativeData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};

/**
 * 折れ線の頂点のデータ
 */
export type PathPointData = DiagramBaseData & {
	hidden?: boolean;
	pointerEventsDisabled?: boolean;
};

/**
 * 折れ線のデータ
 */
export type PathData = TransformativeData & {
	fill?: string;
	stroke: string;
	strokeWidth: string;
	items: Diagram[];
};

/**
 * グループのデータ
 */
export type GroupData = TransformativeData & {
	items: Diagram[];
};

/**
 * 矩形のデータ
 */
export type RectangleData = TransformativeData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};

/**
 * 三角形のデータ TODO: 三角形いる？
 */
export type TriangleData = TransformativeData & {
	fill: string;
	stroke: string;
	strokeWidth: string;
};

/**
 * ダミー図形コンポーネント
 */
const DummyComponent: React.FC<DiagramBaseData> = () => null;

/**
 * 全図形のデータを統合した型
 */
type DiagramCombined =
	| ConnectLineData
	| ConnectPointData
	| EllipseData
	| GroupData
	| PathData
	| PathPointData
	| RectangleData;

/**
 * 図形の型
 */
export type Diagram = DiagramCombined & {
	type: DiagramType;
};

/**
 * 図形のプロパティ
 */
export type DiagramBaseProps = DiagramBaseData & {
	onDragStart?: (e: DiagramDragEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onSelect?: (e: DiagramSelectEvent) => void;
	onHoverChange?: (e: DiagramHoverEvent) => void;
	onConnect?: (e: DiagramConnectEvent) => void;
};

/**
 * 変形可能な図形のプロパティ
 */
export type TransformativeProps = TransformativeData & {
	onTransformStart?: (e: DiagramTransformStartEvent) => void;
	onTransform?: (e: DiagramTransformEvent) => void;
	onTransformEnd?: (e: DiagramTransformEvent) => void;
};

/**
 * 図形の種類とコンポーネントのマッピング
 */
export const DiagramTypeComponentMap: {
	// biome-ignore lint/suspicious/noExplicitAny: 種々の図形の共通の型を作るのは困難なため
	[key in DiagramType]: React.FC<any>;
} = {
	ConnectLine: ConnectLine,
	ConnectPoint: DummyComponent,
	Ellipse: Ellipse,
	Group: Group,
	Path: Path,
	PathPoint: PathPoint,
	Rectangle: Rectangle,
	Triangle: Triangle,
};
