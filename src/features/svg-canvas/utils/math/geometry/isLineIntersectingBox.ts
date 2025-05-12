// Import types.
import type { Box, Point } from "../../../types";

// Import utils.
import { lineIntersects } from "./lineIntersects";

/**
 * Determines if a line segment intersects with a box.
 *
 * @param p1 - Starting point of the line segment
 * @param p2 - Ending point of the line segment
 * @param box - The box to check for intersection
 * @returns True if the line segment intersects the box, false otherwise
 */
export const isLineIntersectingBox = (
	p1: Point,
	p2: Point,
	box: Box,
): boolean => {
	const boxEdges: [Point, Point][] = [
		[
			{ x: box.left, y: box.top },
			{ x: box.right, y: box.top },
		], // 上辺
		[
			{ x: box.right, y: box.top },
			{ x: box.right, y: box.bottom },
		], // 右辺
		[
			{ x: box.right, y: box.bottom },
			{ x: box.left, y: box.bottom },
		], // 下辺
		[
			{ x: box.left, y: box.bottom },
			{ x: box.left, y: box.top },
		], // 左辺
	];

	return boxEdges.some(([q1, q2]) => lineIntersects(p1, p2, q1, q2));
};
