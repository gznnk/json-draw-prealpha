// Import types.
import type { ImageData } from "../../../types/data/shapes/ImageData";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";

// Import constants from Image component.
import { DEFAULT_IMAGE_DATA } from "../../../constants/DefaultData";

/**
 * Creates image data with the specified properties.
 *
 * @param params - Image parameters including position, size and image data
 * @returns The created image data object
 */
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
}): ImageData => {
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
