import type { Point } from "./Point";

/**
 * Defines the coordinates for key points of a rectangle.
 * Includes corner points and mid-points for each side to support manipulation and connection.
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
