type Point = { x: number; y: number };

/**
 * 度をラジアンに変換する関数
 * @param degrees - 度
 * @returns ラジアン
 */
export const degreesToRadians = (degrees: number): number => {
	return degrees * (Math.PI / 180);
};

/**
 * 点にアフィン変換を適用する関数
 * @param point - 変換対象の点
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
 * 点に対してアフィン変換の逆変換を適用する関数
 * @param point - 逆変換対象の点
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
