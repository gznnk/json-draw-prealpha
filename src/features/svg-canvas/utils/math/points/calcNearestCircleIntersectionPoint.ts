// Import types.
import type { Point } from "../../../types";

// Import utils.
import { closerPoint } from "./closerPoint";

/**
 * 半径rの円があり、また任意の座標(x,y)があるときに、円の中心(x,y)と任意の座標を結ぶ直線と円周が交わる点のうち、任意の座標に近い方の座標を算出する
 *
 * @param cx - 円の中心のX座標
 * @param cy - 円の中心のY座標
 * @param r - 円の半径
 * @param px - 任意のX座標
 * @param py - 任意のY座標
 * @returns 円周と直線が交わる点のうち、任意の座標に近い方の座標
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
