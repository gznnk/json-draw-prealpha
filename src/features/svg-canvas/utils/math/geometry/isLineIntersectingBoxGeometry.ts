// Import types.
import type { BoxGeometry } from "../../../types/base/BoxGeometry";
import type { Point } from "../../../types/base/Point";

// Import utils.
import { lineIntersects } from "./lineIntersects";

/**
 * Determines if a line segment intersects with a box geometry.
 *
 * @param p1 - Starting point of the line segment
 * @param p2 - Ending point of the line segment
 * @param boxGeometry - The box geometry to check for intersection
 * @returns True if the line segment intersects the box geometry, false otherwise
 */
export const isLineIntersectingBoxGeometry = (
	p1: Point,
	p2: Point,
	boxGeometry: BoxGeometry,
): boolean => {
	const boxEdges: [Point, Point][] = [
		[
			{ x: boxGeometry.left, y: boxGeometry.top },
			{ x: boxGeometry.right, y: boxGeometry.top },
		], // 上辺
		[
			{ x: boxGeometry.right, y: boxGeometry.top },
			{ x: boxGeometry.right, y: boxGeometry.bottom },
		], // 右辺
		[
			{ x: boxGeometry.right, y: boxGeometry.bottom },
			{ x: boxGeometry.left, y: boxGeometry.bottom },
		], // 下辺
		[
			{ x: boxGeometry.left, y: boxGeometry.bottom },
			{ x: boxGeometry.left, y: boxGeometry.top },
		], // 左辺
	];

	return boxEdges.some(([q1, q2]) => lineIntersects(p1, p2, q1, q2));
};
