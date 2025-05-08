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
