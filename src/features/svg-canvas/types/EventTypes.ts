import type { PathPointData } from "../components/shapes/Path";
import type { Diagram, DiagramType } from "./DiagramCatalog";
import type { Shape } from "./DiagramTypes";

/**
 * イベントの種類
 */
export type EventType = "Start" | "InProgress" | "End" | "Instant";

/**
 * 図形のポインターダウンイベント
 */
export type DiagramPointerEvent = {
	eventId: string;
	id: string;
};

/**
 * 図形のドラッグイベント
 */
export type DiagramDragEvent = {
	eventId: string;
	eventType: EventType;
	id: string;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
};

/**
 * 図形のドラッグドロップイベント
 */
export type DiagramDragDropEvent = {
	eventId: string;
	dropItem: {
		id: string;
		type?: DiagramType;
		x: number;
		y: number;
	};
	dropTargetItem: {
		id: string;
		type?: DiagramType;
		x: number;
		y: number;
	};
};

/**
 * 図形のクリックイベント
 */
export type DiagramClickEvent = {
	eventId: string;
	id: string;
};

/**
 * 図形のホバーイベント
 */
export type DiagramHoverEvent = {
	eventId: string;
	id: string;
	isHovered: boolean;
};

/**
 * 図形の選択イベント
 */
export type DiagramSelectEvent = {
	eventId: string;
	id: string;
	isMultiSelect?: boolean;
};

/**
 * 図形の変形イベント
 */
export type DiagramTransformEvent = {
	eventId: string;
	id: string;
	eventType: EventType;
	startShape: Shape;
	endShape: Shape;
};

/**
 * 図形の変更イベントデータ
 */
export type DiagramChangeData = Partial<Diagram>;

/**
 * The type of diagram change event.
 */
export type DiagramChangeEventType = "Drag" | "Transform" | "Appearance";

/**
 * 図形の変更イベント
 */
export type DiagramChangeEvent = {
	eventId: string;
	eventType: EventType;
	changeType: DiagramChangeEventType;
	id: string;
	startDiagram: DiagramChangeData;
	endDiagram: DiagramChangeData;
};

/**
 * 図形の接続イベント
 */
export type DiagramConnectEvent = {
	eventId: string;
	startOwnerId: string;
	points: PathPointData[];
	endOwnerId: string;
};

/**
 * 接続ポイント移動データ
 *
 * @param id 移動した接続ポイントID
 * @param name 接続ポイント名
 * @param x 移動先X座標
 * @param y 移動先Y座標
 * @param ownerId 接続ポイントの所有者ID
 * @param ownerShape 接続ポイントの所有者の形状（接続線の再描画時に利用、接続先側の所有者の形状は接続線コンポーネント内で取得する）
 */
export type ConnectPointMoveData = {
	id: string;
	name: string;
	x: number;
	y: number;
	ownerId: string;
	ownerShape: Shape;
};

/**
 * 接続ポイント移動イベント
 *
 * @param type イベントタイプ
 * @param points 移動した接続ポイントのデータ
 */
export type ConnectPointsMoveEvent = {
	eventId: string;
	eventType: EventType;
	points: ConnectPointMoveData[];
};

/**
 * 図形のテキスト編集イベント
 */
export type DiagramTextEditEvent = {
	id: string;
};

/**
 * 図形のテキスト変更イベント
 */
export type DiagramTextChangeEvent = {
	eventId: string;
	id: string;
	text: string;
};

/**
 * Event name for SvgCanvas scroll.
 */
export const SVG_CANVAS_SCROLL_EVENT_NAME = "SvgCanvasScrollEvent" as const;

/**
 * Event type for SvgCanvas scroll.
 */
export type SvgCanvasScrollEvent = {
	scrollTop: number;
	scrollLeft: number;
};

/**
 * Event type for SvgCanvas resize.
 */
export type SvgCanvasResizeEvent = {
	minX: number;
	minY: number;
	width: number;
	height: number;
};

/**
 * Event type for new diagram creation.
 */
export type NewDiagramEvent = {
	diagramType: DiagramType;
	x?: number;
	y?: number;
};

export type NewItemEvent = {
	item: Diagram;
	x?: number;
	y?: number;
};

export type StackOrderChangeType =
	| "bringToFront" // 最前面に移動
	| "sendToBack" // 最背面に移動
	| "bringForward" // 前面に移動（1つ前へ）
	| "sendBackward"; // 背面に移動（1つ後ろへ）

export type StackOrderChangeEvent = {
	id: string;
	changeType: StackOrderChangeType;
};

export type ExecuteResult = {
	text: string;
};

export type ExecuteEvent = {
	eventId: string;
	id: string;
	data: ExecuteResult;
};

export const PROPAGATION_EVENT_NAME = "PropagationEvent" as const;

export type PropagationEvent = {
	eventId: string;
	id: string;
	targetId: string[];
	data: ExecuteResult;
};
