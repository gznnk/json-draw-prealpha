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
	DiagramSelectEvent,
	DiagramTransformEvent,
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
	type: DiagramType;
	point: Point;
};

/**
 * 選択可能な図形のデータ
 */
export type SelectableData = {
	isSelected: boolean;
};

/**
 * 変形可能な図形のデータ
 */
export type TransformativeData = Shape & {
	keepProportion: boolean;
};

/**
 * 子図形をもつ図形のデータ
 */
export type ItemableData = {
	items: Diagram[];
};

/**
 * 接続可能な図形のデータ
 */
export type ConnectableData = ItemableData; // 接続ポイントを子図形としてもつ

/**
 * 枠線を持つ図形のデータ
 */
export type BorderedData = {
	stroke: string;
	strokeWidth: string;
};

/**
 * 塗り潰しできる図形のデータ
 */
export type FillableData = {
	fill: string;
};

/**
 * 図形の型作成オプション
 */
type DiagramOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	bordered?: boolean;
	fillable?: boolean;
};

/**
 * 空の型
 */
type Empty = object;

/**
 * 図形のデータ型を作成する型
 */
type CreateDiagramType<T extends DiagramOptions> = DiagramBaseData &
	(T["selectable"] extends true ? SelectableData : Empty) &
	(T["transformative"] extends true ? TransformativeData : Empty) &
	(T["itemable"] extends true ? ItemableData : Empty) &
	(T["connectable"] extends true ? ConnectableData : Empty) &
	(T["bordered"] extends true ? BorderedData : Empty) &
	(T["fillable"] extends true ? FillableData : Empty);

/**
 * 楕円のデータ
 */
export type EllipseData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
	bordered: true;
	fillable: true;
}>;

/**
 * 矩形のデータ
 */
export type RectangleData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
	bordered: true;
	fillable: true;
}>;

/**
 * 折れ線の頂点のデータ
 */
export type PathPointData = DiagramBaseData & {
	hidden: boolean;
	pointerEventsDisabled: boolean;
};

/**
 * 折れ線のデータ
 */
export type PathData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	itemable: true;
	bordered: true;
}>;

/**
 * 接続ポイントのデータ
 */
export type ConnectPointData = DiagramBaseData & {
	name: string; // TODO: 今んとこ使ってない
};

/**
 * 接続線のデータ
 */
export type ConnectLineData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	itemable: true;
	bordered: true;
}> & {
	startOwnerId: string;
	endOwnerId: string;
};

/**
 * グループのデータ
 */
export type GroupData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	itemable: true;
}>;

/**
 * 三角形のデータ TODO: 三角形いる？
 */
export type TriangleData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
	bordered: true;
	fillable: true;
}>;

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
export type DiagramBaseProps = {
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
export type TransformativeProps = {
	onTransformStart?: (e: DiagramTransformEvent) => void;
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
