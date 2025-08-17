// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Diagram features for ImageGen nodes.
 */
export const ImageGenNodeFeatures = {
	transformative: true,
	connectable: true,
	selectable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the ImageGenNode data.
 */
export type ImageGenNodeData = Omit<RectangleData, "type"> & {
	type: "ImageGenNode";
};
