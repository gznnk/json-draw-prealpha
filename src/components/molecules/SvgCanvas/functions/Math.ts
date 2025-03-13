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

// TODO いらんかも
/**
 * 数値がtrueなら1、falseなら-1を返す
 *
 * @param value - 数値
 * @returns - 結果
 */
export const boolSign = (value: boolean): number => {
	return value ? 1 : -1;
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
 * @param {Point} p1 - 1つ目の点の座標
 * @param {Point} p2 - 2つ目の点の座標
 * @returns {number} ２点間の距離
 */
export const calcDistance = (p1: Point, p2: Point): number => {
	const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
	return distance;
};

/**
 * 指定した点 p が、2点 a, b を結ぶ線分上にあるかを判定
 *
 * @param {Point} a - 線分の始点
 * @param {Point} b - 線分の終点
 * @param {Point} p - 判定する点
 * @returns {boolean} p が a, b を結ぶ線分上にある場合は true、それ以外は false
 */
export const isPointOnSegment = (a: Point, b: Point, p: Point): boolean => {
	// 外積を計算（3点が一直線上にあるか）
	const crossProduct = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
	if (crossProduct !== 0) return false;

	// p が a と b の間にあるか (範囲内にあるか)
	const withinX = Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x);
	const withinY = Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);

	return withinX && withinY;
};

/**
 * ２点のうち、指定した点に近い方の点を返す
 *
 * @param p - 指定した点
 * @param a - 1つ目の点の座標
 * @param b - 2つ目の点の座標
 * @returns - 近い方の点
 */
export const closerPoint = (p: Point, a: Point, b: Point): Point => {
	const distanceA = calcDistance(p, a);
	const distanceB = calcDistance(p, b);

	return distanceA < distanceB ? a : b;
};

// TODO いらんかも
/**
 * aがbよりもpに近いかどうかを判定する
 *
 * @param p - 指定した点
 * @param a - 1つ目の点の座標
 * @param b - 2つ目の点の座標
 * @returns - 指定した点に近い方の点かどうか
 */
export const isCloserPoint = (p: Point, a: Point, b: Point): boolean => {
	const distanceA = calcDistance(p, a);
	const distanceB = calcDistance(p, b);

	return distanceA < distanceB;
};

/**
 * ２点間の角度を算出する.
 * 時計の12時を0度とし、時計回りに角度を算出する.
 *
 * @param {Point} o - 原点の座標
 * @param {Point} p - 動点の座標
 * @returns {number} ２点間の角度（ラジアン）
 */
export const calcRadian = (o: Point, p: Point): number => {
	const dx = p.x - o.x;
	const dy = o.y - p.y; // y軸の正方向を上向きにするため反転

	let angle = Math.atan2(dx, dy); // atan2(y, x)ではなく(x, y)とすることで12時基準に

	if (angle < 0) {
		angle += 2 * Math.PI; // 0 〜 2π の範囲に変換
	}

	return angle;
};

/**
 * 半径rの円があり、また任意の座標(x,y)があるときに、円の中心(x,y)と任意の座標を結ぶ直線と円周が交わる点のうち、任意の座標に近い方の座標を算出する
 *
 * @param {Point} center - 円の中心の座標オブジェクト
 * @param {number} r - 円の半径
 * @param {Point} point - 任意の座標オブジェクト
 * @returns {Point} 円周と直線が交わる点のうち、任意の座標に近い方の座標
 */
export const calcNearestCircleIntersectionPoint = (
	center: Point,
	r: number,
	point: Point,
): Point => {
	const dx = point.x - center.x;
	const dy = point.y - center.y;
	const dist = Math.sqrt(dx * dx + dy * dy);

	// 任意の点が円の中心と一致する場合
	if (dist === 0) {
		return { x: center.x + r, y: center.y }; // ラジアンが0の円周上の点を返す
	}

	// 円の中心と任意の点を結ぶ直線が円周と交わる場合
	const a = (r * dx) / dist;
	const b = (r * dy) / dist;

	const intersection1: Point = { x: center.x + a, y: center.y + b };
	const intersection2: Point = { x: center.x - a, y: center.y - b };

	// 任意の点に近い方の交点を返す
	return closerPoint(point, intersection1, intersection2);
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
 * @param {Point} point - 回転させる座標
 * @param {Point} center - 回転の中心となる座標
 * @param {number} theta - 回転角度（ラジアン）
 * @returns {Point} 回転後の座標
 */
export const rotatePoint = (
	point: Point,
	center: Point,
	theta: number,
): Point => {
	const cosTheta = Math.cos(theta);
	const sinTheta = Math.sin(theta);
	const dx = point.x - center.x;
	const dy = point.y - center.y;

	const x = center.x + (dx * cosTheta - dy * sinTheta);
	const y = center.y + (dx * sinTheta + dy * cosTheta);

	return { x, y };
};

// TODO いらない？
/**
 * すでに回転している四角形の幅と高さを計算する関数
 *
 * @param {Point} topLeft - 左上の座標
 * @param {Point} bottomRight - 右下の座標
 * @param {number} theta - 回転角度（ラジアン）
 * @returns {{ width: number, height: number }} 四角形の幅と高さ
 */
export const calcRotatedRectangleDimensions = (
	topLeft: Point,
	bottomRight: Point,
	theta: number,
): { width: number; height: number } => {
	const center: Point = {
		x: (topLeft.x + bottomRight.x) / 2,
		y: (topLeft.y + bottomRight.y) / 2,
	};

	const topLeftRotated = rotatePoint(topLeft, center, -theta);
	const bottomRightRotated = rotatePoint(bottomRight, center, -theta);

	const width = Math.abs(bottomRightRotated.x - topLeftRotated.x);
	const height = Math.abs(bottomRightRotated.y - topLeftRotated.y);

	return { width, height };
};

/**
 * 点にアフィン変換を適用する
 *
 * @param point - 変換対象の座標
 * @param sx - x方向の拡大縮小率
 * @param sy - y方向の拡大縮小率
 * @param theta - 回転角度（ラジアン）
 * @param tx - x方向の平行移動量
 * @param ty - y方向の平行移動量
 * @returns 変換後の点
 */
export const affineTransformation = (
	point: Point,
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
	const originalVector = [point.x, point.y];

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
 * @param point - 逆変換対象の座標
 * @param sx - x方向の拡大縮小率
 * @param sy - y方向の拡大縮小率
 * @param theta - 回転角度（ラジアン）
 * @param tx - x方向の平行移動量
 * @param ty - y方向の平行移動量
 * @returns 逆変換後の元の点
 */
export const inverseAffineTransformation = (
	point: Point,
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
	const transformedVector = [point.x, point.y];

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

	return (p: Point) => {
		return {
			x: Number.isFinite(a) ? (p.y - b) / a : p1.x,
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
export const createLinerX2yFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (p: Point) => {
		return {
			x: p.x,
			y: Number.isFinite(a) ? a * p.x + b : p1.y,
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
	const { point, width, height, rotation, scaleX, scaleY } = shape;

	const halfWidth = width / 2;
	const halfHeight = height / 2;

	const tx = point.x;
	const ty = point.y;

	const leftTopPoint = affineTransformation(
		{ x: -halfWidth, y: -halfHeight },
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const leftBottomPoint = affineTransformation(
		{ x: -halfWidth, y: halfHeight },
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const rightTopPoint = affineTransformation(
		{ x: halfWidth, y: -halfHeight },
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const rightBottomPoint = affineTransformation(
		{ x: halfWidth, y: halfHeight },
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const topCenterPoint = affineTransformation(
		{ x: 0, y: -halfHeight },
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const leftCenterPoint = affineTransformation(
		{ x: -halfWidth, y: 0 },
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const rightCenterPoint = affineTransformation(
		{ x: halfWidth, y: 0 },
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		tx,
		ty,
	);

	const bottomCenterPoint = affineTransformation(
		{ x: 0, y: halfHeight },
		scaleX,
		scaleY,
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

// TODO: いらんかも
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

// TODO: いらんかも
/**
 * 短径内に座標が含まれるかどうかを判定する
 *
 * @param point - 判定する座標
 * @param shape - 短径のShape
 * @returns 短径内に座標が含まれるかどうか
 */
export const isPointInShape = (point: Point, shape: Shape): boolean => {
	const { point: center, width, height, rotation, scaleX, scaleY } = shape;

	const radians = degreesToRadians(rotation);

	const inversedCenter = inverseAffineTransformation(
		center,
		scaleX,
		scaleY,
		radians,
		center.x,
		center.y,
	);

	const inversedPoint = inverseAffineTransformation(
		point,
		scaleX,
		scaleY,
		radians,
		center.x,
		center.y,
	);

	const halfWidth = width / 2;
	const halfHeight = height / 2;

	const left = inversedCenter.x - halfWidth;
	const right = inversedCenter.x + halfWidth;
	const top = inversedCenter.y - halfHeight;
	const bottom = inversedCenter.y + halfHeight;

	// 短径の内部にあるかどうかを判定
	const isInside =
		left <= inversedPoint.x &&
		inversedPoint.x <= right &&
		top <= inversedPoint.y &&
		inversedPoint.y <= bottom;

	return isInside;
};
