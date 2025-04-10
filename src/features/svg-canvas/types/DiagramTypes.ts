// 図形に関する型定義

// Reactのインポート
import type React from "react";

// SvgCanvas関連型定義をインポート
import type {
	ConnectPointsMoveEvent,
	DiagramChangeEvent,
	DiagramClickEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramSelectEvent,
	DiagramTextEditEvent,
	DiagramTransformEvent,
} from "./EventTypes";

// SvgCanvas関連コンポーネントをインポート
import ConnectLine from "../components/shapes/ConnectLine/ConnectLine";
import type { ArrowHeadType } from "../components/core/ArrowHead/ArrowHead";
import Ellipse from "../components/shapes/Ellipse/Ellipse";
import Group from "../components/shapes/Group/Group";
import Path, { PathPoint } from "../components/shapes/Path/Path";
import Rectangle from "../components/shapes/Rectangle/Rectangle";
import TextGenerator from "../components/diagrams/TextGenerator/TextGenerator";

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
	| "TextGenerator";

/**
 * 図形の基本データ
 */
export type DiagramBaseData = {
	id: string;
	type: DiagramType;
	x: number;
	y: number;
	syncWithSameId?: boolean; // 永続化されないプロパティ TODO: 永続化されるプロパティと分ける
};

/**
 * 選択可能な図形のデータ
 */
export type SelectableData = {
	isSelected: boolean;
	isMultiSelectSource: boolean; // 複数選択時の選択元かどうか
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
export type StrokableData = {
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
 * Type of textable component.
 */
export type TextableType = "text" | "textarea";

/**
 * テキストの水平位置揃え
 */
export type TextAlign = "left" | "center" | "right";

/**
 * テキストの垂直位置揃え
 */
export type VerticalAlign = "top" | "center" | "bottom";

/**
 * テキストを持つ図形のデータ
 */
export type TextableData = {
	text: string;
	textType: TextableType; // TODO: データにもたなくてもいいかも？
	textAlign: TextAlign;
	verticalAlign: VerticalAlign;
	fontColor: string;
	fontSize: number;
	fontFamily: string;
	isTextEditing: boolean; // 永続化されないプロパティ TODO: 永続化されるプロパティと分ける
};

/**
 * 図形の型作成オプション
 */
type DiagramDataOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	strokable?: boolean;
	fillable?: boolean;
	textable?: boolean;
};

/**
 * 図形のデータ型を作成する型
 */
type CreateDiagramType<T extends DiagramDataOptions> = DiagramBaseData &
	(T["selectable"] extends true ? SelectableData : object) &
	(T["transformative"] extends true ? TransformativeData : object) &
	(T["itemable"] extends true ? ItemableData : object) &
	(T["connectable"] extends true ? ConnectableData : object) &
	(T["strokable"] extends true ? StrokableData : object) &
	(T["fillable"] extends true ? FillableData : object) &
	(T["textable"] extends true ? TextableData : object);

/**
 * 楕円のデータ
 */
export type EllipseData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
	strokable: true;
	fillable: true;
	textable: true;
}>;

/**
 * 矩形のデータ
 */
export type RectangleData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
	strokable: true;
	fillable: true;
	textable: true;
}> & {
	rx: number;
	ry: number;
};

/**
 * 折れ線の頂点のデータ
 */
export type PathPointData = DiagramBaseData & {
	hidden: boolean;
};

/**
 * 折れ線のデータ
 */
export type PathData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	itemable: true;
	strokable: true;
}> & {
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
};

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
	strokable: true;
}> & {
	startOwnerId: string;
	endOwnerId: string;
	autoRouting: boolean;
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
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
 * Data for text generator component.
 */
export type TextGeneratorData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
	strokable: true;
	fillable: true;
	textable: true;
}> & {
	rx: number;
	ry: number;
	text: string;
	fontSize: number;
	color: string;
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
	| RectangleData
	| TextGeneratorData;

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
	onDrag?: (e: DiagramDragEvent) => void;
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
	onTransform?: (e: DiagramTransformEvent) => void;
};

/**
 * Properties of having child diagrams component.
 *
 * @property {function} onDiagramChange - Event handler for diagram change.
 *                                        Trigger this handler when notifying changes in the properties of a diagram.
 */
export type ItemableProps = {
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};

/**
 * Properties of connectable component.
 *
 * @property {boolean} showConnectPoints - Visibility of owned ConnectPoint components.
 *                                         When false, the connectable component must not render ConnectPoint components.
 * @property {function} onConnect        - Event handler for diagram connection.
 *                                         The connectable component must trigger this event when a connection is made.
 */
export type ConnectableProps = {
	showConnectPoints?: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
	onConnectPointsMove?: (e: ConnectPointsMoveEvent) => void;
};

/**
 * Properties of textable component.
 */
export type TextableProps = {
	onTextEdit?: (e: DiagramTextEditEvent) => void;
};

/**
 * 図形のプロパティ作成オプション
 */
type DiagramPropsOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	textable?: boolean;
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
	(U["connectable"] extends true ? ConnectableProps : object) &
	(U["textable"] extends true ? TextableProps : object);

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
	TextGenerator: TextGenerator,
};
