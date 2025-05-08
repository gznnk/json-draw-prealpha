/**
 * ラジアンを度に変換する
 *
 * @param radians - ラジアン
 * @returns 度
 */
export const radiansToDegrees = (radians: number): number => {
	return radians * (180 / Math.PI);
};
