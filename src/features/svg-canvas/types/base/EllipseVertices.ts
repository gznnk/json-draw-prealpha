// Import base types.
import type { Point } from "./Point";

/**
 * Defines the coordinates for key points of an ellipse.
 * Includes corner points and mid-points for each side to support manipulation and connection.
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
