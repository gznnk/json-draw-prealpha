// 図形に関する型定義

// Reactのインポート
import type React from "react";

// SvgCanvas関連型定義をインポート
import type {
	DiagramClickEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramSelectEvent,
	DiagramTransformEvent,
	ItemableChangeEvent,
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
	x: number;
	y: number;
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
	x: number;
	y: number;
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
export type ConnectableData = {
	connectPoints: ConnectPointData[];
};

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
type DiagramDataOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	bordered?: boolean;
	fillable?: boolean;
};

/**
 * 図形のデータ型を作成する型
 */
type CreateDiagramType<T extends DiagramDataOptions> = DiagramBaseData &
	(T["selectable"] extends true ? SelectableData : object) &
	(T["transformative"] extends true ? TransformativeData : object) &
	(T["itemable"] extends true ? ItemableData : object) &
	(T["connectable"] extends true ? ConnectableData : object) &
	(T["bordered"] extends true ? BorderedData : object) &
	(T["fillable"] extends true ? FillableData : object);

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
	name: string;
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
 * 図形の基本プロパティ
 */
export type DiagramBaseProps = {
	onDragStart?: (e: DiagramDragEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onHover?: (e: DiagramHoverEvent) => void;
};

/**
 * 選択可能な図形のプロパティ
 */
export type SelectableProps = {
	onSelect?: (e: DiagramSelectEvent) => void;
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
 * 子図形を持つ図形のプロパティ
 */
export type ItemableProps = {
	onItemableChange?: (e: ItemableChangeEvent) => void;
};

/**
 * 接続可能な図形のプロパティ
 */
export type ConnectableProps = {
	showConnectPoints?: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
};

/**
 * 図形のプロパティ作成オプション
 */
type DiagramPropsOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	bordered?: boolean;
	fillable?: boolean;
};

/**
 * 図形のデータ型を作成する型
 */
export type CreateDiagramProps<T, U extends DiagramPropsOptions> = Omit<
	T,
	"type"
> &
	DiagramBaseProps &
	(U["selectable"] extends true ? SelectableProps : object) &
	(U["transformative"] extends true ? TransformativeProps : object) &
	(U["itemable"] extends true ? ItemableProps : object) &
	(U["connectable"] extends true ? ConnectableProps : object);

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
