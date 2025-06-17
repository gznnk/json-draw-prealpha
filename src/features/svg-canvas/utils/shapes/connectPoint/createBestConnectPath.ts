import type { Point } from "../../../types/base/Point";
import type { Shape } from "../../../types/base/Shape";
import { calcRectangleBoundingBoxGeometry } from "../../math/geometry/calcRectangleBoundingBoxGeometry";
import { isLineIntersectingBoxGeometry } from "../../math/geometry/isLineIntersectingBoxGeometry";
import { closer } from "../../math/common/closer";
import { getLineDirection } from "./getLineDirection";
import { getSecondConnectPoint } from "./getSecondConnectPoint";
import { addGridCrossPoint } from "./addGridCrossPoint";
import { createConnectPathOnDrag } from "./createConnectPathOnDrag";
import { removeDuplicatePoints } from "./removeDuplicatePoints";
import { getBestPath } from "./getBestPath";
import { cleanPath } from "./cleanPath";

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
	// 開始方向を計算
	const startDirection = getLineDirection(
		startOwnerShape.x,
		startOwnerShape.y,
		startX,
		startY,
	);
	const startBoundingBoxGeometry =
		calcRectangleBoundingBoxGeometry(startOwnerShape);
	const endBoundingBoxGeometry =
		calcRectangleBoundingBoxGeometry(endOwnerShape);

	const startP2 = getSecondConnectPoint(startOwnerShape, startX, startY);
	const endP2 = getSecondConnectPoint(endOwnerShape, endX, endY);

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

	// 接続線の中心候補となるポイントのグリッドを作成
	const grid: Point[] = [];
	addGridCrossPoint(grid, startP2);
	addGridCrossPoint(grid, endP2);
	addGridCrossPoint(grid, midPoint);

	// そのぞれの中心候補のポイントを通過するルートを作成
	const pathList: Point[][] = [];
	const intersectsPathList: Point[][] = [];
	for (const p of grid) {
		// 接続元から中心候補までのルート
		const startToCenter = createConnectPathOnDrag(
			startX,
			startY,
			startDirection,
			startBoundingBoxGeometry,
			p.x,
			p.y,
		);

		// 終了点の方向を計算
		const endDirection = getLineDirection(
			endOwnerShape.x,
			endOwnerShape.y,
			endX,
			endY,
		);

		// 接続先から中心候補までのルート
		const endToCenter = createConnectPathOnDrag(
			endX,
			endY,
			endDirection,
			calcRectangleBoundingBoxGeometry(endOwnerShape),
			p.x,
			p.y,
		);

		const connectPath = [...startToCenter, ...endToCenter.reverse()];

		// 図形と交差しているかチェック
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

	const bestPath =
		pathList.length !== 0
			? getBestPath(pathList, [midPoint])
			: getBestPath(intersectsPathList, [midPoint]);

	return cleanPath(bestPath);
};
