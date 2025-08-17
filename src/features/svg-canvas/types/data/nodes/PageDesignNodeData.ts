// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Diagram features for PageDesign nodes.
 */
export const PageDesignNodeFeatures = {
	transformative: true,
	connectable: true,
	selectable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the PageDesignNode data.
 */
export type PageDesignNodeData = Omit<RectangleData, "type"> & {
	type: "PageDesignNode";
};
