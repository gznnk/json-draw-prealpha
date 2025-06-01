import type { Point } from "../../../types/base/Point";
import { isStraight } from "./isStraight";

/**
 * Cleans up a path by removing unnecessary intermediate points that are in straight lines.
 *
 * @param list - The list of points representing the path
 * @returns A cleaned path with unnecessary points removed
 */
export const cleanPath = (list: Point[]): Point[] => {
	const points: Point[] = [...list];
	for (let i = points.length - 3; i >= 0; i--) {
		if (
			// 3点が一直線上にある場合は中間の点を削除
			isStraight(points[i], points[i + 1], points[i + 2])
		) {
			points.splice(i + 1, 1);
		}
	}
	return points;
};
