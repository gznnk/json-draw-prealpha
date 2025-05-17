// Import types.
import type { Point } from "../../../types/base/Point";

/**
 * Creates a function that calculates X coordinate from Y using a line equation defined by two points.
 * Inverse of the standard line equation: x = (y - b) / a.
 *
 * @param p1 - First point on the line
 * @param p2 - Second point on the line
 * @returns A function that takes Y (and ignores X) and returns a point with calculated X
 */
export const createLinerY2xFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (_x: number, y: number) => {
		return {
			x: Number.isFinite(a) ? (y - b) / a : p1.x,
			y,
		};
	};
};
