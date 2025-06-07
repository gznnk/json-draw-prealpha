// Import types.
import type { Diagram } from "../../catalog/DiagramTypes";
import type { ImageData } from "../../types/data/shapes/ImageData";

/**
 * Type guard to check if a diagram is an image data object.
 *
 * @param data - The diagram to check
 * @returns True if the diagram is an image data object
 */
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
