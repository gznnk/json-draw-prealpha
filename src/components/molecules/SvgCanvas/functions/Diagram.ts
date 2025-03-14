import type { Point } from "../types/CoordinateTypes";

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

/**
 * 点を描画する（開発用）
 *
 * @param id - ID
 * @param point - 座標
 * @param color - 色
 */
export const drawPoint = (id: string, point: Point, color = "red") => {
	const svg = document.getElementsByTagName("svg")[0];
	const elm = svg.getElementById(id);
	if (elm) {
		elm.setAttribute("cx", point.x.toString());
		elm.setAttribute("cy", point.y.toString());
	} else {
		const circle = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"circle",
		);
		circle.setAttribute("id", id);
		circle.setAttribute("cx", point.x.toString());
		circle.setAttribute("cy", point.y.toString());
		circle.setAttribute("r", "5");
		circle.setAttribute("fill", color);
		circle.setAttribute("pointer-events", "none");
		svg.appendChild(circle);
	}
};

/**
 * 短径を描画する（開発用）
 *
 * @param id - ID
 * @param p1 - 点1
 * @param p2 - 点2
 * @param p3 - 点3
 * @param p4 - 点4
 * @param color - 色
 */
export const drawRect = (
	id: string,
	p1: Point,
	p2: Point,
	p3: Point,
	p4: Point,
	color = "red",
) => {
	const svg = document.getElementsByTagName("svg")[0];
	const elm = svg.getElementById(id);
	if (elm) {
		elm.setAttribute(
			"points",
			`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`,
		);
	} else {
		const polygon = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"polygon",
		);
		polygon.setAttribute("id", id);
		polygon.setAttribute(
			"points",
			`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`,
		);
		polygon.setAttribute("stroke", color);
		polygon.setAttribute("fill", "transparent");
		polygon.setAttribute("pointer-events", "none");
		svg.appendChild(polygon);
	}
};
