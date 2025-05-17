// Import types.
import type { Point } from "../../../types/base/Point";
import type { Shape } from "../../../types/base/Shape";

// Import utils.
import { degreesToRadians } from "../common/degreesToRadians";
import { nanToZero } from "../common/nanToZero";
import { affineTransformation } from "../transform/affineTransformation";
import { inverseAffineTransformation } from "../transform/inverseAffineTransformation";

/**
 * Calculates the bounding box for a set of points.
 *
 * @param points - Array of points
 * @param rotation - Rotation angle in degrees (default: 0)
 * @param scaleX - Scale factor in x-direction (default: 1)
 * @param scaleY - Scale factor in y-direction (default: 1)
 * @returns The bounding box shape
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
