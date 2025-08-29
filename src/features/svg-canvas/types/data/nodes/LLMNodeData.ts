// Import types related to SvgCanvas.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { CreateDataType } from "../shapes/CreateDataType";

/**
 * Diagram features for LLM nodes.
 */
export const LLMNodeFeatures = {
	frameable: true,
	transformative: true,
	connectable: true,
	strokable: true,
	fillable: true,
	cornerRoundable: false,
	textable: true,
	selectable: true,
	executable: true,
} as const satisfies DiagramFeatures;

/**
 * Type of the LLM node data.
 */
export type LLMNodeData = CreateDataType<typeof LLMNodeFeatures> & {
	type: "LLMNode";
};