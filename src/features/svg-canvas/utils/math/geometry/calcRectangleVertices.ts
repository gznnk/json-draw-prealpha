// Import types.
import type { RectangleVertices } from "../../../types/core/RectangleVertices";
import type { Frame } from "../../../types/core/Frame";

// Import utils.
import { degreesToRadians } from "../common/degreesToRadians";
import { nanToZero } from "../common/nanToZero";
import { efficientAffineTransformation } from "../transform/efficientAffineTransformation";

/**
 * Calculates the vertices of a rectangle.
 *
 * @param shape - The shape parameters (position, dimensions, rotation, scale)
 * @returns The coordinates of the rectangle vertices
 */
export const calcRectangleVertices = (frame: Frame): RectangleVertices => {
	const { x, y, width, height, rotation, scaleX, scaleY } = frame;

	const halfWidth = width / 2;
	const halfHeight = height / 2;

	const tx = x;
	const ty = y;

	// No rotation vertices calculation - optimized path when rotation is 0
	if (rotation === 0) {
		return {
			topLeftPoint: { x: tx - halfWidth, y: ty - halfHeight },
			bottomLeftPoint: { x: tx - halfWidth, y: ty + halfHeight },
			topRightPoint: { x: tx + halfWidth, y: ty - halfHeight },
			bottomRightPoint: { x: tx + halfWidth, y: ty + halfHeight },
			topCenterPoint: { x: tx, y: ty - halfHeight },
			leftCenterPoint: { x: tx - halfWidth, y: ty },
			rightCenterPoint: { x: tx + halfWidth, y: ty },
			bottomCenterPoint: { x: tx, y: ty + halfHeight },
		};
	}

	const radians = degreesToRadians(rotation);

	const topLeftPoint = efficientAffineTransformation(
		-halfWidth,
		-halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const bottomLeftPoint = efficientAffineTransformation(
		-halfWidth,
		halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const topRightPoint = efficientAffineTransformation(
		halfWidth,
		-halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const bottomRightPoint = efficientAffineTransformation(
		halfWidth,
		halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const topCenterPoint = {
		x: nanToZero(topLeftPoint.x + topRightPoint.x) / 2,
		y: nanToZero(topLeftPoint.y + topRightPoint.y) / 2,
	};

	const leftCenterPoint = {
		x: nanToZero(topLeftPoint.x + bottomLeftPoint.x) / 2,
		y: nanToZero(topLeftPoint.y + bottomLeftPoint.y) / 2,
	};

	const rightCenterPoint = {
		x: nanToZero(topRightPoint.x + bottomRightPoint.x) / 2,
		y: nanToZero(topRightPoint.y + bottomRightPoint.y) / 2,
	};

	const bottomCenterPoint = {
		x: nanToZero(bottomLeftPoint.x + bottomRightPoint.x) / 2,
		y: nanToZero(bottomLeftPoint.y + bottomRightPoint.y) / 2,
	};

	return {
		topLeftPoint,
		bottomLeftPoint,
		topRightPoint,
		bottomRightPoint,
		topCenterPoint,
		leftCenterPoint,
		rightCenterPoint,
		bottomCenterPoint,
	};
};
