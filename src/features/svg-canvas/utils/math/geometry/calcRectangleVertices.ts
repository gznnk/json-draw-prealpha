// Import types.
import type { RectangleVertices } from "../../../types/core/RectangleVertices";
import type { Frame } from "../../../types/core/Frame";

// Import utils.
import { degreesToRadians } from "../common/degreesToRadians";
import { nanToZero } from "../common/nanToZero";
import { affineTransformation } from "../transform/affineTransformation";

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

	const radians = degreesToRadians(rotation);

	const topLeftPoint = affineTransformation(
		-halfWidth,
		-halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const bottomLeftPoint = affineTransformation(
		-halfWidth,
		halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const topRightPoint = affineTransformation(
		halfWidth,
		-halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const bottomRightPoint = affineTransformation(
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
