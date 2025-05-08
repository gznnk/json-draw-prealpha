import type { Point } from "../../../types/CoordinateTypes";
import { calcDistance } from "./calcDistance";

/**
 * ２点のうち、指定した点に近い方の点を返す
 *
 * @param px - 指定した点のX座標
 * @param py - 指定した点のY座標
 * @param ax - 1つ目の点のX座標
 * @param ay - 1つ目の点のY座標
 * @param bx - 2つ目の点のX座標
 * @param by - 2つ目の点のY座標
 * @returns 近い方の点
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
