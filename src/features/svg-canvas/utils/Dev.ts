import type { Point } from "../types/CoordinateTypes";

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
