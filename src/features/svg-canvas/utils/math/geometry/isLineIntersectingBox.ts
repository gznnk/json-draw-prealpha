// Import types.
import type { Box, Point } from "../../../types";

// Import utils.
import { lineIntersects } from "./lineIntersects";

/**
 * 線分がボックスと交差しているか判定する
 *
 * @param p1 - 線分の始点
 * @param p2 - 線分の終点
 * @param box - 判定対象のボックス
 * @returns 交差していれば true, そうでなければ false
 */
export const isLineIntersectingBox = (
	p1: Point,
	p2: Point,
	box: Box,
): boolean => {
	const boxEdges: [Point, Point][] = [
		[
			{ x: box.left, y: box.top },
			{ x: box.right, y: box.top },
		], // 上辺
		[
			{ x: box.right, y: box.top },
			{ x: box.right, y: box.bottom },
		], // 右辺
		[
			{ x: box.right, y: box.bottom },
			{ x: box.left, y: box.bottom },
		], // 下辺
		[
			{ x: box.left, y: box.bottom },
			{ x: box.left, y: box.top },
		], // 左辺
	];

	return boxEdges.some(([q1, q2]) => lineIntersects(p1, p2, q1, q2));
};
