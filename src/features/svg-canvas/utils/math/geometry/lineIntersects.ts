// Import types.
import type { Point } from "../../../types";

/**
 * 2つの線分が交差しているか判定する
 *
 * @param p1 - 1つ目の線分の始点
 * @param p2 - 1つ目の線分の終点
 * @param q1 - 2つ目の線分の始点
 * @param q2 - 2つ目の線分の終点
 * @returns 交差していれば true, そうでなければ false
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
