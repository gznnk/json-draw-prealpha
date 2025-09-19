import type { Diagram } from "../../types/state/core/Diagram";
import type { ImageState } from "../../types/state/shapes/ImageState";

/**
 * Type guard to check if a diagram is an image data object.
 *
 * @param data - The diagram to check
 * @returns True if the diagram is an image data object
 */
export const isImageState = (data: Diagram): data is ImageState => {
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
