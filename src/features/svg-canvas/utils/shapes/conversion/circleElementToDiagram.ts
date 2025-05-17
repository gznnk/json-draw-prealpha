import { createEllipseData } from "../ellipse/createEllipseData";

// Import types.
import type { EllipseData } from "../../../types/data/shapes/EllipseData";

/**
 * Converts an SVG Circle element to an Ellipse diagram data structure.
 *
 * @param element - The SVG Circle element to convert
 * @returns The converted Ellipse diagram data
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
