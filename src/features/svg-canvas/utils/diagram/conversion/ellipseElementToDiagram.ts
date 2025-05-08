import {
	createEllipseData,
	type EllipseData,
} from "../../../components/shapes/Ellipse";

/**
 * SVGEllipseElementをEllipseDataに変換する
 *
 * @param element - 変換対象のSVGEllipseElement
 * @returns 変換後のEllipseData
 */
export const ellipseElementToDiagram = (
	element: SVGEllipseElement,
): EllipseData => {
	const cx = Number(element.getAttribute("cx"));
	const cy = Number(element.getAttribute("cy"));
	const rx = Number(element.getAttribute("rx"));
	const ry = Number(element.getAttribute("ry"));

	if (
		Number.isNaN(cx) ||
		Number.isNaN(cy) ||
		Number.isNaN(rx) ||
		Number.isNaN(ry)
	) {
		throw new Error("Unsupported SVGEllipseElement attribute was found.");
	}

	return createEllipseData({
		x: cx,
		y: cy,
		width: rx * 2,
		height: ry * 2,
		fill: element.getAttribute("fill") || "transparent",
		stroke: element.getAttribute("stroke") || "transparent",
		strokeWidth: element.getAttribute("stroke-width") || "0",
	});
};
