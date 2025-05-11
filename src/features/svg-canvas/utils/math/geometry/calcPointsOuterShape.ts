// Import types.
import type { Point, Shape } from "../../../types";

// Import utils.
import { degreesToRadians, nanToZero } from "../common";
import {
	affineTransformation,
	inverseAffineTransformation,
} from "../transform";

/**
 * 座標集合の外接枠を計算する
 *
 * @param points - 座標集合
 * @param rotation - 回転角度（デフォルト: 0）
 * @param scaleX - X方向のスケール（デフォルト: 1）
 * @param scaleY - Y方向のスケール（デフォルト: 1）
 * @returns 外接枠
 */
export const calcPointsOuterShape = (
	points: Point[],
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
): Shape => {
	const left = Math.min(...points.map((p) => p.x));
	const top = Math.min(...points.map((p) => p.y));
	const right = Math.max(...points.map((p) => p.x));
	const bottom = Math.max(...points.map((p) => p.y));

	const x = nanToZero((left + right) / 2);
	const y = nanToZero((top + bottom) / 2);

	const radians = degreesToRadians(rotation);

	const inversePoints = points.map((p) =>
		inverseAffineTransformation(p.x, p.y, scaleX, scaleY, radians, x, y),
	);

	const inverseLeft = Math.min(...inversePoints.map((p) => p.x));
	const inverseTop = Math.min(...inversePoints.map((p) => p.y));
	const inverseRight = Math.max(...inversePoints.map((p) => p.x));
	const inverseBottom = Math.max(...inversePoints.map((p) => p.y));

	const originalCenter = affineTransformation(
		nanToZero((inverseLeft + inverseRight) / 2),
		nanToZero((inverseTop + inverseBottom) / 2),
		scaleX,
		scaleY,
		radians,
		x,
		y,
	);

	return {
		x: originalCenter.x,
		y: originalCenter.y,
		width: inverseRight - inverseLeft,
		height: inverseBottom - inverseTop,
		rotation,
		scaleX,
		scaleY,
	};
};
