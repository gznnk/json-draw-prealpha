// イベント型定義

import type { Point } from "./CoordinateTypes";
import type {
	Diagram,
	DiagramType,
	PathPointData,
	Shape,
} from "./DiagramTypes";

/**
 * 図形の変形イベント
 */
export type DiagramTransformEvent = {
	id: string;
	// type: "transformStart" | "transform" | "transformEnd";
	startShape: Shape;
	endShape: Shape;
};

// TODO: なんかいい名前
export type GroupDataChangeEvent = {
	id: string;
	point?: Point;
	width?: number;
	height?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	items?: Diagram[];
};

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
	id: string;
	type: "dragStart" | "drag" | "dragEnd";
	startPoint: Point;
	endPoint: Point;
};

/**
 * 図形のドラッグドロップイベント
 */
export type DiagramDragDropEvent = {
	dropItem: {
		id: string;
		type?: DiagramType;
		point: Point;
	};
	dropTargetItem: {
		id: string;
		type?: DiagramType;
		point: Point;
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

export type DiagramConnectEvent = {
	points: PathPointData[];
};

export type ConnectPointMoveEvent = {
	id: string;
	type: "moveStart" | "move" | "moveEnd";
	point: Point;
};
