import type { Box } from "../../../types/base";
import type { Shape } from "../../../types";
import { calcRectangleVertices } from "./calcRectangleVertices";

/**
 * 短径の外接枠を計算する
 *
 * @param shape - 短径
 * @returns 短径の外接枠
 */
export const calcRectangleOuterBox = (shape: Shape): Box => {
	const { leftTopPoint, leftBottomPoint, rightTopPoint, rightBottomPoint } =
		calcRectangleVertices(shape);

	const left = Math.min(
		leftTopPoint.x,
		leftBottomPoint.x,
		rightTopPoint.x,
		rightBottomPoint.x,
	);
	const top = Math.min(
		leftTopPoint.y,
		leftBottomPoint.y,
		rightTopPoint.y,
		rightBottomPoint.y,
	);
	const right = Math.max(
		leftTopPoint.x,
		leftBottomPoint.x,
		rightTopPoint.x,
		rightBottomPoint.x,
	);
	const bottom = Math.max(
		leftTopPoint.y,
		leftBottomPoint.y,
		rightTopPoint.y,
		rightBottomPoint.y,
	);

	return {
		top,
		left,
		right,
		bottom,
		center: {
			x: (left + right) / 2,
			y: (top + bottom) / 2,
		},
		leftTop: {
			x: left,
			y: top,
		},
		leftBottom: {
			x: left,
			y: bottom,
		},
		rightTop: {
			x: right,
			y: top,
		},
		rightBottom: {
			x: right,
			y: bottom,
		},
	};
};
