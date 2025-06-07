// Import types.
import type { Diagram } from "../../../catalog/DiagramTypes";

// Import utils.
import { isImageData } from "../../../utils/validation/isImageData";

/**
 * Converts image data to a Blob.
 *
 * @param data - The diagram containing image data
 * @returns A Blob representing the image or undefined if not valid
 */
export const imageToBlob = (data: Diagram): Blob | undefined => {
	if (!isImageData(data)) return undefined;

	// 1. base64 → バイナリ文字列
	const binary = atob(data.base64Data.replace(/\s/g, ""));

	// 2. バイナリ文字列 → Uint8Array
	const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));

	// 3. Blob 化
	return new Blob([bytes], { type: "image/png" });
};
