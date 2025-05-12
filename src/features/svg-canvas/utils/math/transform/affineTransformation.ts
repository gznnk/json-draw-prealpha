// Import types.
import type { Point } from "../../../types";

/**
 * Applies an affine transformation to a point.
 *
 * @param px - X-coordinate of the point to transform
 * @param py - Y-coordinate of the point to transform
 * @param sx - Scale factor in x-direction
 * @param sy - Scale factor in y-direction
 * @param theta - Rotation angle in radians
 * @param tx - Translation distance in x-direction
 * @param ty - Translation distance in y-direction
 * @returns The transformed point
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
