import type {
	GroupData,
	SelectableData,
	Shape,
	TransformativeData,
} from "../types/DiagramTypes";

/**
 * 新規IDを生成する
 *
 * @returns 新規ID
 */
export const newId = (): string => crypto.randomUUID();

/**
 * 指定されたパラメータからSVGのtransform属性を作成する
 *
 * @param {number} sx - x方向の拡大縮小率
 * @param {number} sy - y方向の拡大縮小率
 * @param {number} theta - 回転角度（ラジアン）
 * @param {number} tx - x方向の平行移動量
 * @param {number} ty - y方向の平行移動量
 * @returns {string} SVGのtransform属性
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

/**
 * 角度に対応するカーソルを取得する
 *
 * @param angle - 角度
 * @returns - カーソル
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

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isShape = (obj: any): obj is Shape => {
	return (
		obj &&
		typeof obj.x === "number" &&
		typeof obj.y === "number" &&
		typeof obj.width === "number" &&
		typeof obj.height === "number" &&
		typeof obj.rotation === "number" &&
		typeof obj.scaleX === "number" &&
		typeof obj.scaleY === "number"
	);
};

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isSelectableData = (obj: any): obj is SelectableData => {
	return obj && typeof obj.isSelected === "boolean";
};

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isItemableData = (obj: any): obj is GroupData => {
	return obj && Array.isArray(obj.items);
};

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isTransformativeData = (obj: any): obj is TransformativeData => {
	return (
		obj &&
		typeof obj.x === "number" &&
		typeof obj.y === "number" &&
		typeof obj.width === "number" &&
		typeof obj.height === "number" &&
		typeof obj.rotation === "number" &&
		typeof obj.scaleX === "number" &&
		typeof obj.scaleY === "number" &&
		typeof obj.keepProportion === "boolean"
	);
};
