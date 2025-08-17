// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Diagram features for TextArea nodes.
 */
export const TextAreaNodeFeatures = {
	transformative: true,
	connectable: true,
	selectable: true,
	textable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the TextAreaNode data.
 */
export type TextAreaNodeData = Omit<RectangleData, "type"> & {
	type: "TextAreaNode";
};
