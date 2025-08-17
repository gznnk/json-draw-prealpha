// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Diagram features for Agent nodes.
 */
export const AgentNodeFeatures = {
	transformative: true,
	connectable: true,
	selectable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the AgentNode data.
 */
export type AgentNodeData = Omit<RectangleData, "type"> & {
	type: "AgentNode";
};
