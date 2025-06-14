// Import types.
import type { EllipseVertices } from "../../../types/base/EllipseVertices";
import type { Shape } from "../../../types/base/Shape";

// Import utils.
import { degreesToRadians } from "../common/degreesToRadians";
import { affineTransformation } from "../transform/affineTransformation";

/**
 * Calculates the vertices of an ellipse.
 *
 * @param shape - The shape parameters (position, dimensions, rotation, scale)
 * @returns The coordinates of the ellipse vertices
 */
export const calcEllipseVertices = (shape: Shape): EllipseVertices => {
	const { x, y, width, height, rotation, scaleX, scaleY } = shape;

	const halfWidth = width / 2;
	const halfHeight = height / 2;

	const tx = x;
	const ty = y;

	const radians = degreesToRadians(rotation);

	const topCenterPoint = affineTransformation(
		0,
		-halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const rightCenterPoint = affineTransformation(
		halfWidth,
		0,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const bottomCenterPoint = affineTransformation(
		0,
		halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const leftCenterPoint = affineTransformation(
		-halfWidth,
		0,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);
	const topRightPoint = affineTransformation(
		halfWidth / Math.sqrt(2),
		-halfHeight / Math.sqrt(2),
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const bottomRightPoint = affineTransformation(
		halfWidth / Math.sqrt(2),
		halfHeight / Math.sqrt(2),
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const bottomLeftPoint = affineTransformation(
		-halfWidth / Math.sqrt(2),
		halfHeight / Math.sqrt(2),
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const topLeftPoint = affineTransformation(
		-halfWidth / Math.sqrt(2),
		-halfHeight / Math.sqrt(2),
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

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
