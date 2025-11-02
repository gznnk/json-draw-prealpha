import type { ArrowHeadType } from "../../../types/core/ArrowHeadType";

/**
 * Helper function to get marker URL for SVG attributes.
 * @param type - The arrow head type
 * @returns The marker URL string or undefined if type is None or undefined
 */
export const getMarkerUrl = (
	type: ArrowHeadType | undefined,
): string | undefined => {
	if (!type || type === "None") {
		return undefined;
	}

	if (type === "Triangle") {
		return "url(#marker-triangle)";
	}
	if (type === "ConcaveTriangle") {
		return "url(#marker-concave-triangle)";
	}
	if (type === "Circle") {
		return "url(#marker-circle)";
	}

	return undefined;
};
