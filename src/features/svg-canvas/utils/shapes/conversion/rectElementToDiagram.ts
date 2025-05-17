import { createRectangleData } from "../rectangle/createRectangleData";

// Import types.
import type { RectangleData } from "../../../types/data/shapes/RectangleData";

/**
 * Converts an SVG Rectangle element to a Rectangle diagram data structure.
 *
 * @param element - The SVG Rectangle element to convert
 * @returns The converted Rectangle diagram data
 */
export const rectElementToDiagram = (
	element: SVGRectElement,
): RectangleData => {
	const x = Number(element.getAttribute("x"));
	const y = Number(element.getAttribute("y"));
	const width = Number(element.getAttribute("width"));
	const height = Number(element.getAttribute("height"));

	if (
		Number.isNaN(x) ||
		Number.isNaN(y) ||
		Number.isNaN(width) ||
		Number.isNaN(height)
	) {
		throw new Error("Unsupported SVGRectElement attribute was found.");
	}

	return createRectangleData({
		x: x + width / 2,
		y: y + height / 2,
		width,
		height,
		fill: element.getAttribute("fill") || "transparent",
		stroke: element.getAttribute("stroke") || "transparent",
		strokeWidth: element.getAttribute("stroke-width") || "0",
	});
};
