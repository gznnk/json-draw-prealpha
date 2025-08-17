// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Diagram features for WebSearch nodes.
 */
export const WebSearchNodeFeatures = {
	transformative: true,
	connectable: true,
	selectable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the WebSearchNode data.
 */
export type WebSearchNodeData = Omit<RectangleData, "type"> & {
	type: "WebSearchNode";
};
