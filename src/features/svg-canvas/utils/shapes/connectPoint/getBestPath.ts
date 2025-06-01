import type { Point } from "../../../types/base/Point";
import type { GridPoint } from "../../../components/shapes/ConnectPoint/ConnectPoint/ConnectPointTypes";
import { calcDistance } from "../../math/points/calcDistance";
import { isStraight } from "./isStraight";

/**
 * Selects the best path from a list of paths based on distance, turns, and score.
 *
 * @param list - List of paths to evaluate
 * @param goodPoints - Points that provide scoring benefits
 * @returns The best path from the list
 */
export const getBestPath = (
	list: Point[][],
	goodPoints: GridPoint[],
): Point[] => {
	const getScore = (p: Point): number => {
		const goodPoint = goodPoints.find((gp) => gp.x === p.x && gp.y === p.y);
		return goodPoint ? goodPoint.score || 0 : 0;
	};

	return list.reduce((a, b) => {
		const distanceA = a.reduce((acc, p, i) => {
			if (i === 0) return acc;
			const ap = a[i - 1];
			return acc + calcDistance(ap.x, ap.y, p.x, p.y);
		}, 0);
		const turnsA = a.reduce((acc, p, i) => {
			if (i < 2) return acc;
			return acc + (isStraight(a[i - 2], a[i - 1], p) ? 0 : 1);
		}, 0);
		const scoreA = a.reduce((acc, p) => acc + getScore(p), 0);

		const distanceB = b.reduce((acc, p, i) => {
			if (i === 0) return acc;
			const bp = b[i - 1];
			return acc + calcDistance(bp.x, bp.y, p.x, p.y);
		}, 0);
		const turnsB = b.reduce((acc, p, i) => {
			if (i < 2) return acc;
			return acc + (isStraight(b[i - 2], b[i - 1], p) ? 0 : 1);
		}, 0);
		const scoreB = b.reduce((acc, p) => acc + getScore(p), 0);

		return distanceA < distanceB ||
			(distanceA === distanceB && turnsA < turnsB) ||
			(distanceA === distanceB && turnsA === turnsB && scoreA > scoreB)
			? a
			: b;
	});
};
