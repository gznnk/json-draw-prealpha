// Import types.
import type { PathData, PathPointData } from "../../../types";

// Import utils.
import { newId } from "../common/newId";

// Import constants.
import { DEFAULT_PATH_DATA } from "../../../components/shapes/Path/Path/PathConstants";

/**
 * Converts an SVG Line element to a Path diagram data structure.
 *
 * @param element - The SVG Line element to convert
 * @returns The converted Path diagram data
 */
export const lineElementToDiagram = (element: SVGLineElement): PathData => {
	const x1 = Number(element.getAttribute("x1"));
	const y1 = Number(element.getAttribute("y1"));
	const x2 = Number(element.getAttribute("x2"));
	const y2 = Number(element.getAttribute("y2"));

	if (
		Number.isNaN(x1) ||
		Number.isNaN(y1) ||
		Number.isNaN(x2) ||
		Number.isNaN(y2)
	) {
		throw new Error("Unsupported SVGLineElement attribute was found.");
	}

	return {
		...DEFAULT_PATH_DATA,
		id: newId(),
		type: "Path",
		x: (x1 + x2) / 2,
		y: (y1 + y2) / 2,
		width: Math.abs(x2 - x1),
		height: Math.abs(y2 - y1),
		stroke: element.getAttribute("stroke") || "transparent",
		strokeWidth: element.getAttribute("stroke-width") || "0",
		items: [
			{
				id: newId(),
				type: "PathPoint",
				x: x1,
				y: y1,
				hidden: false,
			},
			{
				id: newId(),
				type: "PathPoint",
				x: x2,
				y: y2,
				hidden: false,
			},
		] as PathPointData[],
	} as PathData;
};
