import type { ImageGenNodeData } from "../../../types/data/nodes/ImageGenNodeData";
import { RectangleDefaultData } from "../shapes/RectangleDefaultData";

/**
 * Default image generation node data template.
 * Used for State to Data conversion mapping.
 */
export const ImageGenNodeDefaultData = {
	...RectangleDefaultData,
	type: "ImageGenNode",
} as const satisfies ImageGenNodeData;