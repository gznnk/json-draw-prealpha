// Import types.
import type { Point } from "../../../types/base/Point";

/**
 * Creates a function that calculates Y coordinate from X using a line equation defined by two points.
 * Uses the standard line equation y = ax + b.
 *
 * @param p1 - First point on the line
 * @param p2 - Second point on the line
 * @returns A function that takes X (and ignores Y) and returns a point with calculated Y
 */
export const createLinearX2yFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (x: number, _y: number) => {
		return {
			x: x,
			y: Number.isFinite(a) ? a * x + b : p1.y,
		};
	};
};
