// TODO: 依存関係
import {
	createEllipseData,
	type EllipseData,
} from "../../../components/shapes/Ellipse";

/**
 * SVGCircleElementをEllipseDataに変換する
 *
 * @param element - 変換対象のSVGCircleElement
 * @returns 変換後のEllipseData
 */
export const circleElementToDiagram = (
	element: SVGCircleElement,
): EllipseData => {
	const cx = Number(element.getAttribute("cx"));
	const cy = Number(element.getAttribute("cy"));
	const r = Number(element.getAttribute("r"));

	if (Number.isNaN(cx) || Number.isNaN(cy) || Number.isNaN(r)) {
		throw new Error("Unsupported SVGCircleElement attribute was found.");
	}

	return createEllipseData({
		x: cx,
		y: cy,
		width: r * 2,
		height: r * 2,
		fill: element.getAttribute("fill") || "transparent",
		stroke: element.getAttribute("stroke") || "transparent",
		strokeWidth: element.getAttribute("stroke-width") || "0",
	});
};
