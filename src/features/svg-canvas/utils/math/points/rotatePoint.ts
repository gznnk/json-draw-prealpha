import type { Point } from "../../../types/CoordinateTypes";

/**
 * 座標を中心点の周りに回転させる
 *
 * @param px - 回転させるX座標
 * @param py - 回転させるY座標
 * @param cx - 回転の中心となるX座標
 * @param cy - 回転の中心となるY座標
 * @param theta - 回転角度（ラジアン）
 * @returns 回転後の座標
 */
export const rotatePoint = (
	px: number,
	py: number,
	cx: number,
	cy: number,
	theta: number,
): Point => {
	const cosTheta = Math.cos(theta);
	const sinTheta = Math.sin(theta);
	const dx = px - cx;
	const dy = py - cy;

	const x = cx + (dx * cosTheta - dy * sinTheta);
	const y = cy + (dx * sinTheta + dy * cosTheta);

	return { x, y };
};
