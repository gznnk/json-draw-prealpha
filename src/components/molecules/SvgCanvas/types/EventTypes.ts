// イベント型定義

import type { Point } from "./CoordinateTypes";
import type { DiagramType } from "./DiagramTypes";

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
 * 図形のリサイズイベント
 */
export type DiagramResizeEvent = {
	id: string;
	point: Point;
	width: number;
	height: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
};

export type DiagramRotateEvent = {
	id: string;
	rotation: number;
};

/**
 * グループのドラッグイベント
 */
export type GroupDragEvent = {
	id: string;
	startPoint: Point;
	endPoint: Point;
};

/**
 * グループのリサイズイベント
 */
export type GroupResizeEvent = {
	id: string;
	startSize: {
		point: Point;
		width: number;
		height: number;
	};
	endSize: {
		point: Point;
		width: number;
		height: number;
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
	startPoint: {
		id: string;
		// diagramId: string;
	};
	endPoint: {
		id: string;
		// diagramId: string;
	};
};

export type ConnectPointMoveEvent = {
	id: string;
	point: Point;
};
