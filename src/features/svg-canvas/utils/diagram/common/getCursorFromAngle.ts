/**
 * 角度に対応するカーソルを取得する
 *
 * @param angle - 角度
 * @returns カーソルスタイル
 */
export const getCursorFromAngle = (angle: number): string => {
	// angleに360度を加算して0度以上にする
	const _angle = (angle + 360) % 360;

	if (-22.5 <= _angle && _angle < 22.5) {
		return "n-resize";
	}
	if (22.5 <= _angle && _angle < 67.5) {
		return "ne-resize";
	}
	if (67.5 <= _angle && _angle < 112.5) {
		return "e-resize";
	}
	if (112.5 <= _angle && _angle < 157.5) {
		return "se-resize";
	}
	if (157.5 <= _angle && _angle < 202.5) {
		return "s-resize";
	}
	if (202.5 <= _angle && _angle < 247.5) {
		return "sw-resize";
	}
	if (247.5 <= _angle && _angle < 292.5) {
		return "w-resize";
	}
	if (292.5 <= _angle && _angle < 337.5) {
		return "nw-resize";
	}
	return "n-resize";
};
