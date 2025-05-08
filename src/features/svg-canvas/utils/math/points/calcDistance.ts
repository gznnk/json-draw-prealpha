/**
 * ２点間のユークリッド距離を算出する
 *
 * @param x1 - 1つ目の点のX座標
 * @param y1 - 1つ目の点のY座標
 * @param x2 - 2つ目の点のX座標
 * @param y2 - 2つ目の点のY座標
 * @returns ２点間の距離
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
