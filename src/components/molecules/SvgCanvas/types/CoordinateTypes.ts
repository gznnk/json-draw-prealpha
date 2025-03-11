// 座標系に関する型定義

/**
 * 座標（x,y）の型定義
 */
export type Point = {
	x: number;
	y: number;
};

/**
 * 矩形の枠の型定義
 */
export type Box = {
	top: number;
	left: number;
	right: number;
	bottom: number;
};

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
