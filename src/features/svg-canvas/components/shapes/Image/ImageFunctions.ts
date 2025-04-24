// Import functions related to SvgCanvas.
import { newId } from "../../../utils/Diagram";

// Imports related to this component.
import { DEFAULT_IMAGE_DATA } from "./ImageConstants";
import type { ImageData } from "./ImageTypes";

export const createImageData = ({
	x,
	y,
	width = 100,
	height = 100,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
	keepProportion = true,
	base64Data = "",
}: {
	x: number;
	y: number;
	width?: number;
	height?: number;
	radius?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	keepProportion?: boolean;
	base64Data?: string;
}) => {
	return {
		...DEFAULT_IMAGE_DATA,
		id: newId(),
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		keepProportion,
		base64Data,
	} as ImageData;
};
