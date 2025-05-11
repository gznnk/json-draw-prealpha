// Import functions related to SvgCanvas.
import type { Diagram } from "../../../catalog";
import { newId } from "../../../utils/diagram";

// Imports related to this component.
import { DEFAULT_IMAGE_DATA } from "./ImageConstants";
import type { ImageData } from "../../../types/data";

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

export const isImageData = (data: Diagram): data is ImageData => {
	return (
		typeof data === "object" &&
		data !== null &&
		"type" in data &&
		data.type === "Image" &&
		"width" in data &&
		"height" in data &&
		"base64Data" in data
	);
};

export const imageToBlob = (data: Diagram) => {
	if (!isImageData(data)) return undefined;

	// 1. base64 → バイナリ文字列
	const binary = atob(data.base64Data.replace(/\s/g, ""));

	// 2. バイナリ文字列 → Uint8Array
	const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));

	// 3. Blob 化
	return new Blob([bytes], { type: "image/png" });
};
