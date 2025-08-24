// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Diagram features for TextArea nodes.
 */
export const TextAreaNodeFeatures = {
	transformative: true,
	itemable: true,
	connectable: true,
	strokable: true,
	fillable: true,
	selectable: true,
	textable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the TextAreaNode data.
 */
export type TextAreaNodeData = CreateDataType<typeof TextAreaNodeFeatures> & {
	type: "TextAreaNode";
};
