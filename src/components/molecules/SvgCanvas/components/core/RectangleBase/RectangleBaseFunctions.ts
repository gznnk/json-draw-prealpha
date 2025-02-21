// RectangleBase関連関数定義ファイル

import type { Point } from "../../../types";
import type { RectangleBaseArrangement } from "./RectangleBaseTypes";

export const calcArrangment = (
	point: Point,
	diagonalPoint: Point,
): RectangleBaseArrangement => {
	const top = Math.round(Math.min(point.y, diagonalPoint.y));
	const bottom = Math.round(Math.max(point.y, diagonalPoint.y));
	const left = Math.round(Math.min(point.x, diagonalPoint.x));
	const right = Math.round(Math.max(point.x, diagonalPoint.x));

	const leftTopPoint = {
		x: left,
		y: top,
	};

	const newWidth = right - left;
	const newHeight = bottom - top;

	const result: RectangleBaseArrangement = {
		point: leftTopPoint,
		width: newWidth,
		height: newHeight,
		leftTopPoint,
		leftBottomPoint: {
			x: left,
			y: bottom,
		},
		rightTopPoint: {
			x: right,
			y: top,
		},
		rightBottomPoint: {
			x: right,
			y: bottom,
		},
		topCenterPoint: {
			x: left + newWidth / 2,
			y: top,
		},
		leftCenterPoint: {
			x: left,
			y: top + newHeight / 2,
		},
		rightCenterPoint: {
			x: right,
			y: top + newHeight / 2,
		},
		bottomCenterPoint: {
			x: left + newWidth / 2,
			y: bottom,
		},
	};

	return result;
};

export const createLinerDragY2xFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (p: Point) => {
		return {
			x: (p.y - b) / a,
			y: p.y,
		};
	};
};

export const createLinerDragX2yFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (p: Point) => {
		return {
			x: p.x,
			y: a * p.x + b,
		};
	};
};
