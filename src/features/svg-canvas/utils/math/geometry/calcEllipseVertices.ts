import type { EllipseVertices } from "../../../types/CoordinateTypes";
import type { Shape } from "../../../types/DiagramTypes";
import { degreesToRadians } from "../common/degreesToRadians";
import { affineTransformation } from "../transform/affineTransformation";

/**
 * 楕円の頂点を計算する
 *
 * @param shape - 形状
 * @returns 頂点座標
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

	const rightTopPoint = affineTransformation(
		halfWidth / Math.sqrt(2),
		-halfHeight / Math.sqrt(2),
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const rightBottomPoint = affineTransformation(
		halfWidth / Math.sqrt(2),
		halfHeight / Math.sqrt(2),
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const leftBottomPoint = affineTransformation(
		-halfWidth / Math.sqrt(2),
		halfHeight / Math.sqrt(2),
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const leftTopPoint = affineTransformation(
		-halfWidth / Math.sqrt(2),
		-halfHeight / Math.sqrt(2),
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	return {
		leftTopPoint,
		leftBottomPoint,
		rightTopPoint,
		rightBottomPoint,
		topCenterPoint,
		leftCenterPoint,
		rightCenterPoint,
		bottomCenterPoint,
	};
};
