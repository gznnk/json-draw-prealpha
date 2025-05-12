// Import types.
import type { Point } from "../../../types";

// Import utils.
import { closerPoint } from "./closerPoint";

/**
 * Calculates the nearest intersection point between a circle and a line.
 * Given a circle and a point, finds the intersection point of the circle with the line
 * connecting the circle's center and the point, that is closest to the given point.
 *
 * @param cx - X-coordinate of the circle center
 * @param cy - Y-coordinate of the circle center
 * @param r - Radius of the circle
 * @param px - X-coordinate of the reference point
 * @param py - Y-coordinate of the reference point
 * @returns The intersection point closest to the reference point
 */
export const calcNearestCircleIntersectionPoint = (
	cx: number,
	cy: number,
	r: number,
	px: number,
	py: number,
): Point => {
	const dx = px - cx;
	const dy = py - cy;
	const dist = Math.sqrt(dx * dx + dy * dy);

	// 任意の点が円の中心と一致する場合
	if (dist === 0) {
		return { x: cx + r, y: cy }; // ラジアンが0の円周上の点を返す
	}

	// 円の中心と任意の点を結ぶ直線が円周と交わる場合
	const a = (r * dx) / dist;
	const b = (r * dy) / dist;

	// 任意の点に近い方の交点を返す
	return closerPoint(px, py, cx + a, cy + b, cx - a, cy - b);
};
