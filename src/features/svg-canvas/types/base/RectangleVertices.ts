import type { Point } from "./Point";

/**
 * 矩形の頂点の型定義
 */
export type RectangleVertices = {
	leftTopPoint: Point;
	leftBottomPoint: Point;
	rightTopPoint: Point;
	rightBottomPoint: Point;
	topCenterPoint: Point;
	leftCenterPoint: Point;
	rightCenterPoint: Point;
	bottomCenterPoint: Point;
};
