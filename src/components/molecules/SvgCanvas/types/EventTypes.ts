// イベント型定義

import type {
	Diagram,
	DiagramType,
	PathPointData,
	Shape,
} from "./DiagramTypes";

/**
 * イベントの種類
 */
export type EventType = "Start" | "InProgress" | "End";

/**
 * 図形のポインターダウンイベント
 */
export type DiagramPointerEvent = {
	id: string;
};

/**
 * 図形のドラッグイベント
 */
export type DiagramDragEvent = {
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
	id: string;
};

/**
 * 図形のホバーイベント
 */
export type DiagramHoverEvent = {
	id: string;
	isHovered: boolean;
};

/**
 * 図形の選択イベント
 */
export type DiagramSelectEvent = {
	id: string;
	isMultiSelect?: boolean;
};

/**
 * 図形の変形イベント
 */
export type DiagramTransformEvent = {
	id: string;
	eventType: EventType;
	startShape: Shape;
	endShape: Shape;
};

/**
 * 子図形をもつ図形の変更イベント
 */
export type ItemableChangeEvent = {
	eventType: EventType;
	id: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	items?: Diagram[];
};

/**
 * 図形の接続イベント
 */
export type DiagramConnectEvent = {
	startOwnerId: string;
	points: PathPointData[];
	endOwnerId: string;
};

/**
 * 接続ポイント移動データ
 *
 * @param id 移動した接続ポイントID
 * @param x 移動先X座標
 * @param y 移動先Y座標
 */
export type ConnectPointMoveData = {
	id: string;
	x: number;
	y: number;
	ownerId: string;
	ownerShape: Shape;
};

/**
 * 接続ポイント移動イベント
 *
 * @param type イベントタイプ
 * @param ownerId 接続ポイントの所有者ID
 * @param ownerShape 接続ポイントの所有者の形状（接続線の再描画時に利用、接続先側の所有者の形状は接続線コンポーネント内で取得する）
 * @param points 移動した接続ポイントのデータ
 */
export type ConnectPointsMoveEvent = {
	eventType: EventType;
	points: ConnectPointMoveData[];
};
