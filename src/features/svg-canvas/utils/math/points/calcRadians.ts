/**
 * ２点間の角度を算出する.
 * 時計の12時を0度とし、時計回りに角度を算出する.
 *
 * @param ox - 原点のX座標
 * @param oy - 原点のY座標
 * @param px - 動点のX座標
 * @param py - 動点のY座標
 * @returns ２点間の角度（ラジアン）
 */
export const calcRadians = (
	ox: number,
	oy: number,
	px: number,
	py: number,
): number => {
	const dx = px - ox;
	const dy = oy - py; // y軸の正方向を上向きにするため反転

	let angle = Math.atan2(dx, dy); // atan2(y, x)ではなく(x, y)とすることで12時基準に

	if (angle < 0) {
		angle += 2 * Math.PI; // 0 〜 2π の範囲に変換
	}

	return angle;
};
