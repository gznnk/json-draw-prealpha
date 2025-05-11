import type { Point } from "./Point";

/**
 * 楕円の頂点の型定義
 */
export type EllipseVertices = {
	leftTopPoint: Point;
	leftBottomPoint: Point;
	rightTopPoint: Point;
	rightBottomPoint: Point;
	topCenterPoint: Point;
	leftCenterPoint: Point;
	rightCenterPoint: Point;
	bottomCenterPoint: Point;
};
