// Import types.
import type { Point } from "../../../types/base/Point";
import type { Shape } from "../../../types/base/Shape";

// Import utils.
import { closer } from "../../math/common/closer";
import { calcRectangleBoundingBoxGeometry } from "../../math/geometry/calcRectangleBoundingBoxGeometry";
import { isLineIntersectingBoxGeometry } from "../../math/geometry/isLineIntersectingBoxGeometry";
import { addGridCrossPoint } from "./addGridCrossPoint";
import { cleanPath } from "./cleanPath";
import { createConnectPathOnDrag } from "./createConnectPathOnDrag";
import { getBestPath } from "./getBestPath";
import { getLineDirection } from "./getLineDirection";
import { getSecondConnectPoint } from "./getSecondConnectPoint";
import { removeDuplicatePoints } from "./removeDuplicatePoints";

/**
 * Creates the best connection path between two points on shapes.
 *
 * @param startX - Start point x coordinate
 * @param startY - Start point y coordinate
 * @param startOwnerShape - Shape that owns the start point
 * @param endX - End point x coordinate
 * @param endY - End point y coordinate
 * @param endOwnerShape - Shape that owns the end point
 * @returns Array of points representing the optimal connection path
 */
export const createBestConnectPath = (
	startX: number,
	startY: number,
	startOwnerShape: Shape,
	endX: number,
	endY: number,
	endOwnerShape: Shape,
): Point[] => {
	// Calculate start direction
	const startDirection = getLineDirection(
		startOwnerShape.x,
		startOwnerShape.y,
		startX,
		startY,
	);
	// Calculate end point direction
	const endDirection = getLineDirection(
		endOwnerShape.x,
		endOwnerShape.y,
		endX,
		endY,
	);
	const startBoundingBoxGeometry =
		calcRectangleBoundingBoxGeometry(startOwnerShape);
	const endBoundingBoxGeometry =
		calcRectangleBoundingBoxGeometry(endOwnerShape);

	const startP2 = getSecondConnectPoint(
		startOwnerShape,
		startBoundingBoxGeometry,
		startX,
		startY,
	);
	const endP2 = getSecondConnectPoint(
		endOwnerShape,
		endBoundingBoxGeometry,
		endX,
		endY,
	);

	const p2MidX = (startP2.x + endP2.x) / 2;
	const p2MidY = (startP2.y + endP2.y) / 2;

	const startCloserX = closer(
		p2MidX,
		startBoundingBoxGeometry.left,
		startBoundingBoxGeometry.right,
	);
	const startCloserY = closer(
		p2MidY,
		startBoundingBoxGeometry.top,
		startBoundingBoxGeometry.bottom,
	);
	const endCloserX = closer(
		p2MidX,
		endBoundingBoxGeometry.left,
		endBoundingBoxGeometry.right,
	);
	const endCloserY = closer(
		p2MidY,
		endBoundingBoxGeometry.top,
		endBoundingBoxGeometry.bottom,
	);

	const midPoint = {
		x: Math.round((startCloserX + endCloserX) / 2),
		y: Math.round((startCloserY + endCloserY) / 2),
		score: 1,
	};

	// Create grid of candidate center points for connection lines
	const grid: Point[] = [];
	addGridCrossPoint(grid, startP2);
	addGridCrossPoint(grid, endP2);
	addGridCrossPoint(grid, midPoint);

	// Create routes passing through each center candidate point
	const pathList: Point[][] = [];
	const intersectsPathList: Point[][] = [];
	for (const p of grid) {
		// Route from connection source to center candidate
		const startToCenter = createConnectPathOnDrag(
			startX,
			startY,
			startDirection,
			startBoundingBoxGeometry,
			p.x,
			p.y,
		);

		// Route from connection destination to center candidate
		const endToCenter = createConnectPathOnDrag(
			endX,
			endY,
			endDirection,
			endBoundingBoxGeometry,
			p.x,
			p.y,
		);

		const connectPath = [...startToCenter, ...endToCenter.reverse()];

		// Check if intersecting with shapes
		const isIntersecting = () => {
			for (let i = 1; i < connectPath.length - 2; i++) {
				const p1 = connectPath[i];
				const p2 = connectPath[i + 1];
				if (
					isLineIntersectingBoxGeometry(p1, p2, startBoundingBoxGeometry) ||
					isLineIntersectingBoxGeometry(p1, p2, endBoundingBoxGeometry)
				) {
					return true;
				}
			}
			return false;
		};

		if (!isIntersecting()) {
			pathList.push(removeDuplicatePoints(connectPath));
		} else {
			intersectsPathList.push(removeDuplicatePoints(connectPath));
		}
	}

	const startPoint = { x: startX, y: startY };
	const endPoint = { x: endX, y: endY };

	const bestPath =
		pathList.length !== 0
			? getBestPath(pathList, startPoint, endPoint, midPoint)
			: getBestPath(intersectsPathList, startPoint, endPoint, midPoint);

	return cleanPath(bestPath);
};
