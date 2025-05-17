// Import types.
import type { Point } from "../../../types/base/Point";

// Import utils.
import { calcDistance } from "./calcDistance";

/**
 * Returns the point (from two options) that is closer to a reference point.
 *
 * @param px - X-coordinate of the reference point
 * @param py - Y-coordinate of the reference point
 * @param ax - X-coordinate of the first comparison point
 * @param ay - Y-coordinate of the first comparison point
 * @param bx - X-coordinate of the second comparison point
 * @param by - Y-coordinate of the second comparison point
 * @returns The point (either A or B) that is closer to the reference point
 */
export const closerPoint = (
	px: number,
	py: number,
	ax: number,
	ay: number,
	bx: number,
	by: number,
): Point => {
	const distanceA = calcDistance(px, py, ax, ay);
	const distanceB = calcDistance(px, py, bx, by);

	return distanceA < distanceB ? { x: ax, y: ay } : { x: bx, y: by };
};
