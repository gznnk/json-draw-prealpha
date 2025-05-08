// SvgCanvas関連型定義をインポート
import type { Box, Point } from "../../../../types/CoordinateTypes";
import type { Shape } from "../../../../types/DiagramTypes";

// SvgCanvas関連関数をインポート
import {
	calcDistance,
	calcRadians,
	calcRectangleOuterBox,
	closer,
	isLineIntersectingBox,
	lineIntersects,
	radiansToDegrees,
} from "../../../../utils";

// Imports related to this component.
import { CONNECT_LINE_MARGIN } from "./ConnectPointConstants";
import type { Direction, GridPoint } from "./ConnectPointTypes";

/**
 * 角度から方向を取得する
 *
 * @param radians - 角度（ラジアン）
 * @returns 方向
 */
export const getDirection = (radians: number): Direction => {
	const degrees = Math.round(radiansToDegrees(radians));
	if (degrees <= 45 || 315 <= degrees) {
		return "up";
	}
	if (45 < degrees && degrees < 135) {
		return "right";
	}
	if (135 <= degrees && degrees <= 225) {
		return "down";
	}
	return "left";
};

/**
 * ２点の座標から方向を取得する
 *
 * @param ox - 原点のx座標
 * @param oy - 原点のy座標
 * @param px - 動点のx座標
 * @param py - 動点のy座標
 * @returns 方向
 */
export const getLineDirection = (
	ox: number,
	oy: number,
	px: number,
	py: number,
): Direction => {
	return getDirection(calcRadians(ox, oy, px, py));
};

export const isUpDown = (direction: Direction): boolean => {
	return direction === "up" || direction === "down";
};

export const getSecondConnectPoint = (
	ownerShape: Shape,
	cx: number,
	cy: number,
): Point => {
	const ownerOuterBox = calcRectangleOuterBox(ownerShape);
	const direction = getLineDirection(ownerShape.x, ownerShape.y, cx, cy);

	if (direction === "up") {
		return { x: cx, y: ownerOuterBox.top - CONNECT_LINE_MARGIN };
	}
	if (direction === "down") {
		return { x: cx, y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN };
	}
	if (direction === "left") {
		return { x: ownerOuterBox.left - CONNECT_LINE_MARGIN, y: cy };
	}
	if (direction === "right") {
		return { x: ownerOuterBox.right + CONNECT_LINE_MARGIN, y: cy };
	}
	return { x: 0, y: 0 };
};

export const addGridCrossPoint = (grid: GridPoint[], point: GridPoint) => {
	if (!grid.some((p) => p.x === point.x && p.y === point.y)) {
		const len = grid.length;
		for (let i = 0; i < len; i++) {
			const p = grid[i];
			// すでにある点を中心とする水平線および垂直線上と
			// 追加した点を中心とする水平線および垂直線上との交点を追加
			if (p.x !== point.x) {
				grid.push({ x: p.x, y: point.y, score: p.score });
			}
			if (p.y !== point.y) {
				grid.push({ x: point.x, y: p.y, score: p.score });
			}
		}
		grid.push(point);
	}
};

export const addMarginToBox = (box: Box): Box => {
	const left = box.left - CONNECT_LINE_MARGIN;
	const top = box.top - CONNECT_LINE_MARGIN;
	const right = box.right + CONNECT_LINE_MARGIN;
	const bottom = box.bottom + CONNECT_LINE_MARGIN;
	return {
		top,
		left,
		right,
		bottom,
		center: box.center,
		leftTop: { x: left, y: top },
		leftBottom: { x: left, y: bottom },
		rightTop: { x: right, y: top },
		rightBottom: { x: right, y: bottom },
	};
};

export const createConnectPathOnDrag = (
	startX: number,
	startY: number,
	startDirection: Direction,
	startOwnerOuterBox: Box,
	endX: number,
	endY: number,
) => {
	// 図形と重ならないように線を引く
	const newPoints: Point[] = [];

	// 開始方向が上下かどうか
	const isDirectionUpDown = isUpDown(startDirection);

	const marginBox = addMarginToBox(startOwnerOuterBox);

	// p1
	const p1 = { x: startX, y: startY };
	newPoints.push(p1);

	// p2
	const p2 = {
		x: isDirectionUpDown ? p1.x : endX,
		y: isDirectionUpDown ? endY : p1.y,
	};

	if (isDirectionUpDown) {
		if (startDirection === "up") {
			p2.y = marginBox.top;
		} else {
			p2.y = marginBox.bottom;
		}
	} else {
		if (startDirection === "right") {
			p2.x = marginBox.right;
		} else {
			p2.x = marginBox.left;
		}
	}
	newPoints.push(p2);

	// p3
	const p3 = {
		x: isDirectionUpDown ? p2.x : endX,
		y: isDirectionUpDown ? endY : p2.y,
	};

	// p4
	const p4 = { x: endX, y: endY };

	// p2-p3間の線の方向が逆向きになっているかチェック
	const isP2ReverseDirection =
		getLineDirection(p2.x, p2.y, p3.x, p3.y) !== startDirection;
	if (isP2ReverseDirection) {
		// 逆向きになっている場合
		if (isDirectionUpDown) {
			p3.x = p4.x;
			p3.y = p2.y;
		} else {
			p3.x = p2.x;
			p3.y = p4.y;
		}
	}
	newPoints.push(p3);
	newPoints.push(p4);

	// p3-p4間の線が図形の辺と交差しているかチェック
	let isAccrossCloserLine = false;
	let isAccrossFartherLine = false;
	if (startDirection === "up") {
		isAccrossCloserLine = lineIntersects(
			marginBox.leftTop,
			marginBox.rightTop,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBox.leftBottom,
			marginBox.rightBottom,
			p3,
			p4,
		);
	}
	if (startDirection === "down") {
		isAccrossCloserLine = lineIntersects(
			marginBox.leftBottom,
			marginBox.rightBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBox.leftTop,
			marginBox.rightTop,
			p3,
			p4,
		);
	}
	if (startDirection === "left") {
		isAccrossCloserLine = lineIntersects(
			marginBox.leftTop,
			marginBox.leftBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBox.rightTop,
			marginBox.rightBottom,
			p3,
			p4,
		);
	}
	if (startDirection === "right") {
		isAccrossCloserLine = lineIntersects(
			marginBox.rightTop,
			marginBox.rightBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBox.leftTop,
			marginBox.leftBottom,
			p3,
			p4,
		);
	}

	if (isAccrossCloserLine) {
		// 近い辺と交差している場合は、p3を近い辺に移動
		if (isDirectionUpDown) {
			p3.x = closer(endX, marginBox.left, marginBox.right);
		} else {
			p3.y = closer(endY, marginBox.top, marginBox.bottom);
		}
		// p4が図形の中に入らないよう位置を修正
		if (isDirectionUpDown) {
			p4.x = p3.x;
			p4.y = endY;
		} else {
			p4.x = endX;
			p4.y = p3.y;
		}
	}

	if (isAccrossFartherLine) {
		// 遠い辺も交差している場合は、p5を追加して交差しないようにする
		const p5 = { x: endX, y: endY };
		newPoints.push(p5);
	}

	return newPoints;
};

/**
 * 2点間の最適な接続線のパスを生成する
 *
 * @param startX 開始点のX座標
 * @param startY 開始点のY座標
 * @param startOwnerShape 開始点の所有図形
 * @param endX 終了点のX座標
 * @param endY 終了点のY座標
 * @param endOwnerShape 終了点の所有図形
 * @returns 接続線のパス
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

	const startOuterBox = calcRectangleOuterBox(startOwnerShape);
	const endOuterBox = calcRectangleOuterBox(endOwnerShape);

	const startP2 = getSecondConnectPoint(startOwnerShape, startX, startY);
	const endP2 = getSecondConnectPoint(endOwnerShape, endX, endY);

	const p2MidX = (startP2.x + endP2.x) / 2;
	const p2MidY = (startP2.y + endP2.y) / 2;

	const startCloserX = closer(p2MidX, startOuterBox.left, startOuterBox.right);
	const startCloserY = closer(p2MidY, startOuterBox.top, startOuterBox.bottom);
	const endCloserX = closer(p2MidX, endOuterBox.left, endOuterBox.right);
	const endCloserY = closer(p2MidY, endOuterBox.top, endOuterBox.bottom);

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
			startOuterBox,
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
			calcRectangleOuterBox(endOwnerShape),
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
					isLineIntersectingBox(p1, p2, startOuterBox) ||
					isLineIntersectingBox(p1, p2, endOuterBox)
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

export const removeDuplicatePoints = (list: Point[]): Point[] => {
	const uniquePoints: Point[] = [];
	const seen = new Set<string>();
	for (const point of list) {
		const key = `${point.x},${point.y}`;
		if (!seen.has(key)) {
			uniquePoints.push(point);
			seen.add(key);
		}
	}
	return uniquePoints;
};

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

export const isStraight = (p1: Point, p2: Point, p3: Point): boolean => {
	return (p1.x === p2.x && p2.x === p3.x) || (p1.y === p2.y && p2.y === p3.y);
};

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
