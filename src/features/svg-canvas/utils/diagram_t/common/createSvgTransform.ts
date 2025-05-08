/**
 * 指定されたパラメータからSVGのtransform属性を作成する
 *
 * @param sx - x方向の拡大縮小率
 * @param sy - y方向の拡大縮小率
 * @param theta - 回転角度（ラジアン）
 * @param tx - x方向の平行移動量
 * @param ty - y方向の平行移動量
 * @returns SVGのtransform属性
 */
export const createSvgTransform = (
	sx: number,
	sy: number,
	theta: number,
	tx: number,
	ty: number,
): string => {
	const cosTheta = Math.cos(theta);
	const sinTheta = Math.sin(theta);

	const a = sx * cosTheta;
	const b = sx * sinTheta;
	const c = -sy * sinTheta;
	const d = sy * cosTheta;
	const e = tx;
	const f = ty;

	return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
};
