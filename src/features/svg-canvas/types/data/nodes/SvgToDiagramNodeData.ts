// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Diagram features for SvgToDiagram nodes.
 */
export const SvgToDiagramNodeFeatures = {
	transformative: true,
	connectable: true,
	selectable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the SvgToDiagramNode data.
 */
export type SvgToDiagramNodeData = Omit<RectangleData, "type"> & {
	type: "SvgToDiagramNode";
};
