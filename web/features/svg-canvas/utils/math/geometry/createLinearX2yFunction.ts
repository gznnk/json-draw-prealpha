import type { Point } from "../../../types/core/Point";

/**
 * Creates a function that returns the closest intersection point between a line and horizontal/vertical lines.
 * The line is defined by two points and the function compares intersections with vertical and horizontal lines
 * passing through the input coordinates, returning the closer intersection point.
 *
 * @param p1 - First point on the line
 * @param p2 - Second point on the line
 * @returns A function that takes (x, y) coordinates and returns the closest intersection point
 */
export const createLinearX2yFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (x: number, y: number) => {
		// Calculate intersection with vertical line at x
		const lineY = Number.isFinite(a) ? a * x + b : p1.y;
		const verticalIntersection = { x, y: lineY };

		// Calculate intersection with horizontal line at y
		const lineX = Number.isFinite(a) && a !== 0 ? (y - b) / a : p1.x;
		const horizontalIntersection = { x: lineX, y };

		// Calculate distances from original point (x, y)
		const verticalDistance = Math.abs(lineY - y);
		const horizontalDistance = Math.abs(lineX - x);

		// Return the closer intersection point
		return verticalDistance <= horizontalDistance
			? verticalIntersection
			: horizontalIntersection;
	};
};
