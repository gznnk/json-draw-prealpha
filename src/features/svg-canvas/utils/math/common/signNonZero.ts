/**
 * 数値が0以上なら1、0未満なら-1を返す
 *
 * @param value - 数値
 * @returns - 結果
 */
export const signNonZero = (value: number): number => {
	return value >= 0 ? 1 : -1;
};
