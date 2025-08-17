// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Diagram features for Hub nodes.
 */
export const HubNodeFeatures = {
	transformative: true,
	connectable: true,
	selectable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the hub node data.
 */
export type HubNodeData = Omit<RectangleData, "type"> & {
	type: "HubNode";
};
