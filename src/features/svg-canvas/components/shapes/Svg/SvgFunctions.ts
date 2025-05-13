// Import functions related to SvgCanvas.
import type { Diagram } from "../../../catalog";
import { newId } from "../../../utils/shapes";

// Imports related to this component.
import { DEFAULT_SVG_DATA } from "./SvgConstants";
import type { SvgData } from "../../../types/data";

export const createSvgData = ({
	x,
	y,
	svgText,
	width = 100,
	height = 100,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
	keepProportion = false,
}: {
	x: number;
	y: number;
	svgText: string;
	width?: number;
	height?: number;
	radius?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	keepProportion?: boolean;
}) => {
	return {
		...DEFAULT_SVG_DATA,
		id: newId(),
		x,
		y,
		svgText,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		keepProportion,
		initialWidth: width,
		initialHeight: height,
	} as SvgData;
};

export const createSvgDataFromText = (data: string) => {
	try {
		return createSvgData({
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

export const isSvgData = (data: unknown): data is SvgData => {
	return (
		typeof data === "object" &&
		data !== null &&
		"type" in data &&
		data.type === "Svg" &&
		"svgText" in data &&
		"width" in data &&
		"height" in data &&
		"initialWidth" in data &&
		"initialHeight" in data
	);
};

export const svgToBlob = (data: Diagram): Blob | undefined => {
	if (isSvgData(data)) {
		return new Blob([data.svgText], {
			type: "image/svg+xml",
		});
	}
	return undefined;
};
