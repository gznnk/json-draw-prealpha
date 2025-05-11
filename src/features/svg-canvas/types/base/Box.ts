import type { Point } from "./Point";

/**
 * 矩形の枠の型定義
 */
export type Box = {
	top: number;
	left: number;
	right: number;
	bottom: number;
	center: Point;
	leftTop: Point;
	leftBottom: Point;
	rightTop: Point;
	rightBottom: Point;
};
