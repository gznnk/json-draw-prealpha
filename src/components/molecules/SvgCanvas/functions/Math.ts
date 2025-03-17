import type { Point, Box, RectangleVertices } from "../types/CoordinateTypes";
import type { Shape } from "../types/DiagramTypes";

/**
 * Nandであれば0に変換する
 *
 * @param value - 変換対象の数値
 * @returns {number} 変換後の数値
 */
export const nanToZero = (value: number): number => {
	return Number.isNaN(value) ? 0 : value;
};

/**
 * 数値が0以上なら1、0未満なら-1を返す
 *
 * @param value - 数値
 * @returns - 結果
 */
export const signNonZero = (value: number): number => {
	return value >= 0 ? 1 : -1;
};

/**
 * ２つの数値のうち、指定した数値に近い方を返す
 *
 * @param value - 基準の数値
 * @param a - 比較対象の数値
 * @param b - 比較対象の数値
 * @returns - 指定した数値に近い方の数値
 */
export const closer = (value: number, a: number, b: number): number => {
	return Math.abs(value - a) <= Math.abs(value - b) ? a : b;
};

/**
 * ２点間のユークリッド距離を算出する
 *
 * @param {number} x1 - 1つ目の点のX座標
 * @param {number} y1 - 1つ目の点のY座標
 * @param {number} x2 - 2つ目の点のX座標
 * @param {number} y2 - 2つ目の点のY座標
 * @returns {number} ２点間の距離
 */
export const calcDistance = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
): number => {
	const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
	return distance;
};

/**
 * ２点のうち、指定した点に近い方の点を返す
 *
 * @param px - 指定した点のX座標
 * @param py - 指定した点のY座標
 * @param ax - 1つ目の点のX座標
 * @param ay - 1つ目の点のY座標
 * @param bx - 2つ目の点のX座標
 * @param by - 2つ目の点のY座標
 * @returns - 近い方の点
 */
export const closerPoint = (
	px: number,
	py: number,
	ax: number,
	ay: number,
	bx: number,
	by: number,
): Point => {
	const distanceA = calcDistance(px, py, ax, ay);
	const distanceB = calcDistance(px, py, bx, by);

	return distanceA < distanceB ? { x: ax, y: ay } : { x: bx, y: by };
};

/**
 * ２点間の角度を算出する.
 * 時計の12時を0度とし、時計回りに角度を算出する.
 *
 * @param {number} ox - 原点のX座標
 * @param {number} oy - 原点のY座標
 * @param {number} px - 動点のX座標
 * @param {number} py - 動点のY座標
 * @returns {number} ２点間の角度（ラジアン）
 */
export const calcRadians = (
	ox: number,
	oy: number,
	px: number,
	py: number,
): number => {
	const dx = px - ox;
	const dy = oy - py; // y軸の正方向を上向きにするため反転

	let angle = Math.atan2(dx, dy); // atan2(y, x)ではなく(x, y)とすることで12時基準に

	if (angle < 0) {
		angle += 2 * Math.PI; // 0 〜 2π の範囲に変換
	}

	return angle;
};

/**
 * 半径rの円があり、また任意の座標(x,y)があるときに、円の中心(x,y)と任意の座標を結ぶ直線と円周が交わる点のうち、任意の座標に近い方の座標を算出する
 *
 * @param {number} cx - 円の中心のX座標
 * @param {number} cy - 円の中心のY座標
 * @param {number} r - 円の半径
 * @param {number} px - 任意のX座標
 * @param {number} py - 任意のY座標
 * @returns {Point} 円周と直線が交わる点のうち、任意の座標に近い方の座標
 */
export const calcNearestCircleIntersectionPoint = (
	cx: number,
	cy: number,
	r: number,
	px: number,
	py: number,
): Point => {
	const dx = px - cx;
	const dy = py - cy;
	const dist = Math.sqrt(dx * dx + dy * dy);

	// 任意の点が円の中心と一致する場合
	if (dist === 0) {
		return { x: cx + r, y: cy }; // ラジアンが0の円周上の点を返す
	}

	// 円の中心と任意の点を結ぶ直線が円周と交わる場合
	const a = (r * dx) / dist;
	const b = (r * dy) / dist;

	// 任意の点に近い方の交点を返す
	return closerPoint(px, py, cx + a, cy + b, cx - a, cy - b);
};

/**
 * 度をラジアンに変換する
 *
 * @param degrees - 度
 * @returns ラジアン
 */
export const degreesToRadians = (degrees: number): number => {
	return degrees * (Math.PI / 180);
};

/**
 * ラジアンを度に変換する
 *
 * @param radians - ラジアン
 * @returns 度
 */
export const radiansToDegrees = (radians: number): number => {
	return radians * (180 / Math.PI);
};

/**
 * 座標を中心点の周りに回転させる
 *
 * @param {number} px - 回転させるX座標
 * @param {number} py - 回転させるY座標
 * @param {number} cx - 回転の中心となるX座標
 * @param {number} cy - 回転の中心となるY座標
 * @param {number} theta - 回転角度（ラジアン）
 * @returns {Point} 回転後の座標
 */
export const rotatePoint = (
	px: number,
	py: number,
	cx: number,
	cy: number,
	theta: number,
): Point => {
	const cosTheta = Math.cos(theta);
	const sinTheta = Math.sin(theta);
	const dx = px - cx;
	const dy = py - cy;

	const x = cx + (dx * cosTheta - dy * sinTheta);
	const y = cy + (dx * sinTheta + dy * cosTheta);

	return { x, y };
};

/**
 * 点にアフィン変換を適用する
 *
 * @param px - 変換対象のX座標
 * @param py - 変換対象のY座標
 * @param sx - x方向の拡大縮小率
 * @param sy - y方向の拡大縮小率
 * @param theta - 回転角度（ラジアン）
 * @param tx - x方向の平行移動量
 * @param ty - y方向の平行移動量
 * @returns 変換後の点
 */
export const affineTransformation = (
	px: number,
	py: number,
	sx: number,
	sy: number,
	theta: number,
	tx: number,
	ty: number,
): Point => {
	// 拡縮と回転の行列
	const transformationMatrix = [
		[sx * Math.cos(theta), -sy * Math.sin(theta)],
		[sx * Math.sin(theta), sy * Math.cos(theta)],
	];

	// 平行移動のベクトル
	const translationVector = [tx, ty];

	// 変換前の座標ベクトル
	const originalVector = [px, py];

	// アフィン変換を適用
	const transformedVector = [
		transformationMatrix[0][0] * originalVector[0] +
			transformationMatrix[0][1] * originalVector[1] +
			translationVector[0],
		transformationMatrix[1][0] * originalVector[0] +
			transformationMatrix[1][1] * originalVector[1] +
			translationVector[1],
	];

	return { x: transformedVector[0], y: transformedVector[1] };
};

/**
 * 点に対してアフィン変換の逆変換を適用する
 *
 * @param px - 逆変換対象のX座標
 * @param py - 逆変換対象のY座標
 * @param sx - x方向の拡大縮小率
 * @param sy - y方向の拡大縮小率
 * @param theta - 回転角度（ラジアン）
 * @param tx - x方向の平行移動量
 * @param ty - y方向の平行移動量
 * @returns 逆変換後の元の点
 */
export const inverseAffineTransformation = (
	px: number,
	py: number,
	sx: number,
	sy: number,
	theta: number,
	tx: number,
	ty: number,
): Point => {
	// 拡縮と回転の逆行列を計算
	const inverseTransformationMatrix = [
		[Math.cos(theta) / sx, Math.sin(theta) / sx],
		[-Math.sin(theta) / sy, Math.cos(theta) / sy],
	];

	// 平行移動の逆ベクトル
	const inverseTranslationVector = [-tx, -ty];

	// 変換後の座標ベクトル
	const transformedVector = [px, py];

	// 平行移動の逆変換を適用
	const translatedVector = [
		transformedVector[0] + inverseTranslationVector[0],
		transformedVector[1] + inverseTranslationVector[1],
	];

	// アフィン変換の逆変換を適用
	const originalVector = [
		inverseTransformationMatrix[0][0] * translatedVector[0] +
			inverseTransformationMatrix[0][1] * translatedVector[1],
		inverseTransformationMatrix[1][0] * translatedVector[0] +
			inverseTransformationMatrix[1][1] * translatedVector[1],
	];

	return { x: originalVector[0], y: originalVector[1] };
};

/**
 * 2点間の直線の方程式を基に、Y座標からX座標を計算する関数を生成します。
 *
 * @param p1 - 直線上の最初の点
 * @param p2 - 直線上の2番目の点
 * @returns Y座標を入力としてX座標を計算する関数
 */
export const createLinerY2xFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (_x: number, y: number) => {
		return {
			x: Number.isFinite(a) ? (y - b) / a : p1.x,
			y,
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
export const createLinerX2yFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (x: number, _y: number) => {
		return {
			x: x,
			y: Number.isFinite(a) ? a * x + b : p1.y,
		};
	};
};

/**
 * 矩形の頂点を計算する
 *
 * @param point - 短径の中心座標
 * @param width	- 短径の幅
 * @param height - 短径の高さ
 * @param rotation - 短径の回転角度
 * @param scaleX - 短径のX軸方向の拡大率
 * @param scaleY - 短径のY軸方向の拡大率
 * @returns 矩形の頂点座標
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

	const topCenterPoint = affineTransformation(
		0,
		-halfHeight,
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
 * 座標集合の外接枠を計算する
 *
 * @param points - 座標集合
 * @returns 外接枠
 */
export const calcPointsOuterBox = (points: Point[]): Box => {
	const left = Math.min(...points.map((p) => p.x));
	const top = Math.min(...points.map((p) => p.y));
	const right = Math.max(...points.map((p) => p.x));
	const bottom = Math.max(...points.map((p) => p.y));

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

/**
 * 線分がボックスと交差しているか判定する
 *
 * @param p1 - 線分の始点
 * @param p2 - 線分の終点
 * @param box - 判定対象のボックス
 * @returns 交差していれば true, そうでなければ false
 */
export const isLineIntersectingBox = (
	p1: Point,
	p2: Point,
	box: Box,
): boolean => {
	const boxEdges: [Point, Point][] = [
		[
			{ x: box.left, y: box.top },
			{ x: box.right, y: box.top },
		], // 上辺
		[
			{ x: box.right, y: box.top },
			{ x: box.right, y: box.bottom },
		], // 右辺
		[
			{ x: box.right, y: box.bottom },
			{ x: box.left, y: box.bottom },
		], // 下辺
		[
			{ x: box.left, y: box.bottom },
			{ x: box.left, y: box.top },
		], // 左辺
	];

	return boxEdges.some(([q1, q2]) => lineIntersects(p1, p2, q1, q2));
};

/**
 * 2つの線分が交差しているか判定する
 *
 * @param p1 - 1つ目の線分の始点
 * @param p2 - 1つ目の線分の終点
 * @param q1 - 2つ目の線分の始点
 * @param q2 - 2つ目の線分の終点
 * @returns 交差していれば true, そうでなければ false
 */
export const lineIntersects = (
	p1: Point,
	p2: Point,
	q1: Point,
	q2: Point,
): boolean => {
	const crossProduct = (p: Point, q: Point): number => p.x * q.y - p.y * q.x;
	const subtract = (p: Point, q: Point): Point => ({
		x: p.x - q.x,
		y: p.y - q.y,
	});

	const r = subtract(p2, p1);
	const s = subtract(q2, q1);
	const denominator = crossProduct(r, s);

	if (denominator === 0) return false; // 平行な場合

	const u = crossProduct(subtract(q1, p1), r) / denominator;
	const t = crossProduct(subtract(q1, p1), s) / denominator;

	return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};
