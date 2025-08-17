// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Diagram features for VectorStore nodes.
 */
export const VectorStoreNodeFeatures = {
	transformative: true,
	connectable: true,
	selectable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the VectorStoreNode data.
 */
export type VectorStoreNodeData = Omit<RectangleData, "type"> & {
	type: "VectorStoreNode";
};
