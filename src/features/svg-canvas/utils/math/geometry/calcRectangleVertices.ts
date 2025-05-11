import type { RectangleVertices } from "../../../types/CoordinateTypes";
import type { Shape } from "../../../types";
import { degreesToRadians } from "../common/degreesToRadians";
import { nanToZero } from "../common/nanToZero";
import { affineTransformation } from "../transform/affineTransformation";

/**
 * 四角形の頂点を計算する
 *
 * @param shape - 形状
 * @returns 頂点座標
 */
export const calcRectangleVertices = (shape: Shape): RectangleVertices => {
	const { x, y, width, height, rotation, scaleX, scaleY } = shape;

	const halfWidth = width / 2;
	const halfHeight = height / 2;

	const tx = x;
	const ty = y;

	const radians = degreesToRadians(rotation);

	const leftTopPoint = affineTransformation(
		-halfWidth,
		-halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const leftBottomPoint = affineTransformation(
		-halfWidth,
		halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const rightTopPoint = affineTransformation(
		halfWidth,
		-halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const rightBottomPoint = affineTransformation(
		halfWidth,
		halfHeight,
		scaleX,
		scaleY,
		radians,
		tx,
		ty,
	);

	const topCenterPoint = {
		x: nanToZero(leftTopPoint.x + rightTopPoint.x) / 2,
		y: nanToZero(leftTopPoint.y + rightTopPoint.y) / 2,
	};

	const leftCenterPoint = {
		x: nanToZero(leftTopPoint.x + leftBottomPoint.x) / 2,
		y: nanToZero(leftTopPoint.y + leftBottomPoint.y) / 2,
	};

	const rightCenterPoint = {
		x: nanToZero(rightTopPoint.x + rightBottomPoint.x) / 2,
		y: nanToZero(rightTopPoint.y + rightBottomPoint.y) / 2,
	};

	const bottomCenterPoint = {
		x: nanToZero(leftBottomPoint.x + rightBottomPoint.x) / 2,
		y: nanToZero(leftBottomPoint.y + rightBottomPoint.y) / 2,
	};

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
