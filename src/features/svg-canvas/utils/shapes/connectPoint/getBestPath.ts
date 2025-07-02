import type { Point } from "../../../types/base/Point";
import type { GridPoint } from "../../../components/shapes/ConnectPoint/ConnectPoint/ConnectPointTypes";
import { calcDistance } from "../../math/points/calcDistance";
import { isStraight } from "./isStraight";

/**
 * Selects the best path from a list of paths based on distance, turns, and score.
 *
 * @param list - List of paths to evaluate
 * @param startPoint - Start point of the connection
 * @param endPoint - End point of the connection
 * @param midPoint - Mid point that provides scoring benefits
 * @returns The best path from the list
 */
export const getBestPath = (
	pathList: Point[][],
	startPoint: Point,
	endPoint: Point,
	midPoint: GridPoint,
): Point[] => {
	const getMidPointScore = (point: Point): number => {
		return point.x === midPoint.x && point.y === midPoint.y
			? midPoint.score || 0
			: 0;
	};

	return pathList.reduce((bestPath, currentPath) => {
		const bestPathDistance = Math.round(
			bestPath.reduce((totalDistance, point, index) => {
				if (index === 0) return totalDistance;
				const previousPoint = bestPath[index - 1];
				return (
					totalDistance +
					calcDistance(previousPoint.x, previousPoint.y, point.x, point.y)
				);
			}, 0),
		);
		const fullBestPath = [startPoint].concat(bestPath, endPoint);
		const bestPathTurns = fullBestPath.reduce((totalTurns, point, index) => {
			if (index < 2) return totalTurns;
			return (
				totalTurns +
				(isStraight(fullBestPath[index - 2], fullBestPath[index - 1], point)
					? 0
					: 1)
			);
		}, 0);
		const bestPathScore = bestPath.reduce(
			(totalScore, point) => totalScore + getMidPointScore(point),
			0,
		);

		const currentPathDistance = Math.round(
			currentPath.reduce((totalDistance, point, index) => {
				if (index === 0) return totalDistance;
				const previousPoint = currentPath[index - 1];
				return (
					totalDistance +
					calcDistance(previousPoint.x, previousPoint.y, point.x, point.y)
				);
			}, 0),
		);
		const fullCurrentPath = [startPoint].concat(currentPath, endPoint);
		const currentPathTurns = fullCurrentPath.reduce(
			(totalTurns, point, index) => {
				if (index < 2) return totalTurns;
				return (
					totalTurns +
					(isStraight(
						fullCurrentPath[index - 2],
						fullCurrentPath[index - 1],
						point,
					)
						? 0
						: 1)
				);
			},
			0,
		);
		const currentPathScore = currentPath.reduce(
			(totalScore, point) => totalScore + getMidPointScore(point),
			0,
		);

		return bestPathDistance < currentPathDistance ||
			(bestPathDistance === currentPathDistance &&
				bestPathTurns < currentPathTurns) ||
			(bestPathDistance === currentPathDistance &&
				bestPathTurns === currentPathTurns &&
				bestPathScore > currentPathScore)
			? bestPath
			: currentPath;
	});
};
