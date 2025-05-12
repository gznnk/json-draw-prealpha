// Import types.
import type { Point } from "../../../types";

/**
 * Determines if two line segments intersect.
 * Uses the cross product method to check for intersection.
 *
 * @param p1 - Starting point of the first line segment
 * @param p2 - Ending point of the first line segment
 * @param q1 - Starting point of the second line segment
 * @param q2 - Ending point of the second line segment
 * @returns True if the line segments intersect, false otherwise
 */
export const lineIntersects = (
	p1: Point,
	p2: Point,
	q1: Point,
	q2: Point,
): boolean => {
	const crossProduct = (p: Point, q: Point): number => p.x * q.y - p.y * q.x;
	const subtract = (p: Point, q: Point): Point => ({
		x: p.x - q.x,
		y: p.y - q.y,
	});

	const r = subtract(p2, p1);
	const s = subtract(q2, q1);
	const denominator = crossProduct(r, s);

	if (denominator === 0) return false; // 平行な場合

	const u = crossProduct(subtract(q1, p1), r) / denominator;
	const t = crossProduct(subtract(q1, p1), s) / denominator;

	return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};
