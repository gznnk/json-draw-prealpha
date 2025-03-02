type Point = { x: number; y: number }; // TODO

/**
 * ２点間のユークリッド距離を算出する
 *
 * @param {Point} p1 - 1つ目の点の座標
 * @param {Point} p2 - 2つ目の点の座標
 * @returns {number} ２点間の距離
 */
export const calculateDistance = (p1: Point, p2: Point): number => {
	const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
	return distance;
};

/**
 * ２点間の角度を算出する
 *
 * @param {Point} p1 - 1つ目の点の座標
 * @param {Point} p2 - 2つ目の点の座標
 * @returns {number} ２点間の角度（ラジアン）
 */
export const calculateAngle = (p1: Point, p2: Point): number => {
	const deltaY = p2.y - p1.y;
	const deltaX = p2.x - p1.x;
	const angle = Math.atan2(deltaY, deltaX); // ラジアンで角度を計算
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
	const dist1 = calculateDistance(intersection1, point);
	const dist2 = calculateDistance(intersection2, point);

	return dist1 < dist2 ? intersection1 : intersection2;
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
