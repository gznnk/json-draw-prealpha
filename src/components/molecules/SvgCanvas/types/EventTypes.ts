// イベント型定義

import type { Point } from "./CoordinateTypes";

export type PointerDownEvent = {
	id?: string;
	point: Point;
	reactEvent?: React.PointerEvent<SVGElement>;
};

/**
 * 図形のドラッグイベント
 */
export type DiagramDragEvent = {
	id?: string;
	point: Point;
	reactEvent?: React.PointerEvent<SVGElement>;
};

/**
 * 図形の変更イベント
 */
export type DiagramChangeEvent = {
	id?: string;
	point: Point;
	width?: number;
	height?: number;
};

/**
 * 親図形のリサイズイベント
 */
export type ParentDiagramResizeEvent = {
	scaleX: number;
	scaleY: number;
};

export type ItemSelectEvent = {
	id?: string;
};
