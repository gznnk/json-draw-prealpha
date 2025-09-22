import { createSvgState } from "./createSvgState";

/**
 * Creates svg state from an SVG text string.
 *
 * @param data - The SVG text
 * @returns The created SvgState or undefined if parsing fails
 */
export const createSvgStateFromText = (data: string) => {
	try {
		return createSvgState({
			x: 0,
			y: 0,
			svgText: data,
			width: 100,
			height: 100,
			keepProportion: true,
		});
	} catch (e) {
		console.error("Error parsing SVG data:", e);
		return undefined;
	}
};
