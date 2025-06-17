import type { BoxGeometry } from "../../../types/base/BoxGeometry";
import type { Point } from "../../../types/base/Point";
import type { Direction } from "../../../components/shapes/ConnectPoint/ConnectPoint/ConnectPointTypes";
import { closer } from "../../math/common/closer";
import { lineIntersects } from "../../math/geometry/lineIntersects";
import { getLineDirection } from "./getLineDirection";
import { isUpDown } from "./isUpDown";
import { addMarginToBoxGeometry } from "./addMarginToBoxGeometry";

/**
 * Creates connection path points during drag operation.
 *
 * @param startX - Start point x coordinate
 * @param startY - Start point y coordinate
 * @param startDirection - Direction from start shape
 * @param startOwnerBoundingBoxGeometry - Bounding box geometry of start shape
 * @param endX - End point x coordinate
 * @param endY - End point y coordinate
 * @returns Array of points representing the connection path
 */
export const createConnectPathOnDrag = (
	startX: number,
	startY: number,
	startDirection: Direction,
	startOwnerBoundingBoxGeometry: BoxGeometry,
	endX: number,
	endY: number,
) => {
	// 図形と重ならないように線を引く
	const newPoints: Point[] = [];

	// 開始方向が上下かどうか
	const isDirectionUpDown = isUpDown(startDirection);

	const marginBoxGeometry = addMarginToBoxGeometry(
		startOwnerBoundingBoxGeometry,
	);

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
			p2.y = marginBoxGeometry.top;
		} else {
			p2.y = marginBoxGeometry.bottom;
		}
	} else {
		if (startDirection === "right") {
			p2.x = marginBoxGeometry.right;
		} else {
			p2.x = marginBoxGeometry.left;
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
			marginBoxGeometry.topLeft,
			marginBoxGeometry.topRight,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBoxGeometry.bottomLeft,
			marginBoxGeometry.bottomRight,
			p3,
			p4,
		);
	}
	if (startDirection === "down") {
		isAccrossCloserLine = lineIntersects(
			marginBoxGeometry.bottomLeft,
			marginBoxGeometry.bottomRight,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBoxGeometry.topLeft,
			marginBoxGeometry.topRight,
			p3,
			p4,
		);
	}
	if (startDirection === "left") {
		isAccrossCloserLine = lineIntersects(
			marginBoxGeometry.topLeft,
			marginBoxGeometry.bottomLeft,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBoxGeometry.topRight,
			marginBoxGeometry.bottomRight,
			p3,
			p4,
		);
	}
	if (startDirection === "right") {
		isAccrossCloserLine = lineIntersects(
			marginBoxGeometry.topRight,
			marginBoxGeometry.bottomRight,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBoxGeometry.topLeft,
			marginBoxGeometry.bottomLeft,
			p3,
			p4,
		);
	}

	if (isAccrossCloserLine) {
		// 近い辺と交差している場合は、p3を近い辺に移動
		if (isDirectionUpDown) {
			p3.x = closer(endX, marginBoxGeometry.left, marginBoxGeometry.right);
		} else {
			p3.y = closer(endY, marginBoxGeometry.top, marginBoxGeometry.bottom);
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
