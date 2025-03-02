// RectangleBase関連関数定義ファイル

import type { Point } from "../../../types/CoordinateTypes";
import type {
	GroupDragEvent,
	GroupResizeEvent,
} from "../../../types/EventTypes";
import type {
	RectangleBaseArrangement,
	RectangleBaseVertices,
} from "./RectangleBaseTypes";

import {
	affineTransformation,
	degreesToRadians,
} from "../../../functions/Math";

// TODO: 場所
const rotatePoint = (center: Point, x: number, y: number, rotation: number) => {
	const rad = (rotation * Math.PI) / 180;
	const dx = x - center.x;
	const dy = y - center.y;
	return {
		x: center.x + dx * Math.cos(rad) - dy * Math.sin(rad),
		y: center.y + dx * Math.sin(rad) + dy * Math.cos(rad),
	};
};

export const calcRectangleVertices = (
	point: Point, // 左上の点
	width: number,
	height: number,
	rotation: number,
): RectangleBaseVertices => {
	const halfWidth = width / 2;
	const halfHeight = height / 2;

	const tx = point.x + halfWidth;
	const ty = point.y + halfHeight;

	const leftTopPoint = affineTransformation(
		{ x: -halfWidth, y: -halfWidth },
		1,
		1,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const leftBottomPoint = affineTransformation(
		{ x: -halfWidth, y: halfWidth },
		1,
		1,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const rightTopPoint = affineTransformation(
		{ x: halfWidth, y: -halfWidth },
		1,
		1,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const rightBottomPoint = affineTransformation(
		{ x: halfWidth, y: halfWidth },
		1,
		1,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const topCenterPoint = affineTransformation(
		{ x: 0, y: -halfWidth },
		1,
		1,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const leftCenterPoint = affineTransformation(
		{ x: -halfWidth, y: 0 },
		1,
		1,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const rightCenterPoint = affineTransformation(
		{ x: halfWidth, y: 0 },
		1,
		1,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const bottomCenterPoint = affineTransformation(
		{ x: 0, y: halfWidth },
		1,
		1,
		degreesToRadians(rotation),
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

/**
 * 与えられた2つの点（pointとdiagonalPoint）から矩形の配置情報を計算します。
 *
 * @param point - 矩形の一つの頂点を表す点
 * @param diagonalPoint - 矩形の対角線上のもう一つの頂点を表す点
 * @returns 矩形の配置情報を含むオブジェクト
 */
export const calcArrangment = (
	point: Point,
	diagonalPoint: Point,
	rotation = 0,
): RectangleBaseArrangement => {
	const top = Math.round(Math.min(point.y, diagonalPoint.y));
	const bottom = Math.round(Math.max(point.y, diagonalPoint.y));
	const left = Math.round(Math.min(point.x, diagonalPoint.x));
	const right = Math.round(Math.max(point.x, diagonalPoint.x));

	const newWidth = right - left;
	const newHeight = bottom - top;

	const centerX = left + newWidth / 2;
	const centerY = top + newHeight / 2;
	const center = { x: centerX, y: centerY };

	const leftTopPoint = rotatePoint(center, left, top, rotation);
	const leftBottomPoint = rotatePoint(center, left, bottom, rotation);
	const rightTopPoint = rotatePoint(center, right, top, rotation);
	const rightBottomPoint = rotatePoint(center, right, bottom, rotation);
	const topCenterPoint = rotatePoint(center, centerX, top, rotation);
	const leftCenterPoint = rotatePoint(center, left, centerY, rotation);
	const rightCenterPoint = rotatePoint(center, right, centerY, rotation);
	const bottomCenterPoint = rotatePoint(center, centerX, bottom, rotation);

	const result: RectangleBaseArrangement = {
		point: {
			x: left,
			y: top,
		},
		width: newWidth,
		height: newHeight,
		rotation: rotation || 0,
		leftTopPoint,
		leftBottomPoint,
		rightTopPoint,
		rightBottomPoint,
		topCenterPoint,
		leftCenterPoint,
		rightCenterPoint,
		bottomCenterPoint,
	};

	return result;
};

/**
 * グループのドラッグに伴う図形の移動を計算します。
 *
 * @param e - グループのドラッグイベント
 * @param point - 移動する図形の左上の頂点を表す点
 * @returns 移動後の図形の左上の頂点を表す点
 */
export const calcPointOnGroupDrag = (e: GroupDragEvent, point: Point) => {
	const dx = e.endPoint.x - e.startPoint.x;
	const dy = e.endPoint.y - e.startPoint.y;
	return {
		x: point.x + dx,
		y: point.y + dy,
	};
};

/**
 * 与えられた2つの点（pointとdiagonalPoint）から矩形の配置情報を計算します。
 * グループ図形の変更時に使用します。
 *
 * @param e - グループ図形の変更イベント
 * @param point - 矩形の左上の頂点を表す点
 * @param width - 矩形の幅
 * @param height - 矩形の高さ
 * @returns 矩形の配置情報を含むオブジェクト
 */
export const calcArrangmentOnGroupResize = (
	e: GroupResizeEvent,
	point: Point,
	width: number,
	height: number,
) => {
	// 変更前の幅と変更後の幅の比率
	const scaleX = e.endSize.width / e.startSize.width;
	// 変更前の高さと変更後の高さの比率
	const scaleY = e.endSize.height / e.startSize.height;

	// 変更前のグループ内での相対X座標
	const oldRelativeX = point.x - e.startSize.point.x;
	// 変更前のグループ内での相対Y座標
	const oldRelativeY = point.y - e.startSize.point.y;

	// 変更後のX座標
	const newX = e.endSize.point.x + Math.round(oldRelativeX * scaleX);
	// 変更後のY座標
	const newY = e.endSize.point.y + Math.round(oldRelativeY * scaleY);

	// 変更後の幅
	let newWidth = Math.round(width * scaleX);
	// 変更後の高さ
	let newHeight = Math.round(height * scaleY);

	// グループの右端からはみ出ないよう変更後の幅を調整
	if (newX + newWidth > e.endSize.point.x + e.endSize.width) {
		newWidth = e.endSize.point.x + e.endSize.width - newX;
	}

	// グループの下端からはみ出ないよう変更後の高さを調整
	if (newY + newHeight > e.endSize.point.y + e.endSize.height) {
		newHeight = e.endSize.point.y + e.endSize.height - newY;
	}

	return {
		point: { x: newX, y: newY },
		width: newWidth,
		height: newHeight,
	};
};

/**
 * 2点間の直線の方程式を基に、Y座標からX座標を計算する関数を生成します。
 *
 * @param p1 - 直線上の最初の点
 * @param p2 - 直線上の2番目の点
 * @returns Y座標を入力としてX座標を計算する関数
 */
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

/**
 * 2点間の直線の方程式を基に、X座標からY座標を計算する関数を生成します。
 *
 * @param p1 - 直線上の最初の点
 * @param p2 - 直線上の2番目の点
 * @returns X座標を入力としてY座標を計算する関数
 */
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
