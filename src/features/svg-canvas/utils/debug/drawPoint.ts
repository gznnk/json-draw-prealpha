import type { Point } from "../../types/base";

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
