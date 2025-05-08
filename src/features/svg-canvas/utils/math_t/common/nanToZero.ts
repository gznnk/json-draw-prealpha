/**
 * Nandであれば0に変換する
 *
 * @param value - 変換対象の数値
 * @returns 変換後の数値
 */
export const nanToZero = (value: number): number => {
	return Number.isNaN(value) ? 0 : value;
};
