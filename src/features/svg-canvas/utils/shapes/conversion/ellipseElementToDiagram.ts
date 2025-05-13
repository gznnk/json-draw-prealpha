// TODO: 依存関係
import { createEllipseData } from "../../../components/shapes/Ellipse";

// Import types.
import type { EllipseData } from "../../../types";

/**
 * Converts an SVG Ellipse element to an Ellipse diagram data structure.
 *
 * @param element - The SVG Ellipse element to convert
 * @returns The converted Ellipse diagram data
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
